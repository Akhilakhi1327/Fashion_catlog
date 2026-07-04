import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="mt-8 border-t border-white/70 bg-[#4b2c24] text-cream">
      <div className="section-shell py-14 sm:py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Info Column */}
        <div className="space-y-4">
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="IndhuVadhana" className="h-14 object-contain" />
          </Link>
          <p className="text-sm text-cream/80 leading-relaxed">
            Discover premium Sarees, Kurtis, Dresses and ethnic essentials curated for every special occasion. Crafted for a refined shopping experience.
          </p>
          <div className="flex space-x-4 pt-2">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-biscuit hover:text-white transition-all">
              <FiFacebook className="w-5 h-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-biscuit hover:text-white transition-all">
              <FiInstagram className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-biscuit hover:text-white transition-all">
              <FiTwitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div>
          <h4 className="text-lg font-bold font-display text-white mb-6">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/" className="hover:text-biscuit transition-colors">Home Landing</Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-biscuit transition-colors">Catalog Shop</Link>
            </li>
            <li>
              <Link to="/admin/login" className="hover:text-biscuit transition-colors">Admin Portal Access</Link>
            </li>
            <li>
              <a href="#about" className="hover:text-biscuit transition-colors">About Our Brand</a>
            </li>
          </ul>
        </div>

        {/* Categories Column */}
        <div>
          <h4 className="text-lg font-bold font-display text-white mb-6">Top Collections</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/products?category=Sarees" className="hover:text-biscuit transition-colors">Traditional Sarees</Link>
            </li>
            <li>
              <Link to="/products?category=Kurtis" className="hover:text-biscuit transition-colors">Trendy Kurtis</Link>
            </li>
            <li>
              <Link to="/products?category=Dresses" className="hover:text-biscuit transition-colors">Designer Dresses</Link>
            </li>
            <li>
              <Link to="/products?category=Lehengas" className="hover:text-biscuit transition-colors">Ethnic Lehengas</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info Column */}
        <div>
          <h4 className="text-lg font-bold font-display text-white mb-6">Contact Us</h4>
          <ul className="space-y-4 text-sm text-cream/80">
            <li className="flex items-start space-x-3">
              <FiMapPin className="w-5 h-5 text-biscuit flex-shrink-0 mt-0.5" />
              <span>102 Elite Avenue, Fashion Center, Hyderabad, TS, India</span>
            </li>
            <li className="flex items-center space-x-3">
              <FiPhone className="w-5 h-5 text-biscuit flex-shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center space-x-3">
              <FiMail className="w-5 h-5 text-biscuit flex-shrink-0" />
              <span>contact@indhuvadhana.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="section-shell pb-8 pt-0 border-t border-cream/20 text-center text-xs text-cream/60">
        <p>&copy; {new Date().getFullYear()} IndhuVadhana. All rights reserved. Designed with premium aesthetics.</p>
      </div>
    </footer>
  );
};

export default Footer;
