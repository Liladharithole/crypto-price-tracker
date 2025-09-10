import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Navbar.css";
import logo from "../../assets/logo.png";
import arrow_icon from "../../assets/arrow_icon.png";
import { useCoin } from "../../context/CoinContext";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { CURRENCIES, apiRequest, API_ENDPOINTS } from "../../utils/api";

const Navbar = () => {
  const { setCurrency, currency } = useCoin();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  // Scroll detection with throttling to prevent vibrating
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const scrollingDown = scrollTop > lastScrollY && scrollTop > 100;
          
          // Use threshold to prevent frequent changes
          const isCurrentlyScrolled = scrollTop > 50;
          const shouldShowSearch = isHomePage && scrollingDown && scrollTop > 200;
          
          // Only update state if it actually changed
          setIsScrolled(prev => prev !== isCurrentlyScrolled ? isCurrentlyScrolled : prev);
          setShowSearch(prev => prev !== shouldShowSearch ? shouldShowSearch : prev);
          
          lastScrollY = scrollTop;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // Reset search visibility when leaving home page
  useEffect(() => {
    if (!isHomePage) {
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [isHomePage]);

  // Search functionality
  useEffect(() => {
    const searchDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${query}`
      );
      const data = await response.json();
      
      if (data.coins) {
        setSearchResults(data.coins.slice(0, 5)); // Limit to top 5 results
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const currencyHandler = (e) => {
    const selectedCurrency = Object.values(CURRENCIES).find(
      curr => curr.name === e.target.value
    );
    if (selectedCurrency) {
      setCurrency(selectedCurrency);
    }
  };

  const handleSearchSelect = (coin) => {
    setSearchQuery('');
    setIsSearchOpen(false);
    setSearchResults([]);
    // Navigate to coin page
    window.location.href = `/coin/${coin.id}`;
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <Link to={"/"} className="nav-logo">
            <span className="logo-text">CryptoTracker</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="desktop-nav">
            <ul className="nav-menu">
              <li><Link to={"/"}>Home</Link></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#about">About</a></li>
            </ul>

            <div className="nav-actions">
              <ThemeToggle />
              <select onChange={currencyHandler} value={currency.name} className="currency-select">
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="inr">INR</option>
              </select>
              <button className="signup-btn">
                Sign Up
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className={isMobileMenuOpen ? 'cross' : ''}></span>
            <span className={isMobileMenuOpen ? 'cross' : ''}></span>
            <span className={isMobileMenuOpen ? 'cross' : ''}></span>
          </button>
        </div>
      </nav>

      {/* Search Bar - appears on scroll down */}
      <AnimatePresence>
        {showSearch && (
          <motion.div 
            className="search-bar"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search cryptocurrencies..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
              
              {searchResults.length > 0 && isSearchOpen && (
                <div className="search-results">
                  {isSearching ? (
                    <div className="search-loading">Searching...</div>
                  ) : (
                    searchResults.map((coin) => (
                      <div 
                        key={coin.id} 
                        className="search-result-item"
                        onMouseDown={() => handleSearchSelect(coin)}
                      >
                        <img src={coin.thumb} alt={coin.name} />
                        <div className="coin-info">
                          <span className="coin-name">{coin.name}</span>
                          <span className="coin-symbol">{coin.symbol}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              className="mobile-sidebar"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="sidebar-header">
                <h3>Menu</h3>
                <button 
                  className="close-btn"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ✕
                </button>
              </div>
              <ul className="sidebar-menu">
                <li><Link to={"/"} onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
                <li><a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a></li>
                <li><a href="#pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a></li>
                <li><a href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</a></li>
              </ul>
              <div className="sidebar-actions">
                <div className="sidebar-row">
                  <span>Theme:</span>
                  <ThemeToggle />
                </div>
                <div className="sidebar-row">
                  <span>Currency:</span>
                  <select onChange={currencyHandler} value={currency.name}>
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                    <option value="inr">INR</option>
                  </select>
                </div>
                <button className="sidebar-signup-btn">
                  Sign Up
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
