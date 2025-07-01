import React, { useContext, useEffect, useState } from "react";
import "./Home.css";
import { CoinContext } from "../../context/CoinContext";
import { Link } from "react-router-dom";

const Home = () => {
  const { allCoin, currency } = useContext(CoinContext);
  const [displayCoin, setDisplayCoin] = useState([]);
  const [input, setInput] = useState("");
  const [sortKey, setSortKey] = useState("market_cap_rank"); // Default sort key
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort order
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || []
  );
  const [showFavorites, setShowFavorites] = useState(false);

  // Input Handler
  const inputHandler = (e) => {
    setInput(e.target.value);
    if (e.target.value === "") {
      setDisplayCoin(allCoin);
    }
  };

  // Search Handler
  const searchHandler = async (e) => {
    e.preventDefault();
    const coins = await allCoin.filter((item) => {
      return item.name.toLowerCase().includes(input.toLowerCase());
    });
    setDisplayCoin(coins);
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

  // UseEffect for sorting and filtering
  useEffect(() => {
    let sortedCoins = [...allCoin];
    if (showFavorites) {
      sortedCoins = sortedCoins.filter((coin) => favorites.includes(coin.id));
    }

    sortedCoins.sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortKey] > b[sortKey] ? 1 : -1;
      } else {
        return a[sortKey] < b[sortKey] ? 1 : -1;
      }
    });
    setDisplayCoin(sortedCoins);
  }, [allCoin, sortKey, sortOrder, showFavorites, favorites]);

  return (
    <div className="home">
      <div className="hero">
        <h1>
          Largest <br /> Crypto Marketplace
        </h1>
        <p>
          Welcome to the world's largest Crypto marketplace. Where You Can track
          The Price of Your Favourite Crypto Currency
        </p>
        <form onSubmit={searchHandler}>
          <input
            onChange={inputHandler}
            list="coinlist"
            value={input}
            type="text"
            placeholder="Search Crypto"
            required
          />
          <datalist id="coinlist">
            {allCoin.slice(0, 10).map((item, index) => (
              <option key={index} value={item.name} />
            ))}
          </datalist>

          <button type="submit">Search</button>
        </form>
      </div>
      <div className="crypto-table">
        <button
          className="favorites-btn"
          onClick={() => setShowFavorites(!showFavorites)}
        >
          {showFavorites ? "Show All" : "Show Favorites"}
        </button>
        <div className="table-layout">
          <p>#</p>
          <p>coins</p>
          <p onClick={() => handleSort("current_price")}>Price</p>
          <p onClick={() => handleSort("price_change_percentage_24h")} style={{ textAlign: "center" }}>24H Change</p>
          <p onClick={() => handleSort("market_cap")} className="market-cap">Market Cap</p>
        </div>

        {displayCoin.slice(0, 10).map((item, index) => (
          <div className="table-layout" key={index}>
            <p>{item.market_cap_rank}</p>
            <div>
              <svg
                className={`fav-icon ${favorites.includes(item.id) ? "favorited" : ""}`}
                onClick={() => toggleFavorite(item.id)}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <Link to={`/coin/${item.id}`} className="coin-link">
                <img src={item.image} alt="Bitcoin" />
                <p>{item.name + "-" + item.symbol}</p>
              </Link>
            </div>
            <p>
              {currency.symbol}
              {item.current_price.toLocaleString()}
            </p>
            <p
              className={item.price_change_percentage_24h > 0 ? "green" : "red"}
            >
              {Math.floor(item.price_change_percentage_24h * 100) / 100 + "%"}
            </p>
            <p className="market-cap">
              {currency.symbol}
              {item.market_cap.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
