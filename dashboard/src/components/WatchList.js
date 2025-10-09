import React, { useState, useContext, useEffect, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import { Tooltip, Grow } from "@mui/material";
import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";

import { watchlist } from "../data/data";
import { DoughnutChart } from "./DoughnoutChart";

const labels = watchlist.map((subArray) => subArray["name"]);

const WatchList = () => {
  const [stockData, setStockData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const ws = useRef(null);
  const [defaultSymbols, setDefaultSymbols] = useState([
    'RELIANCE.NSE', 'TCS.NSE', 'INFY.NSE', 'HDFCBANK.NSE', 'ICICIBANK.NSE', 'HINDUNILVR.NSE'
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const [baseValues, setBaseValues] = useState({});

  // Function to fetch real-time data
  const fetchRealTimeData = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:3002/api/stocks/real-time-price?symbols=${defaultSymbols.join(',')}`);

      const apiData = response?.data?.data || {};
      const symbols = Object.keys(apiData);

      const ensureSymbols = symbols.length > 0 ? symbols : defaultSymbols;

      const transformedData = {};

      ensureSymbols.forEach((symbol) => {
        const data = apiData[symbol] || {};
        const currentPrice = parseFloat(data.price) || 100.0;

        if (!baseValues[symbol]) {
          setBaseValues(prev => ({
            ...prev,
            [symbol]: currentPrice
          }));
        }

        transformedData[symbol] = {
          price: currentPrice,
          percent_change: data.change || ((currentPrice - (baseValues[symbol] || currentPrice)) / (baseValues[symbol] || currentPrice) * 100),
          timestamp: new Date().toISOString()
        };
      });

      setStockData(transformedData);
      setError(null);
    } catch (error) {
      if (error.message !== 'Network Error') {
        setError('Unable to fetch latest data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [defaultSymbols, baseValues]);

  // Initialize data and fetch periodically
  useEffect(() => {
    // Ensure user context from cookie/localStorage
    const initUser = async () => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch {}
      }
      try {
        const { data } = await axios.post('http://localhost:3002/', {}, { withCredentials: true });
        if (data?.status && data?.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch {}
    };
    initUser();

    // No-op: GeneralContext listens for sell event

    fetchRealTimeData(); // Initial fetch
    const interval = setInterval(fetchRealTimeData, 10000);

    return () => { clearInterval(interval); };
  }, [fetchRealTimeData]);

  const handleSearch = async (e) => {
    const value = e.target.value.toUpperCase();
    setSearchTerm(value);
    setError(null); // Clear any previous errors

    if (value.length > 1) {
      try {
        const { data } = await axios.get(`http://localhost:3002/api/stocks/search?keywords=${encodeURIComponent(value)}`);
        const items = data.data || [];
        const normalized = items.map(item => ({
          symbol: (item.symbol || item.symbols || '').toUpperCase().includes('.NSE') ? (item.symbol || item.symbols) : `${(item.symbol || item.symbols || '').toUpperCase()}.NSE`,
          instrument_name: item.instrument_name || item.name || item.symbol || ''
        })).filter(x => x.symbol && x.symbol !== '.NSE');

        if (normalized.length > 0) {
          setSearchResults(normalized);
        } else {
          setSearchResults([]);
          setError('No matching stocks found');
        }
      } catch (error) {
        console.error('Error searching stocks:', error);
        setSearchResults([]);
        setError('Failed to search stocks. Please try again.');
      }
    } else {
      setSearchResults([]);
    }
  };

  const addToWatchlist = (symbol) => {
    if (defaultSymbols.length >= 50) {
      setError('Maximum watchlist limit (50) reached');
      return;
    }

    if (!defaultSymbols.includes(symbol)) {
      setDefaultSymbols(prev => [...prev, symbol]);
      // Subscribe to new symbol in WebSocket
      if (ws.current) {
        const subscribeMsg = {
          action: 'subscribe',
          symbols: [symbol]
        };
        ws.current.send(JSON.stringify(subscribeMsg));
      }
      fetchRealTimeData(); // Fetch data for the new symbol
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="watchlist-container">
      <div className="search-container">
        <input
          type="text"
          name="search"
          id="search"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search Indian stocks (e.g., RELIANCE, TCS, INFY)"
          className="search"
          autoComplete="off"
        />
        <span className="counts">{Object.keys(stockData).length} / 50</span>
        
        {(searchResults.length > 0 || (error && searchTerm.length > 1)) && (
          <div className="search-results" style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {error ? (
              <div className="search-error" style={{
                padding: '10px',
                color: 'red',
                textAlign: 'center'
              }}>{error}</div>
            ) : (
              searchResults.map((result) => (
                <div
                  key={result.symbol}
                  className="search-result-item"
                  onClick={() => addToWatchlist(result.symbol)}
                  style={{
                    padding: '10px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <span style={{ fontWeight: 'bold' }}>{result.symbol}</span>
                  <span style={{ color: '#666' }}>{result.instrument_name}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <ul className="list">
        {Object.entries(stockData).map(([symbol, data]) => {
          if (['code', 'message', 'status'].includes(symbol)) return null;
          const stockInfo = {
            name: symbol,
            price: parseFloat(data.price),
            percent_change: data.percent_change ? parseFloat(data.percent_change) : 0
          };
          return <WatchListItem stock={stockInfo} key={symbol} />;
        })}
      </ul>

      <DoughnutChart data={{
        labels: Object.keys(stockData).filter(key => !['code', 'message', 'status'].includes(key)),
        datasets: [{
          label: "Price",
          data: Object.values(stockData).map(stock => parseFloat(stock.price)),
          backgroundColor: [
            "rgba(255, 99, 132, 0.5)",
            "rgba(54, 162, 235, 0.5)",
            "rgba(255, 206, 86, 0.5)",
            "rgba(75, 192, 192, 0.5)",
            "rgba(153, 102, 255, 0.5)",
            "rgba(255, 159, 64, 0.5)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        }]
      }} />
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  const formattedPercent = stock.percent_change 
    ? `${stock.percent_change > 0 ? '+' : ''}${stock.percent_change.toFixed(2)}%`
    : '0.00%';

  const handleMouseEnter = (e) => {
    setShowWatchlistActions(true);
  };

  const handleMouseLeave = (e) => {
    setShowWatchlistActions(false);
  };

  return (
    <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="item">
        <p className={stock.percent_change < 0 ? "down" : "up"}>{stock.name}</p>
        <div className="itemInfo">
          <span className={`percent ${stock.percent_change < 0 ? "down" : "up"}`}>
            {formattedPercent}
          </span>
          {stock.percent_change < 0 ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="up" />
          )}
          <span className="price">{stock.price.toFixed(2)}</span>
        </div>
      </div>
      {showWatchlistActions && <WatchListActions uid={stock.name} price={stock.price} />}
    </li>
  );
};

const WatchListActions = ({ uid, price }) => {
  const generalContext = useContext(GeneralContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleOrder = async (orderType) => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert('Please login to place orders');
      return;
    }
    const parsedUser = (() => { try { return JSON.parse(storedUser); } catch { return null; } })();
    const userId = parsedUser?.id || parsedUser?._id || parsedUser?.userId || undefined;

    try {
      setIsSubmitting(true);
      const response = await axios.post('http://localhost:3002/api/orders', {
        symbol: uid,
        price: price,
        quantity: quantity,
        type: orderType, // 'BUY' or 'SELL'
        orderType: 'MARKET',
        status: 'PENDING',
        userId: userId,
        timestamp: new Date().toISOString()
      });

      if (response.data.success) {
        alert(`${orderType} order placed successfully!`);
        
        // If it's a buy order, update user's holdings
        if (orderType === 'BUY') {
          try {
            await axios.post('http://localhost:3002/api/holdings/update', {
              userId: userId,
              symbol: uid,
              quantity: quantity,
              averagePrice: price,
              lastPrice: price,
              timestamp: new Date().toISOString()
            });
          } catch (holdingError) {
            console.error('Error updating holdings:', holdingError);
          }
        }
        
        // If it's a sell order, update user's holdings
        if (orderType === 'SELL') {
          try {
            await axios.post('http://localhost:3002/api/holdings/update', {
              userId: userId,
              symbol: uid,
              quantity: -quantity, // Negative quantity for sell orders
              lastPrice: price,
              timestamp: new Date().toISOString()
            });
          } catch (holdingError) {
            console.error('Error updating holdings:', holdingError);
          }
        }

      } else {
        alert(`Failed to place ${orderType.toLowerCase()} order: ${response.data.message}`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred while placing the order';
      alert(`Error placing ${orderType.toLowerCase()} order: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyClick = () => {
    generalContext.openBuyWindow(uid, 'BUY');
  };
  const handleSellClick = () => {
    generalContext.openBuyWindow(uid, 'SELL');
  };

  return (
    <span className="actions">
      <span>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ marginRight: '8px', fontSize: '14px' }}>Quantity:</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            style={{
              width: '60px',
              padding: '4px',
              marginRight: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Tooltip
            title="Buy (B)"
            placement="top"
            arrow
            TransitionComponent={Grow}
          >
            <button 
              className="buy" 
              onClick={handleBuyClick}
              disabled={isSubmitting}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#4CAF50',
                color: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Processing...' : 'Buy'}
            </button>
          </Tooltip>
          <Tooltip
            title="Sell (S)"
            placement="top"
            arrow
            TransitionComponent={Grow}
          >
            <button 
              className="sell" 
              onClick={handleSellClick}
              disabled={isSubmitting}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#f44336',
                color: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Processing...' : 'Sell'}
            </button>
          </Tooltip>
        </div>
        <Tooltip
          title="Analytics (A)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="action">
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
          <button className="action">
            <MoreHoriz className="icon" />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};
