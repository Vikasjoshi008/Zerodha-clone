const axios = require('axios');
require('dotenv').config();

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

// Cache configuration
const CACHE_DURATION = 10000; // 10 seconds cache
let priceCache = new Map();
let lastCacheClean = Date.now();

// Rate limiting configuration
const REQUESTS_PER_MINUTE = 8;
const REQUEST_WINDOW = 60 * 1000;
let requestTimestamps = [];

// In-memory sample data with more stocks
const sampleData = {
    'AAPL': { price: 185.92, change: 0.75 },
    'MSFT': { price: 332.88, change: -0.25 },
    'GOOGL': { price: 140.23, change: 1.20 },
    'AMZN': { price: 129.79, change: -0.50 },
    'TSLA': { price: 260.05, change: 2.15 },
    'META': { price: 325.85, change: 0.95 },
    'NVDA': { price: 445.20, change: 1.75 },
    'JPM': { price: 148.35, change: -0.35 },
    'V': { price: 242.15, change: 0.45 },
    'JNJ': { price: 156.85, change: -0.15 },
    'WMT': { price: 162.45, change: 0.25 },
    'PG': { price: 150.75, change: 0.30 },
    'MA': { price: 401.25, change: 0.85 }
};

// Rate limit state
let isRateLimited = false;
let rateLimitResetTime = null;
const RATE_LIMIT_DURATION = 60000; // 1 minute

// Function to check rate limit - returns true if not rate limited
function checkRateLimit() {
    const now = Date.now();
    
    if (isRateLimited) {
        if (now >= rateLimitResetTime) {
            isRateLimited = false;
            requestTimestamps = [];
        } else {
            throw new Error('rate_limited');
        }
    }

    requestTimestamps = requestTimestamps.filter(timestamp => 
        now - timestamp < REQUEST_WINDOW
    );
    
    if (requestTimestamps.length >= REQUESTS_PER_MINUTE) {
        isRateLimited = true;
        rateLimitResetTime = now + RATE_LIMIT_DURATION;
        throw new Error('rate_limited');
    }
    
    requestTimestamps.push(now);
    return true;
}

const stockService = {
    // Get real-time price data for multiple symbols
    getRealTimePrice: async (symbols) => {
        const now = Date.now();
        const cachedData = {};
        const symbolsToFetch = [];

        // Check cache for each symbol
        symbols.forEach(symbol => {
            const cached = priceCache.get(symbol);
            if (cached && now - cached.timestamp < CACHE_DURATION) {
                cachedData[symbol] = cached.data;
            } else {
                symbolsToFetch.push(symbol);
            }
        });

        // If all data is cached, return it
        if (symbolsToFetch.length === 0) {
            return {
                success: true,
                data: cachedData
            };
        }

        try {
            checkRateLimit();

            // Fetch new data for uncached symbols
            const response = await axios.get(`${BASE_URL}/price?symbol=${symbolsToFetch.join(',')}&apikey=${TWELVE_DATA_API_KEY}`);
            
            // Cache the new data
            Object.entries(response.data).forEach(([symbol, data]) => {
                if (data && typeof data.price !== 'undefined') {
                    priceCache.set(symbol, {
                        data: {
                            price: parseFloat(data.price),
                            change: parseFloat(data.change || 0)
                        },
                        timestamp: now
                    });
                    cachedData[symbol] = priceCache.get(symbol).data;
                }
            });

            // Clean old cache periodically
            if (now - lastCacheClean > CACHE_DURATION) {
                lastCacheClean = now;
                for (const [symbol, value] of priceCache.entries()) {
                    if (now - value.timestamp > CACHE_DURATION) {
                        priceCache.delete(symbol);
                    }
                }
            }

            return {
                success: true,
                data: cachedData
            };

        } catch (error) {
            // Use cached or sample data without logging errors
            const fallbackData = symbols.reduce((acc, symbol) => {
                const cached = priceCache.get(symbol);
                if (cached && Date.now() - cached.timestamp < 60000) {
                    acc[symbol] = cached.data;
                } else {
                    // Generate semi-random data based on sample data
                    const baseData = sampleData[symbol] || { price: 100.00, change: 0.00 };
                    const randomChange = (Math.random() - 0.5) * 0.1; // ±0.05% change
                    acc[symbol] = {
                        price: parseFloat((baseData.price * (1 + randomChange)).toFixed(2)),
                        change: parseFloat(randomChange.toFixed(2))
                    };
                }
                return acc;
            }, {});
            
            return { 
                success: true, 
                data: { ...cachedData, ...fallbackData },
                usingFallback: true
            };
        }
    },

    // Get quote data for multiple symbols
    getQuotes: async (symbols) => {
        try {
            checkRateLimit();
            const response = await axios.get(`${BASE_URL}/quote?symbol=${symbols.join(',')}&apikey=${TWELVE_DATA_API_KEY}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return { 
                success: false,
                usingFallback: true,
                data: symbols.reduce((acc, symbol) => {
                    acc[symbol] = sampleData[symbol] || { price: 100.00, change: 0.00 };
                    return acc;
                }, {})
            };
        }
    },

    // Search for stocks
    searchSymbols: async (query) => {
        try {
            const normalizedQuery = query.toUpperCase();
            // Search in sample data first
            const localResults = Object.entries(sampleData)
                .filter(([symbol]) => symbol.includes(normalizedQuery))
                .map(([symbol]) => ({
                    symbol,
                    instrument_name: `${symbol} Stock`
                }));

            if (localResults.length > 0) {
                return {
                    success: true,
                    data: localResults
                };
            }

            // If no local results, try API
            checkRateLimit();
            const response = await axios.get(`${BASE_URL}/symbol_search?symbol=${query}&apikey=${TWELVE_DATA_API_KEY}`);
            return {
                success: true,
                data: response.data.data || []
            };
        } catch (error) {
            return {
                success: true,
                data: [],
                usingFallback: true
            };
        }
    },

    // Get time series data
    getTimeSeries: async (symbol, interval = '1min') => {
        try {
            checkRateLimit();
            const response = await axios.get(
                `${BASE_URL}/time_series?symbol=${symbol}&interval=${interval}&apikey=${TWELVE_DATA_API_KEY}`
            );
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                usingFallback: true,
                data: {
                    meta: { symbol },
                    values: []
                }
            };
        }
    }
};

module.exports = stockService;