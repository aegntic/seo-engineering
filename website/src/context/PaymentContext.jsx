import React, { createContext, useState, useContext, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAuth } from './AuthContext';

// Initialize Stripe outside of components to avoid recreating during re-renders
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Create context
const PaymentContext = createContext();

// Custom hook to use payment context
export const usePayment = () => {
  return useContext(PaymentContext);
};

// Provider component
export const PaymentProvider = ({ children }) => {
  const { currentUser, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [prices, setPrices] = useState({
    basic: {
      monthly: 49,
      yearly: 490,
      features: [
        'Up to 5 websites',
        'Basic SEO audits',
        'Manual implementation',
        'Email support'
      ]
    },
    professional: {
      monthly: 99,
      yearly: 990,
      features: [
        'Up to 15 websites',
        'Advanced SEO audits',
        'Semi-automated implementation',
        'Priority email support',
        'Weekly reports'
      ]
    },
    enterprise: {
      monthly: 199,
      yearly: 1990,
      features: [
        'Unlimited websites',
        'Comprehensive SEO audits',
        'Fully automated implementation',
        'Dedicated support manager',
        'Custom reporting',
        'API access'
      ]
    }
  });

  // Fetch subscription data when user changes
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!currentUser || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/payments/subscription/${currentUser._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        } else {
          // User might not have a subscription yet
          setSubscription(null);
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [currentUser, token]);

  // Create Stripe customer
  const createCustomer = async () => {
    try {
      const response = await fetch('/api/payments/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: currentUser._id })
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      const data = await response.json();
      return data.customerId;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  };

  // Create subscription
  const createSubscription = async (paymentMethodId, priceId, planType) => {
    try {
      // Ensure user has a customer ID
      let customerId = currentUser.stripeCustomerId;
      if (!customerId) {
        const customerData = await createCustomer();
        customerId = customerData.customerId;
      }

      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customerId,
          paymentMethodId,
          priceId,
          planType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  };

  // Cancel subscription
  const cancelSubscription = async (subscriptionId) => {
    try {
      const response = await fetch(`/api/payments/subscription/${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      // Update local state
      if (subscription) {
        setSubscription({
          ...subscription,
          cancelAtPeriodEnd: true
        });
      }

      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  };

  // Update subscription (change plan)
  const updateSubscription = async (subscriptionId, newPriceId, planType) => {
    try {
      const response = await fetch(`/api/payments/subscription/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newPriceId,
          planType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      // Update local state
      if (subscription) {
        setSubscription({
          ...subscription,
          plan: planType
        });
      }

      return true;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  };

  // Create payment intent for one-time payment
  const createPaymentIntent = async (amount, currency = 'usd') => {
    try {
      // Ensure user has a customer ID
      let customerId = currentUser.stripeCustomerId;
      if (!customerId) {
        const customerData = await createCustomer();
        customerId = customerData.customerId;
      }

      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          currency,
          customerId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return data.clientSecret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  };

  // Provide value to consumers
  const value = {
    loading,
    subscription,
    prices,
    createSubscription,
    cancelSubscription,
    updateSubscription,
    createPaymentIntent
  };

  return (
    <PaymentContext.Provider value={value}>
      <Elements stripe={stripePromise}>
        {children}
      </Elements>
    </PaymentContext.Provider>
  );
};

export default PaymentContext;