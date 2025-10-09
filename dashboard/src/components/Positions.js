import React, { useState, useEffect } from "react";
import axios from "axios";
import { CircularProgress, Typography } from "@mui/material";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import "./Positions.css";

const Positions = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [positions, setAllPositions] = useState([]);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setIsLoading(true);
        const res = await     axios.get("http://localhost:3002/api/stocks/allPositions");
        setAllPositions(res.data);
      } catch (error) {
        console.error("Error fetching positions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPositions();
    // Fetch data every 30 seconds
    const interval = setInterval(fetchPositions, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h3 className="title">Positions ({positions.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg.</th>
              <th>LTP</th>
              <th>P&L</th>
              <th>Chg.</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  <CircularProgress size={24} />
                </td>
              </tr>
            )}
            {!isLoading && positions.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  <Typography>No active positions</Typography>
                </td>
              </tr>
            )}
            {!isLoading && positions.map((stock, index) => {
              const curValue = stock.price * stock.qty;
              const pnl = curValue - stock.avg * stock.qty;
              const isProfit = pnl >= 0.0;
              const profClass = isProfit ? "profit" : "loss";
              const dayClass = stock.isLoss ? "loss" : "profit";

              return (
                <tr key={index}>
                  <td>
                    <span className={`product-tag ${stock.product.toLowerCase()}`}>
                      {stock.product}
                    </span>
                  </td>
                  <td className="instrument-cell">
                    <div className="instrument-name">{stock.name}</div>
                    <div className={`qty-tag ${stock.qty >= 0 ? 'long' : 'short'}`}>
                      {stock.qty >= 0 ? 'LONG' : 'SHORT'}
                    </div>
                  </td>
                  <td className={stock.qty >= 0 ? "profit" : "loss"}>
                    {stock.qty}
                  </td>
                  <td>₹{stock.avg.toFixed(2)}</td>
                  <td>₹{stock.price.toFixed(2)}</td>
                  <td className={profClass}>
                    {isProfit ? "+" : ""}₹{Math.abs(pnl).toFixed(2)}
                    {isProfit ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </td>
                  <td className={dayClass}>
                    {!stock.isLoss ? "+" : ""}{stock.day}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Positions;
