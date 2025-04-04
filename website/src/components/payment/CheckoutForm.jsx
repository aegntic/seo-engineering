import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext';
import { usePayment } from '../../context/PaymentContext';

const CheckoutForm = ({ planType, priceId, amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { currentUser } = useAuth();
  const { createSubscription } = usePayment();
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          email: currentUser.email,
          name: currentUser.name
        }
      });
      
      if (paymentMethodError) {
        setError(paymentMethodError.message);
        setProcessing(false);
        return;
      }
      
      // Create subscription
      const subscriptionResponse = await createSubscription(
        paymentMethod.id,
        priceId,
        planType
      );
      
      // If subscription requires further action, handle it
      if (subscriptionResponse.subscriptionStatus === 'incomplete') {
        const { error: confirmError } = await stripe.confirmCardPayment(
          subscriptionResponse.clientSecret
        );
        
        if (confirmError) {
          setError(confirmError.message);
          setProcessing(false);
          return;
        }
      }
      
      // If we got here, the payment was successful
      setSucceeded(true);
      setProcessing(false);
      
      // Call the success callback
      if (onSuccess) {
        onSuccess(subscriptionResponse);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during checkout.');
      setProcessing(false);
    }
  };
  
  const cardElementOptions = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Card Details</label>
        <div className="mt-1 p-3 border border-gray-300 rounded-md shadow-sm">
          <CardElement options={cardElementOptions} />
        </div>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={processing || !stripe || succeeded}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {processing ? 'Processing...' : succeeded ? 'Subscribed!' : `Pay $${amount}`}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={processing || succeeded}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;