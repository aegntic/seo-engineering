import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      monthlyPrice: 99,
      annualPrice: 79,
      features: [
        "Up to 500 pages scanned",
        "5 technical SEO checks",
        "Weekly scans",
        "Basic reporting",
        "Email support"
      ],
      cta: "Start Free Trial"
    },
    {
      name: "Professional",
      monthlyPrice: 249,
      annualPrice: 199,
      popular: true,
      features: [
        "Up to 5,000 pages scanned",
        "15 technical SEO checks",
        "Daily scans",
        "Advanced reporting",
        "Automated fixes",
        "Priority support"
      ],
      cta: "Start Free Trial"
    },
    {
      name: "Enterprise",
      monthlyPrice: 499,
      annualPrice: 399,
      features: [
        "Unlimited pages scanned",
        "25+ technical SEO checks",
        "Hourly scans",
        "Custom reporting",
        "Automated fixes",
        "White-label options",
        "Dedicated account manager"
      ],
      cta: "Contact Sales"
    }
  ];

  return (
    <div className="bg-gray-50">
      <div className="container-custom section">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the plan that's right for your business. All plans include a 14-day free trial.
          </p>
          
          {/* Toggle */}
          <div className="flex items-center justify-center">
            <span className={`text-sm ${!isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>Monthly</span>
            <button
              type="button"
              className="relative inline-flex mx-4 h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary-500 transition-colors duration-200 ease-in-out focus:outline-none"
              onClick={() => setIsAnnual(!isAnnual)}
            >
              <span className="sr-only">Toggle pricing</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>Annual <span className="text-primary-600">(20% off)</span></span>
          </div>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white rounded-lg shadow-sm border ${plan.popular ? 'border-primary-500' : 'border-gray-200'} overflow-hidden`}
            >
              {plan.popular && (
                <div className="bg-primary-500 text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-display font-bold text-gray-900">{plan.name}</h2>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-display font-bold text-gray-900">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-xl text-gray-500 ml-1">/mo</span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-primary-600 mt-1">Billed annually</p>
                )}
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600 ml-2">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link 
                    to={plan.name === "Enterprise" ? "/contact" : "/signup"}
                    className={`block w-full text-center py-3 px-4 rounded-md font-medium ${
                      plan.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* FAQs */}
        <div className="mt-20">
          <h2 className="text-3xl font-display font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">What's included in the free trial?</h3>
              <p className="text-gray-600">
                The 14-day free trial includes all features of the plan you select, with no credit card required.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee if you're not satisfied with our service.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">What if I need more pages?</h3>
              <p className="text-gray-600">
                You can add additional page packs to any plan. Contact our sales team for custom pricing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;