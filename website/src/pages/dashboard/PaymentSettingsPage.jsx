import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { SubscriptionManager } from '../../components/payment';
import { PaymentMethodForm } from '../../components/payment';
import { useAuth } from '../../context/AuthContext';

// Load Stripe outside of component render to avoid recreating Stripe object on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentSettingsPage = () => {
  const { currentUser } = useAuth();
  const [showAddCard, setShowAddCard] = useState(false);
  
  const handleSavePaymentMethod = () => {
    setShowAddCard(false);
    // Reload payment methods
  };
  
  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payment Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your subscription and payment methods
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Subscription Management */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription</h2>
          <SubscriptionManager />
        </div>
        
        {/* Payment Methods */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h2>
          
          {showAddCard ? (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Add New Payment Method</h3>
              <Elements stripe={stripePromise}>
                <PaymentMethodForm 
                  onSave={handleSavePaymentMethod} 
                  onCancel={() => setShowAddCard(false)} 
                />
              </Elements>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Add a payment method to manage your subscription or make one-time payments.
              </p>
              <button
                onClick={() => setShowAddCard(true)}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Payment Method
              </button>
            </div>
          )}
        </div>
        
        {/* Billing History */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Billing History</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <p className="text-gray-700">
                Your billing history and invoices will appear here once you have an active subscription.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettingsPage;