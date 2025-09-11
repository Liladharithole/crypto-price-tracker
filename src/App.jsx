import React, { useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Coin from "./pages/Coin/Coin";
import Footer from "./components/Footer/Footer";
import { ThemeProvider } from "./context/ThemeContext";
import { testApiConnection } from "./utils/api";

const App = () => {
  useEffect(() => {
    // Test API connection on app startup (only in production for debugging)
    if (import.meta.env.PROD) {
      console.log('🚀 App started in production mode');
      // Delay the test slightly to let the app initialize
      setTimeout(() => {
        testApiConnection().catch(console.error);
      }, 1000);
    }
  }, []);

  return (
    <ThemeProvider>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/coin/:coinId" element={<Coin />} />
        </Routes>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default App;
