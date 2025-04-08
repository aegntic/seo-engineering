import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center">
              <img src="/images/SEOengineering_LOGO.png" alt="SEO.engineering Logo" className="h-8 w-auto mr-2" />
              <span className="text-2xl font-display font-bold text-primary-600 dark:text-primary-400 transition-colors duration-200">SEO.engineering</span>
            </Link>
            <p className="mt-4 text-base text-gray-500 dark:text-gray-400 transition-colors duration-200">
              The future of technical SEO automation. Deliver enterprise-grade results at scale with our AI-powered platform.
            </p>
            <div className="mt-4">
              <a href="https://aegntic.ai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline">
                <span>A product by aegntic.ai</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-300 tracking-wider uppercase transition-colors duration-200">Product</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#features" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  Features
                </a>
              </li>
              <li>
                <Link to="/pricing" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  Pricing
                </Link>
              </li>
              <li>
                <a href="#roadmap" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  Roadmap
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-300 tracking-wider uppercase transition-colors duration-200">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="https://aegntic.ai/about" target="_blank" rel="noopener noreferrer" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  About aegntic.ai
                </a>
              </li>
              <li>
                <a href="#contact" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  Contact
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8 transition-colors duration-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <ThemeToggle />
            </div>
            <p className="text-base text-gray-400 dark:text-gray-500 transition-colors duration-200">
              &copy; {new Date().getFullYear()} SEO.engineering by <a href="https://aegntic.ai" className="text-primary-600 dark:text-primary-400 hover:underline">aegntic.ai</a>. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;