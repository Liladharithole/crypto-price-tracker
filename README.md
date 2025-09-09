# 🚀 Crypto Price Tracker

<div align="center">
  <img src="public/cryptocurrency.png" alt="Crypto Tracker Logo" width="120" height="120">
  
  <h3>Modern, Professional Cryptocurrency Tracking Platform</h3>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF.svg)](https://vitejs.dev/)
  [![Recharts](https://img.shields.io/badge/Recharts-2.x.x-FF6B6B.svg)](https://recharts.org/)
  [![Responsive](https://img.shields.io/badge/Mobile-Optimized-green.svg)]()
</div>

A sleek, modern cryptocurrency tracking platform with professional UI design, real-time price updates, interactive charts, and seamless mobile experience. Features a beautiful light-blue blur glass morphism design with smooth animations and fully responsive layout.

## ✨ Features

### 📊 **Advanced Charts & Analytics**
- **Interactive Recharts**: Professional area charts with gradient fills
- **Multiple Timeframes**: 1H, 4H, 1D, 7D, 30D, 1Y with proper time formatting
- **Real-time Data**: Live price updates with automatic refresh
- **Smart Time Labels**: Context-aware time formatting (minutes, hours, days)
- **Color-coded Trends**: Green for gains, red for losses with dynamic gradients
- **Responsive Charts**: Perfect scaling across all devices
- **Chart Statistics**: Data points, period info, and percentage change

### 🔔 **Smart Alerts & Notifications**
- **Price Alerts**: Set custom price targets (above/below)
- **Browser Notifications**: Real-time alert notifications
- **Alert Management**: View, edit, and delete active alerts
- **Multiple Conditions**: Support for various trigger conditions

### 🎨 **Premium UI/UX Design**
- **Glass Morphism**: Beautiful light-blue blur backgrounds with backdrop filters
- **Smart Navbar**: Context-aware search (appears only on home page scroll)
- **Mobile-First**: Hamburger menu with smooth slide-out sidebar
- **Scroll Animations**: Dynamic navbar that adapts when scrolling
- **Professional Tables**: Clean, aligned cryptocurrency listings
- **Clickable Rows**: Entire coin rows are clickable for navigation
- **Theme Support**: Dark/light mode with system preference detection
- **Smooth Transitions**: Framer Motion animations throughout
- **Touch Optimized**: Perfect mobile experience with proper touch targets

### 🔍 **Smart Search & Navigation**
- **Context-Aware Search**: Only appears on home page when scrolling down
- **Live Search Results**: Real-time cryptocurrency search with thumbnails
- **CoinGecko Integration**: Search powered by CoinGecko's comprehensive database
- **Favorites System**: Star/unstar coins with persistent local storage
- **Sortable Tables**: Click any column header to sort data
- **Pagination**: Customizable items per page (10, 15, 20, 25)
- **Multi-currency Support**: USD, EUR, and INR with symbol formatting

### 📱 **Progressive Web App (PWA)**
- **Installable**: Add to home screen on mobile and desktop
- **Offline Support**: Basic functionality works offline
- **Fast Loading**: Service worker caching for improved performance
- **Native Feel**: App-like experience across all platforms

## 🛠 Tech Stack

### **Frontend**
- **React 19.0** - Latest React with concurrent features
- **React Router DOM** - Client-side routing with navigation
- **Recharts** - Professional chart library with area charts
- **Framer Motion** - Smooth animations and transitions
- **Context API** - Global state management
- **CSS Variables** - Dynamic theming system
- **Date-fns** - Modern date utility library

### **Build & Development**
- **Vite 6.1** - Lightning-fast build tool
- **ESLint** - Code quality and consistency
- **Modern JavaScript** - ES6+ features and modules

### **API & Data**
- **CoinGecko API** - Comprehensive cryptocurrency data
- **LocalStorage** - Client-side data persistence
- **Web Notifications API** - Browser notifications

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Modern web browser with ES6+ support

### 💻 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Liladharithole/crypto-price-tracker.git
   cd crypto-price-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup** (Optional)
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Add your CoinGecko API key (optional - app works without it)
   VITE_COINGECKO_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`
   - The app will automatically reload when you make changes

### 📦 Production Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

## 📋 Usage Guide

### 🏠 **Home Page**
- **Professional Table**: Clean, aligned cryptocurrency listings with hover effects
- **Clickable Rows**: Click anywhere on a coin row to view details
- **Smart Search**: Scroll down to reveal search functionality
- **Star Favorites**: Click star icons to favorite coins (independent of row clicks)
- **Sort & Filter**: Click column headers to sort data
- **Pagination**: Navigate through pages with customizable items per page
- **Real-time Updates**: Live price changes with color-coded indicators

### 📏 **Coin Details Page**
- **Interactive Charts**: Professional Recharts with area fills and gradients
- **Time Periods**: Switch between 1H, 4H, 1D, 7D, 30D, 1Y with proper formatting
- **Chart Info**: View data points, time intervals, and percentage changes
- **Price Alerts**: Set custom price alerts with conditions
- **Market Statistics**: Comprehensive market data and trading information
- **Loading States**: Smooth loading animations and error handling

### 🎨 **Theme Switching**
- Click the theme toggle in the navigation bar
- Automatically detects system preference on first visit
- Preference is saved locally for future visits

### 📱 **PWA Installation**
1. Visit the app in your browser
2. Look for the "Install App" prompt or button
3. Click "Install" to add to your home screen
4. Launch like a native app!

## 📈 Performance & Optimization

### **Core Optimizations**
- **React.memo**: Prevents unnecessary re-renders of components
- **useMemo & useCallback**: Optimizes expensive calculations and function references
- **Debounced Search**: Reduces API calls during user typing
- **Lazy Loading**: Images load only when needed
- **Service Worker**: Caches resources for faster subsequent loads

### **Bundle Optimization**
- **Tree Shaking**: Eliminates unused code
- **Code Splitting**: Loads code only when needed
- **Asset Optimization**: Compressed images and optimized fonts
- **CSS Variables**: Efficient theme switching without re-renders

## 🐛 Troubleshooting

### Common Issues

**API Rate Limiting**
- The app uses CoinGecko's free tier which has rate limits
- If you encounter rate limiting, wait a few minutes or add your own API key

**Theme Not Persisting**
- Ensure localStorage is enabled in your browser
- Clear browser cache if issues persist

**PWA Installation Issues**
- Ensure you're using HTTPS (required for PWA features)
- Try clearing browser cache and cookies

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### **Getting Started**
1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a new branch for your feature
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make** your changes following our coding standards
5. **Test** your changes thoroughly
6. **Commit** with descriptive messages
   ```bash
   git commit -m 'feat: add amazing new feature'
   ```
7. **Push** to your branch
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open** a Pull Request

### **Code Style**
- Use ESLint configuration provided
- Follow React best practices
- Write descriptive commit messages
- Add comments for complex logic
- Ensure responsive design principles

### **Areas for Contribution**
- 🔍 Additional search filters
- 📊 More chart types and indicators
- 🌐 Internationalization (i18n)
- 📦 Additional cryptocurrency data sources
- 📱 Mobile app version
- 🧪 Testing coverage improvements

## 📜 API Reference

### **CoinGecko API Endpoints Used**
- `/coins/markets` - Market data for cryptocurrencies
- `/coins/{id}` - Detailed information about specific coins
- `/coins/{id}/market_chart` - Historical market data
- `/search/trending` - Trending cryptocurrencies
- `/global` - Global cryptocurrency statistics

### **Rate Limits**
- **Free Tier**: 10-30 calls/minute
- **Pro Tier**: Higher limits available with API key

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Netlify**
1. Build the project: `npm run build`
2. Drag and drop the `dist` folder to Netlify
3. Configure environment variables in Netlify settings

### **Manual Deployment**
1. Build for production: `npm run build`
2. Upload the `dist` folder contents to your web server
3. Ensure server supports client-side routing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### **APIs & Services**
- [CoinGecko API](https://www.coingecko.com/en/api) - Comprehensive cryptocurrency data
- [Google Charts](https://developers.google.com/chart) - Interactive data visualization

### **Technologies & Tools**
- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool and dev server
- [React Router](https://reactrouter.com/) - Client-side routing

### **Development Resources**
This project was developed with assistance from:
- 🤖 GitHub Copilot and ChatGPT for code suggestions and problem-solving
- 📺 YouTube tutorials and online courses


### **Special Thanks**
- To the open-source community for the amazing tools and libraries
- To CoinGecko for providing free access to cryptocurrency data

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/Liladharithole">Liladhar Ithole</a></p>
  <p>If you found this project helpful, please consider giving it a ⭐ star!</p>
</div>
