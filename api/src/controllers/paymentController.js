const Payment = require('../models/Payment');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a stripe customer
exports.createCustomer = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user._id.toString()
      }
    });

    // Update user with Stripe customer ID
    user.stripeCustomerId = customer.id;
    await user.save();

    res.status(201).json({ customerId: customer.id });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Error creating customer', error: error.message });
  }
};

// Create a subscription
exports.createSubscription = async (req, res) => {
  try {
    const { customerId, paymentMethodId, priceId, planType } = req.body;

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    
    // Set the default payment method for the customer
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });

    // Get user from Stripe customer ID
    const user = await User.findOne({ stripeCustomerId: customerId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create payment record in our database
    const payment = new Payment({
      user: user._id,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      plan: planType,
      status: subscription.status,
      amount: subscription.items.data[0].price.unit_amount / 100, // Convert from cents
      currency: subscription.items.data[0].price.currency,
      interval: subscription.items.data[0].price.recurring.interval,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      paymentMethod: paymentMethodId
    });

    await payment.save();

    // Update user's plan
    user.plan = planType;
    user.isSubscribed = true;
    await user.save();

    res.status(201).json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionStatus: subscription.status
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Error creating subscription', error: error.message });
  }
};

// Cancel a subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    // Cancel the subscription at period end
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    // Update our database
    const payment = await Payment.findOne({ stripeSubscriptionId: subscriptionId });
    if (payment) {
      payment.cancelAtPeriodEnd = true;
      await payment.save();
    }

    res.status(200).json({ message: 'Subscription scheduled for cancellation at period end' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ message: 'Error canceling subscription', error: error.message });
  }
};

// Get subscription details
exports.getSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const payment = await Payment.findOne({ user: userId }).sort({ createdAt: -1 });
    
    if (!payment) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    // Get updated details from Stripe
    const subscription = await stripe.subscriptions.retrieve(payment.stripeSubscriptionId);
    
    // Update our records with the latest from Stripe
    payment.status = subscription.status;
    payment.currentPeriodStart = new Date(subscription.current_period_start * 1000);
    payment.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    payment.cancelAtPeriodEnd = subscription.cancel_at_period_end;
    await payment.save();

    res.status(200).json({
      plan: payment.plan,
      status: payment.status,
      currentPeriodEnd: payment.currentPeriodEnd,
      cancelAtPeriodEnd: payment.cancelAtPeriodEnd
    });
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    res.status(500).json({ message: 'Error retrieving subscription', error: error.message });
  }
};

// Update a subscription (change plan)
exports.updateSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { newPriceId, planType } = req.body;
    
    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Update the subscription
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
    });

    // Update our database
    const payment = await Payment.findOne({ stripeSubscriptionId: subscriptionId });
    if (payment) {
      payment.plan = planType;
      payment.amount = updatedSubscription.items.data[0].price.unit_amount / 100;
      await payment.save();

      // Update user's plan
      const user = await User.findById(payment.user);
      if (user) {
        user.plan = planType;
        await user.save();
      }
    }

    res.status(200).json({ message: 'Subscription updated successfully' });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: 'Error updating subscription', error: error.message });
  }
};

// Create payment intent for one-time payment
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', customerId } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      customer: customerId,
      payment_method_types: ['card'],
    });

    res.status(201).json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Error creating payment intent', error: error.message });
  }
};

// Webhook handler for Stripe events
exports.handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody, // ensure express is configured to provide raw body for webhook
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    // Add more events as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
};

// Helper functions for webhook events
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    // Update payment record with new invoice
    const payment = await Payment.findOne({ stripeSubscriptionId: invoice.subscription });
    if (payment) {
      payment.invoices.push({
        invoiceId: invoice.id,
        amount: invoice.amount_paid / 100,
        status: 'paid',
        date: new Date(invoice.created * 1000),
        pdfUrl: invoice.invoice_pdf
      });
      await payment.save();
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice) {
  try {
    // Update payment status
    const payment = await Payment.findOne({ stripeSubscriptionId: invoice.subscription });
    if (payment) {
      payment.status = 'past_due';
      payment.invoices.push({
        invoiceId: invoice.id,
        amount: invoice.amount_due / 100,
        status: 'failed',
        date: new Date(invoice.created * 1000),
        pdfUrl: invoice.invoice_pdf
      });
      await payment.save();
    }
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    // Update payment and user records
    const payment = await Payment.findOne({ stripeSubscriptionId: subscription.id });
    if (payment) {
      payment.status = 'canceled';
      await payment.save();

      // Update user's subscription status
      const user = await User.findById(payment.user);
      if (user) {
        user.isSubscribed = false;
        await user.save();
      }
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    // Update payment record
    const payment = await Payment.findOne({ stripeSubscriptionId: subscription.id });
    if (payment) {
      payment.status = subscription.status;
      payment.currentPeriodStart = new Date(subscription.current_period_start * 1000);
      payment.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      payment.cancelAtPeriodEnd = subscription.cancel_at_period_end;
      await payment.save();
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}