import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid, orderType = 'BUY' }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState("");
  const { closeBuyWindow } = useContext(GeneralContext);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleBuyClick = async () => {
    if (!stockPrice || !stockQuantity) {
      setError("Please enter both quantity and price");
      return;
    }

    const numericPrice = parseFloat(stockPrice);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError("Please enter a valid price");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await axios.post("http://localhost:3002/newOrder", {
        name: uid,
        qty: stockQuantity,
        price: numericPrice,
        mode: orderType,
      });
      
      setOrderSuccess(true);
      // Close window after showing success message
      setTimeout(() => {
        closeBuyWindow();
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelClick = () => {
    closeBuyWindow();
  };

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              value={stockQuantity}
              min="1"
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
              placeholder="Enter price"
              min="1"
            />
          </fieldset>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {orderSuccess && (
        <div className="success-message" style={{ color: 'green', marginTop: '10px', textAlign: 'center' }}>
          Order placed successfully!
        </div>
      )}

      <div className="buttons">
        <span>Margin required ₹140.65</span>
        <div>
          <button 
            className={`btn ${isLoading ? 'btn-disabled' : 'btn-blue'}`}
            onClick={handleBuyClick}
            disabled={isLoading}
          >
            {isLoading ? 'Placing Order...' : (orderType === 'SELL' ? 'Sell' : 'Buy')}
          </button>
          <button 
            className="btn btn-grey"
            onClick={handleCancelClick}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
