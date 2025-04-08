import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { ThemeContext } from '../contexts/ThemeContext';

const Layout = () => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <div className={`flex flex-col min-h-screen bg-white dark:bg-black transition-colors duration-200`}>
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;