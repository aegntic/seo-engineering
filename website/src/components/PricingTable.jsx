import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePayment } from '../context/PaymentContext';

const PricingTable = () => {
  const { currentUser } = useAuth();
  const { prices, subscription } = usePayment();
  const [billingCycle, setBillingCycle] = useState('monthly');
  
  const getPlanPrice = (plan) => {
    return prices[plan][billingCycle];
  };
  
  const getDiscount = (plan) => {
    const monthlyPrice = prices[plan].monthly;
    const yearlyPrice = prices[plan].yearly;
    return Math.round(100 - (yearlyPrice / (monthlyPrice * 12)) * 100);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="sm:flex sm:flex-col sm:align-center">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-center">Pricing Plans</h1>
        <p className="mt-5 text-xl text-gray-500 sm:text-center">
          Choose the perfect plan for your SEO automation needs
        </p>
        
        {/* Billing toggle */}
        <div className="relative mt-6 bg-gray-100 rounded-lg p-0.5 flex self-center">
          <button
            type="button"
            className={`relative py-2 px-6 border-transparent rounded-md text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 ${
              billingCycle === 'monthly'
                ? 'bg-white border-gray-200 shadow-sm text-gray-900'
                : 'text-gray-700'
            }`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`relative py-2 px-6 border-transparent rounded-md text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 ${
              billingCycle === 'yearly'
                ? 'bg-white border-gray-200 shadow-sm text-gray-900'
                : 'text-gray-700'
            }`}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly <span className="text-indigo-500">(Save up to {getDiscount('enterprise')}%)</span>
          </button>
        </div>
      </div>

      <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:gap-8">
        {/* Basic Plan */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Basic</h2>
            <p className="mt-4 text-sm text-gray-500">Perfect for small businesses and individual websites.</p>
            <p className="mt-8">
              <span className="text-4xl font-extrabold text-gray-900">${getPlanPrice('basic')}</span>
              <span className="text-base font-medium text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'year'}</span>
            </p>
            {subscription?.plan === 'basic' ? (
              <button
                disabled
                className="mt-8 block w-full bg-indigo-50 border border-indigo-500 rounded-md py-2 text-sm font-semibold text-indigo-700 text-center"
              >
                Current Plan
              </button>
            ) : (
              <Link
                to={currentUser ? "/dashboard/settings" : "/signup?plan=basic"}
                className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700"
              >
                {currentUser ? "Upgrade" : "Get Started"}
              </Link>
            )}
          </div>
          <div className="pt-6 pb-8 px-6">
            <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
            <ul className="mt-6 space-y-4">
              {prices.basic.features.map((feature, index) => (
                <li key={index} className="flex space-x-3">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-green-500"
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
                  <span className="text-sm text-gray-500">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Professional Plan */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Professional</h2>
            <p className="mt-4 text-sm text-gray-500">Great for growing businesses with multiple sites.</p>
            <p className="mt-8">
              <span className="text-4xl font-extrabold text-gray-900">${getPlanPrice('professional')}</span>
              <span className="text-base font-medium text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'year'}</span>
            </p>
            {subscription?.plan === 'professional' ? (
              <button
                disabled
                className="mt-8 block w-full bg-indigo-50 border border-indigo-500 rounded-md py-2 text-sm font-semibold text-indigo-700 text-center"
              >
                Current Plan
              </button>
            ) : (
              <Link
                to={currentUser ? "/dashboard/settings" : "/signup?plan=professional"}
                className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700"
              >
                {currentUser ? "Upgrade" : "Get Started"}
              </Link>
            )}
          </div>
          <div className="pt-6 pb-8 px-6">
            <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
            <ul className="mt-6 space-y-4">
              {prices.professional.features.map((feature, index) => (
                <li key={index} className="flex space-x-3">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-green-500"
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
                  <span className="text-sm text-gray-500">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Enterprise</h2>
            <p className="mt-4 text-sm text-gray-500">For agencies and large businesses with extensive needs.</p>
            <p className="mt-8">
              <span className="text-4xl font-extrabold text-gray-900">${getPlanPrice('enterprise')}</span>
              <span className="text-base font-medium text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'year'}</span>
            </p>
            {subscription?.plan === 'enterprise' ? (
              <button
                disabled
                className="mt-8 block w-full bg-indigo-50 border border-indigo-500 rounded-md py-2 text-sm font-semibold text-indigo-700 text-center"
              >
                Current Plan
              </button>
            ) : (
              <Link
                to={currentUser ? "/dashboard/settings" : "/signup?plan=enterprise"}
                className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700"
              >
                {currentUser ? "Upgrade" : "Get Started"}
              </Link>
            )}
          </div>
          <div className="pt-6 pb-8 px-6">
            <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
            <ul className="mt-6 space-y-4">
              {prices.enterprise.features.map((feature, index) => (
                <li key={index} className="flex space-x-3">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-green-500"
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
                  <span className="text-sm text-gray-500">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <p className="text-base text-gray-500">
          Not sure which plan is right for you? <a href="#contact" className="font-medium text-indigo-600 hover:text-indigo-500">Contact us</a> for a custom quote.
        </p>
      </div>
    </div>
  );
};

export default PricingTable;