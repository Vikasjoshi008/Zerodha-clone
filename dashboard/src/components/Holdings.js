import React, { useState, useEffect } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalGraph";
import "./Holdings.css";
import { CircularProgress, Typography, Box } from "@mui/material";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";

const Holdings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [allHoldings, setAllHoldings] = useState([]);

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        setIsLoading(true);
        const res = await     axios.get("http://localhost:3002/api/stocks/allHoldings");
        setAllHoldings(res.data);
      } catch (error) {
        console.error("Error fetching holdings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHoldings();
    // Fetch data every 30 seconds
    const interval = setInterval(fetchHoldings, 30000);
    return () => clearInterval(interval);
  }, []);

  // const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  const labels = allHoldings.map((subArray) => subArray["name"]);

  const data = {
    labels,
    datasets: [
      {
        label: "Current Value",
        data: allHoldings.map((stock) => stock.price * stock.qty),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        borderColor: "rgba(53, 162, 235, 1)",
        borderWidth: 1
      },
      {
        label: "Investment Value",
        data: allHoldings.map((stock) => stock.avg * stock.qty),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1
      }
    ],
  };

  // export const data = {
  //   labels,
  //   datasets: [
  // {
  //   label: 'Dataset 1',
  //   data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
  //   backgroundColor: 'rgba(255, 99, 132, 0.5)',
  // },
  //     {
  //       label: 'Dataset 2',
  //       data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
  //       backgroundColor: 'rgba(53, 162, 235, 0.5)',
  //     },
  //   ],
  // };

  return (
    <>
      <h3 className="title">Holdings ({allHoldings.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Net chg.</th>
              <th>Day chg.</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                  <CircularProgress size={24} />
                </td>
              </tr>
            )}
            {!isLoading && allHoldings.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                  <Typography>No holdings found</Typography>
                </td>
              </tr>
            )}
            {!isLoading && allHoldings.map((stock, index) => {
              const curValue = stock.price * stock.qty;
              const pnl = curValue - stock.avg * stock.qty;
              const isProfit = pnl >= 0.0;
              const profClass = isProfit ? "profit" : "loss";
              const dayClass = stock.isLoss ? "loss" : "profit";

              return (
                <tr key={index}>
                  <td className="instrument-cell">
                    <div className="instrument-name">{stock.name}</div>
                    <div className="instrument-qty">{stock.qty} Qty.</div>
                  </td>
                  <td>{stock.qty}</td>
                  <td>₹{stock.avg.toFixed(2)}</td>
                  <td>₹{stock.price.toFixed(2)}</td>
                  <td>₹{curValue.toFixed(2)}</td>
                  <td className={profClass}>
                    {isProfit ? "+" : ""}₹{Math.abs(pnl).toFixed(2)}
                    {isProfit ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </td>
                  <td className={profClass}>
                    {isProfit ? "+" : ""}{stock.net}%
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

      <div className="row">
        <div className="col">
          <h5>
            29,875.<span>55</span>{" "}
          </h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5>
            31,428.<span>95</span>{" "}
          </h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5>1,553.40 (+5.20%)</h5>
          <p>P&L</p>
        </div>
      </div>
      {allHoldings.length > 0 ? (
        <div className="chart-container">
          <VerticalGraph data={data} />
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Loading holdings data...</p>
        </div>
      )}
    </>
  );
};

export default Holdings;
