import React, { useEffect, useState, useMemo } from "react";
import "./Home.css";
import { useCoin } from "../../context/CoinContext";
import { Link } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import ErrorDisplay from "../../components/ErrorDisplay/ErrorDisplay";
import { checkAlerts } from "../../utils/alerts";

const Home = () => {
  const { allCoin, currency, loading, error, refreshData } = useCoin();
  const [displayCoin, setDisplayCoin] = useState([]);
  const [input, setInput] = useState("");
  const [sortKey, setSortKey] = useState("market_cap_rank");
  const [sortOrder, setSortOrder] = useState("asc");
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || []
  );
  const [showFavorites, setShowFavorites] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchDebounce, setSearchDebounce] = useState("");

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(input);
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  // Input Handler
  const inputHandler = (e) => {
    setInput(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Search Handler
  const searchHandler = (e) => {
    e.preventDefault();
    // Search is now handled by the memoized filteredAndSortedCoins
  };

  // Sort Handler
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Memoized filtered and sorted coins
  const filteredAndSortedCoins = useMemo(() => {
    let coins = [...allCoin];
    
    // Apply search filter
    if (searchDebounce) {
      coins = coins.filter((coin) => 
        coin.name.toLowerCase().includes(searchDebounce.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchDebounce.toLowerCase())
      );
    }
    
    // Apply favorites filter
    if (showFavorites) {
      coins = coins.filter((coin) => favorites.includes(coin.id));
    }
    
    // Apply sorting
    coins.sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = 0;
      if (bValue === null || bValue === undefined) bValue = 0;
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return coins;
  }, [allCoin, searchDebounce, showFavorites, favorites, sortKey, sortOrder]);

  // Memoized paginated coins
  const paginatedCoins = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCoins.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedCoins, currentPage, itemsPerPage]);

  // Total pages calculation
  const totalPages = Math.ceil(filteredAndSortedCoins.length / itemsPerPage);

  // Toggle Favorites
  const toggleFavorite = (coinId) => {
    let updatedFavorites = [...favorites];
    if (favorites.includes(coinId)) {
      updatedFavorites = updatedFavorites.filter((id) => id !== coinId);
    } else {
      updatedFavorites.push(coinId);
    }
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  // Check for price alerts when coins update
  useEffect(() => {
    if (allCoin.length > 0) {
      const { triggeredAlerts } = checkAlerts(allCoin);
      if (triggeredAlerts.length > 0) {
        console.log('Price alerts triggered:', triggeredAlerts);
      }
    }
  }, [allCoin]);

  // Update display coins when filtered data changes
  useEffect(() => {
    setDisplayCoin(paginatedCoins);
  }, [paginatedCoins]);

  // Pagination controls
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Price change formatter with arrow
  const formatPriceChange = (change) => {
    const isPositive = change > 0;
    const arrow = isPositive ? '↗' : '↘';
    const formattedChange = Math.abs(change).toFixed(2);
    return `${arrow} ${formattedChange}%`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="home">
        <div className="hero">
          <h1>Largest <br /> Crypto Marketplace</h1>
          <p>Loading the latest cryptocurrency data...</p>
        </div>
        <Loading type="table-skeleton" text="Loading cryptocurrencies..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="home">
        <div className="hero">
          <h1>Largest <br /> Crypto Marketplace</h1>
        </div>
        <ErrorDisplay 
          message={error} 
          onRetry={refreshData}
          type="error"
        />
      </div>
    );
  }

  return (
    <div className="home fade-in">
      <div className="hero">
        <h1>
          Largest <br /> Crypto Marketplace
        </h1>
        <p>
          Welcome to the world's largest Crypto marketplace. Track real-time prices, 
          set alerts, and manage your portfolio with ease.
        </p>
        <form onSubmit={searchHandler}>
          <input
            onChange={inputHandler}
            list="coinlist"
            value={input}
            type="text"
            placeholder="Search by name or symbol..."
          />
          <datalist id="coinlist">
            {allCoin.slice(0, 10).map((item, index) => (
              <option key={index} value={item.name} />
            ))}
          </datalist>
          <button type="submit" disabled={!input.trim()}>
            Search
          </button>
        </form>
      </div>
      <div className="crypto-table">
        <div className="table-controls">
          <div className="left-controls">
            <button
              className={`favorites-btn ${showFavorites ? 'active' : ''}`}
              onClick={() => setShowFavorites(!showFavorites)}
            >
              {showFavorites ? '★ Favorites' : '☆ Show Favorites'} ({favorites.length})
            </button>
            <div className="results-info">
              Showing {paginatedCoins.length} of {filteredAndSortedCoins.length} coins
            </div>
          </div>
          <div className="right-controls">
            <select 
              value={itemsPerPage} 
              onChange={handleItemsPerPageChange}
              className="items-per-page"
            >
              <option value={10}>10 per page</option>
              <option value={15}>15 per page</option>
              <option value={20}>20 per page</option>
              <option value={25}>25 per page</option>
            </select>
          </div>
        </div>
        
        <div className="table-header">
          <div className="table-layout">
            <p style={{ textAlign: "center", justifySelf: "center" }}>#</p>
            <p style={{ paddingLeft: "52px" }}>Coin</p>
            <p 
              onClick={() => handleSort("current_price")} 
              className={`sortable ${sortKey === 'current_price' ? 'active' : ''}`}
              style={{ textAlign: "right", justifySelf: "end" }}
            >
              Price {sortKey === 'current_price' && (sortOrder === 'asc' ? '↑' : '↓')}
            </p>
            <p 
              onClick={() => handleSort("price_change_percentage_24h")} 
              className={`sortable ${sortKey === 'price_change_percentage_24h' ? 'active' : ''}`}
              style={{ textAlign: "center", justifySelf: "center" }}
            >
              24H Change {sortKey === 'price_change_percentage_24h' && (sortOrder === 'asc' ? '↑' : '↓')}
            </p>
            <p 
              onClick={() => handleSort("market_cap")} 
              className={`market-cap sortable ${sortKey === 'market_cap' ? 'active' : ''}`}
              style={{ textAlign: "right", justifySelf: "end" }}
            >
              Market Cap {sortKey === 'market_cap' && (sortOrder === 'asc' ? '↑' : '↓')}
            </p>
            <p 
              onClick={() => handleSort("total_volume")} 
              className={`volume sortable ${sortKey === 'total_volume' ? 'active' : ''}`}
              style={{ textAlign: "right", justifySelf: "end" }}
            >
              Volume {sortKey === 'total_volume' && (sortOrder === 'asc' ? '↑' : '↓')}
            </p>
          </div>
        </div>

        <div className="table-body">
          {displayCoin.map((item, index) => {
            const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
            const priceChange = item.price_change_percentage_24h || 0;
            
            return (
              <Link to={`/coin/${item.id}`} key={item.id} className="table-row-link">
                <div className="table-layout table-row">
                  <p className="rank">{item.market_cap_rank || globalIndex}</p>
                  <div className="coin-info">
                    <svg
                      className={`fav-icon ${favorites.includes(item.id) ? "favorited" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      title={favorites.includes(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <img src={item.image} alt={item.name} loading="lazy" />
                    <div className="coin-text">
                      <p className="coin-name">{item.name}</p>
                      <p className="coin-symbol">{item.symbol.toUpperCase()}</p>
                    </div>
                  </div>
                  <p className="price">
                    {currency.symbol}{item.current_price.toLocaleString()}
                  </p>
                  <p className={`price-change ${priceChange >= 0 ? "positive" : "negative"}`}>
                    {formatPriceChange(priceChange)}
                  </p>
                  <p className="market-cap">
                    {currency.symbol}{item.market_cap?.toLocaleString() || 'N/A'}
                  </p>
                  <p className="volume">
                    {currency.symbol}{item.total_volume?.toLocaleString() || 'N/A'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              « First
            </button>
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              ‹ Prev
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next ›
            </button>
            <button 
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Last »
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
