import React from 'react';
import { Link } from 'react-router-dom';
import FeatureShowcase from '../components/FeatureShowcase';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';

const HomePage = () => {
  return (
    <div className="transition-colors duration-200">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-primary-50 dark:from-black dark:to-gray-900 transition-colors duration-200">
        <div className="container-custom section py-20">
          <div className="max-w-3xl mx-auto text-center">
            <span className="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide transition-colors duration-200">
              The Future of Technical SEO
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-gray-900 dark:text-white mt-6 mb-6 transition-colors duration-200">
              Automate Your Technical SEO Workflows
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-200">
              Deliver fully automated technical SEO audits, fixes, and performance optimization through our innovative AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-primary">
                Start Free Trial
              </Link>
              <a href="#demo" className="btn-secondary dark:bg-gray-800 dark:text-primary-300 dark:hover:bg-gray-700 transition-colors duration-200">
                Watch Demo
              </a>
            </div>
          </div>
          
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg transition-colors duration-200">
              <img 
                src="/images/dashboard-preview.jpg" 
                alt="SEO.engineering Dashboard Preview" 
                className="rounded-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Aegntic Banner */}
      <section className="bg-gray-50 dark:bg-gray-950 py-6 transition-colors duration-200">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200 mr-2 transition-colors duration-200">
                A product by
              </span>
              <a href="https://aegntic.ai" target="_blank" rel="noopener noreferrer" className="font-bold text-xl text-primary-600 dark:text-primary-400 hover:underline transition-colors duration-200">
                aegntic.ai
              </a>
            </div>
            <div>
              <a href="https://aegntic.ai/about" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                Learn more about our AI-powered tools
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-black py-12 border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2 transition-colors duration-200">94%</div>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">Time Saved vs Manual SEO</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2 transition-colors duration-200">3.2x</div>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">Average Traffic Increase</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2 transition-colors duration-200">10,000+</div>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">Issues Fixed Automatically</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2 transition-colors duration-200">24/7</div>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">Continuous Monitoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeatureShowcase />

      {/* How It Works Section */}
      <section className="section bg-gray-50 dark:bg-gray-950 py-20 transition-colors duration-200">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide transition-colors duration-200">
              Process
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mt-4 mb-6 transition-colors duration-200">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-200">
              Our streamlined process makes technical SEO improvements effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute top-0 left-0 -mt-2 ml-4 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div className="bg-white dark:bg-gray-900 p-6 pt-10 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 h-full transition-colors duration-200">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">Connect Site</h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
                  Simply connect your website through our secure dashboard with just a few clicks.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute top-0 left-0 -mt-2 ml-4 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div className="bg-white dark:bg-gray-900 p-6 pt-10 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 h-full transition-colors duration-200">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">Automated Audit</h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
                  Our system performs a comprehensive scan of your site to identify all technical issues.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute top-0 left-0 -mt-2 ml-4 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div className="bg-white dark:bg-gray-900 p-6 pt-10 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 h-full transition-colors duration-200">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">Implement Fixes</h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
                  Approve recommended fixes and our system automatically implements them with version control.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="absolute top-0 left-0 -mt-2 ml-4 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <div className="bg-white dark:bg-gray-900 p-6 pt-10 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 h-full transition-colors duration-200">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">Monitor Results</h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
                  Track performance improvements and ROI through your personalized dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Pricing Section */}
      <Pricing />

      {/* CTA Section */}
      <section className="section bg-primary-700 dark:bg-primary-800 py-20 transition-colors duration-200">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
            Ready to transform your technical SEO?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Join hundreds of companies already using SEO.engineering to improve their search performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 dark:text-primary-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-700 focus:ring-white transition duration-150 ease-in-out">
              Start Your Free Trial
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-700 focus:ring-white transition duration-150 ease-in-out">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;