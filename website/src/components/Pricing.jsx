import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  
  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small businesses and individual sites',
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        'Up to 5,000 pages scanned',
        'Weekly automated scans',
        'Basic technical SEO checks',
        '10 automatic fixes per month',
        'Email reports',
        'Basic dashboard access',
      ],
      cta: 'Start free trial',
      highlight: false
    },
    {
      name: 'Professional',
      description: 'Ideal for growing businesses and agencies',
      monthlyPrice: 149,
      annualPrice: 119,
      features: [
        'Up to 25,000 pages scanned',
        'Daily automated scans',
        'Advanced technical SEO checks',
        'Unlimited automatic fixes',
        'PDF & email reports',
        'API access',
        'Performance monitoring',
        'Multi-site management'
      ],
      cta: 'Start free trial',
      highlight: true
    },
    {
      name: 'Enterprise',
      description: 'For large sites and agency partnerships',
      monthlyPrice: 499,
      annualPrice: 399,
      features: [
        'Unlimited pages scanned',
        'Custom scan frequency',
        'All technical SEO checks',
        'Unlimited automatic fixes',
        'White-label reports',
        'Priority API access',
        'Custom integrations',
        'Dedicated support',
        'Agency partner dashboard'
      ],
      cta: 'Contact sales',
      highlight: false
    }
  ];

  return (
    <section className="bg-white py-20">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-4 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs. All plans include a 14-day free trial.
          </p>
          
          <div className="flex items-center justify-center mt-8">
            <button
              className={`px-4 py-2 rounded-l-lg font-medium ${isAnnual ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-500'}`}
              onClick={() => setIsAnnual(true)}
            >
              Annual
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Save 20%</span>
            </button>
            <button
              className={`px-4 py-2 rounded-r-lg font-medium ${!isAnnual ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-500'}`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-xl overflow-hidden ${plan.highlight ? 'border-2 border-primary-500 shadow-lg' : 'border border-gray-200 shadow-sm'}`}
            >
              {plan.highlight && (
                <div className="bg-primary-500 text-white text-center py-2 font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-500 ml-2">/ month</span>
                  {isAnnual && (
                    <div className="text-green-600 text-sm font-medium mt-1">
                      Billed annually (${plan.annualPrice * 12}/year)
                    </div>
                  )}
                </div>
                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 text-green-500 mr-2 mt-0.5" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.cta === 'Contact sales' ? '/contact' : '/signup'}
                  className={`w-full block text-center py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.highlight
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-white border border-primary-600 text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-gray-50 rounded-xl max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="mb-6 md:mb-0 md:mr-8 flex-shrink-0">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 text-primary-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Need a custom plan?</h3>
              <p className="text-gray-600 mb-4">
                We offer custom solutions for agencies and enterprise clients with specific requirements.
                Contact our sales team to discuss your needs.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700"
              >
                Contact sales
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 ml-2" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;