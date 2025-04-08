import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-display font-bold text-primary-600">SEO.engineering</span>
            </Link>
            <p className="mt-4 text-base text-gray-500">
              The future of technical SEO automation. Deliver enterprise-grade results at scale with our AI-powered platform.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#features" className="text-base text-gray-500 hover:text-gray-900">
                  Features
                </a>
              </li>
              <li>
                <Link to="/pricing" className="text-base text-gray-500 hover:text-gray-900">
                  Pricing
                </Link>
              </li>
              <li>
                <a href="#roadmap" className="text-base text-gray-500 hover:text-gray-900">
                  Roadmap
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#about" className="text-base text-gray-500 hover:text-gray-900">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="text-base text-gray-500 hover:text-gray-900">
                  Contact
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-base text-gray-500 hover:text-gray-900">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-base text-gray-500 hover:text-gray-900">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} SEO.engineering. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;