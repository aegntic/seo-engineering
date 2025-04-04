import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePayment } from '../../context/PaymentContext';

const SubscriptionManager = () => {
  const { currentUser } = useAuth();
  const { subscription, prices, cancelSubscription, loading } = usePayment();
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');
  
  if (loading) {
    return (
      <div className="p-8 bg-white shadow rounded-lg">
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }
  
  if (!subscription) {
    return (
      <div className="p-8 bg-white shadow rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">No Active Subscription</h3>
          <p className="mt-2 text-sm text-gray-500">
            You don't have an active subscription. Check out our pricing plans to get started.
          </p>
          <a
            href="/pricing"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Plans
          </a>
        </div>
      </div>
    );
  }
  
  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription(subscription.id);
      setCancelMessage('Your subscription has been scheduled for cancellation at the end of the current billing period.');
      setIsConfirmingCancel(false);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setCancelMessage('Failed to cancel subscription. Please try again or contact support.');
    }
  };
  
  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Function to get plan features
  const getPlanFeatures = () => {
    if (subscription && subscription.plan && prices[subscription.plan]) {
      return prices[subscription.plan].features;
    }
    return [];
  };
  
  return (
    <div className="p-8 bg-white shadow rounded-lg">
      <h3 className="text-lg font-medium text-gray-900">Current Subscription</h3>
      
      {cancelMessage && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          {cancelMessage}
        </div>
      )}
      
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 capitalize">{subscription.plan} Plan</h4>
            
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium text-gray-900 capitalize">
                  {subscription.status}
                  {subscription.cancelAtPeriodEnd && ' (Cancels at period end)'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Current Period Ends</p>
                <p className="font-medium text-gray-900">
                  {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
              
              {!subscription.cancelAtPeriodEnd && (
                <div className="pt-4">
                  {isConfirmingCancel ? (
                    <div className="space-y-4">
                      <p className="text-sm text-red-600">
                        Are you sure you want to cancel? Your subscription will remain active until the end of the current billing period.
                      </p>
                      <div className="flex space-x-4">
                        <button
                          onClick={handleCancelSubscription}
                          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Yes, Cancel Subscription
                        </button>
                        <button
                          onClick={() => setIsConfirmingCancel(false)}
                          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          No, Keep Subscription
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsConfirmingCancel(true)}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900">Plan Features</h4>
            
            <ul className="mt-4 space-y-2">
              {getPlanFeatures().map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-2 text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-6">
              <a
                href="/pricing"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Compare plans
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;