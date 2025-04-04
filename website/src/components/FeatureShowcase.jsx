import React from 'react';

const FeatureShowcase = () => {
  const features = [
    {
      title: 'Automatic Issue Detection',
      description: 'Our AI-powered crawler identifies technical SEO issues across your entire website automatically.',
      image: '/features/issue-detection.svg',
      color: 'bg-primary-100'
    },
    {
      title: 'Intelligent Fix Prioritization',
      description: 'We analyze and prioritize issues based on impact, difficulty to fix, and potential SEO benefits.',
      image: '/features/prioritization.svg',
      color: 'bg-green-100'
    },
    {
      title: 'One-Click Implementation',
      description: 'Approve recommended fixes and our system implements them automatically with version control.',
      image: '/features/implementation.svg',
      color: 'bg-orange-100'
    },
    {
      title: 'Comprehensive Reporting',
      description: 'Track your progress with detailed reports showing improvements and remaining issues.',
      image: '/features/reporting.svg',
      color: 'bg-blue-100'
    }
  ];

  return (
    <section className="bg-white py-20">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-4 mb-6">
            Technical SEO on Autopilot
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our platform handles the entire technical SEO process from discovery to implementation,
            freeing you to focus on strategy and content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col md:flex-row items-start gap-6">
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <img src={feature.image} alt={feature.title} className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-gray-50 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">
                See how it works
              </h3>
              <p className="text-gray-600 mb-6">
                Watch our quick demo to see how SEOAutomate transforms technical SEO from a manual,
                time-consuming process into an automated workflow.
              </p>
              <a 
                href="#watch-demo" 
                className="inline-flex items-center text-primary-600 font-medium"
              >
                Watch the demo
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 ml-2" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </a>
            </div>
            <div className="bg-gray-200 h-64 md:h-auto">
              {/* This would be replaced with an actual video or screenshot */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8 text-white" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;