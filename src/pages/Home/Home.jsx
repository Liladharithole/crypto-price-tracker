import React from "react";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <div className="hero">
        <h1>
          Largest <br /> Crypto Marketplace
        </h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus
          incidunt tempora sequi quia nihil iste.
        </p>
        <form>
          <input type="text" placeholder="Search Crypto" />
          <button type="submit">Search</button>
        </form>
      </div>
      <div className="crypto-table">
        <div className="table-layout">
          <p>#</p>
          <p>coins</p>
          <p>Price</p>
          <p style={{textAlign:"center"}}>24H Change</p>
          <p className="market-cap">Market Cap</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
