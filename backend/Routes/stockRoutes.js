const express = require('express');
const router = express.Router();
const stockService = require('../services/stockService');

// Sample data for testing
const sampleHoldings = [
    {
        name: "RELIANCE",
        qty: 100,
        avg: 2450.75,
        price: 2460.30,
        isLoss: false,
        net: "+0.39",
        day: "+1.2"
    },
    {
        name: "TCS",
        qty: 50,
        avg: 3200.50,
        price: 3300.25,
        isLoss: false,
        net: "+3.12",
        day: "+0.8"
    },
    {
        name: "INFY",
        qty: 75,
        avg: 1500.25,
        price: 1480.50,
        isLoss: true,
        net: "-1.32",
        day: "-0.5"
    }
];

const samplePositions = [
    {
        product: "MIS",
        name: "NIFTY 12 OCT 19500 CE",
        qty: 50,
        avg: 145.25,
        price: 150.30,
        isLoss: false,
        day: "+3.48"
    },
    {
        product: "NRML",
        name: "BANKNIFTY 12 OCT 43000 PE",
        qty: -25,
        avg: 220.50,
        price: 215.75,
        isLoss: false,
        day: "+2.15"
    }
];

// Get real-time price data
router.get('/real-time-price', async (req, res) => {
    try {
        const { symbols } = req.query;
        if (!symbols) {
            return res.status(400).json({ error: 'Symbols parameter is required' });
        }
        const symbolsArray = symbols.split(',');
        const data = await stockService.getRealTimePrice(symbolsArray);
        res.json(data);
    } catch (error) {
        console.error('Error in /real-time-price:', error);
        res.status(500).json({ error: error.message });
    }
});

// Search stocks
router.get('/search', async (req, res) => {
    try {
        const keywords = req.query.keywords || req.query.q || '';
        if (!keywords) return res.json({ success: true, data: [] });
        const results = await stockService.searchSymbols(keywords);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get intraday data
router.get('/intraday/:symbol', async (req, res) => {
    try {
        const data = await stockService.getIntraday(req.params.symbol);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get daily time series
router.get('/daily/:symbol', async (req, res) => {
    try {
        const data = await stockService.getDailyTimeSeries(req.params.symbol);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all holdings
router.get('/allHoldings', (req, res) => {
    try {
        res.json(sampleHoldings);
    } catch (error) {
        console.error('Error fetching holdings:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all positions
router.get('/allPositions', (req, res) => {
    try {
        res.json(samplePositions);
    } catch (error) {
        console.error('Error fetching positions:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;