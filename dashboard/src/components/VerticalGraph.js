import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        font: {
          size: 12
        }
      }
    },
    title: {
      display: true,
      text: "Holdings Overview",
      font: {
        size: 16,
        weight: 'bold'
      },
      padding: 20
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};


export function VerticalGraph({ data }) {
  return (
    <div style={{ height: '400px', width: '100%', padding: '20px' }}>
      <Bar options={options} data={data} />
    </div>
  );
}
