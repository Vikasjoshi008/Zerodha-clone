require('dotenv').config();
const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const bodyParser=require('body-parser');
const {HoldingsModel}=require('./model/HoldingsModel');
const {PositionModel}=require('./model/PositionModel');
const {OrderModel}=require('./model/OrderModel');
const cookieParser = require("cookie-parser");
const authRoute = require("./Routes/AuthRoute");
const stockRoutes = require("./Routes/stockRoutes");


const app = express();
const PORT = process.env.PORT || 3002;

// Core middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions={
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'Authorization']
}
app.use(cors(corsOptions));

app.get('/allHoldings', async(req, res) => {
    let allHoldings=await HoldingsModel.find({});
    res.json(allHoldings);
});

app.get('/allPositions', async(req, res) => {
    let allPositions=await PositionModel.find({});
    res.json(allPositions);
});

// Legacy order endpoint (kept for compatibility)
app.post('/newOrder', async (req, res) => {
  try {
    const newOrder = new OrderModel({
      name: req.body.name,
      qty: req.body.qty,
      price: req.body.price,
      mode: req.body.mode,
    });
    await newOrder.save();
    res.status(201).send('Order placed successfully');
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
});

// Normalized orders API for dashboard
app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = new OrderModel({
      name: req.body.symbol,
      qty: req.body.quantity,
      price: req.body.price,
      mode: req.body.type, // BUY/SELL
      status: req.body.status || 'PLACED'
    });
    await newOrder.save();
    res.status(201).json({ success: true, message: 'Order placed successfully' });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
});

// Minimal holdings upsert for buy/sell adjustments
app.post('/api/holdings/update', async (req, res) => {
  try {
    const { userId, symbol, quantity, averagePrice, lastPrice } = req.body;
    if (!symbol || !quantity) {
      return res.status(400).json({ success: false, message: 'symbol and quantity required' });
    }
    const existing = await HoldingsModel.findOne({ name: symbol });
    if (!existing) {
      await HoldingsModel.create({
        name: symbol,
        qty: quantity,
        avg: averagePrice || lastPrice || 0,
        price: lastPrice || averagePrice || 0,
        isLoss: false,
        net: "0",
        day: "0"
      });
    } else {
      const newQty = (existing.qty || 0) + quantity;
      await HoldingsModel.updateOne({ _id: existing._id }, { $set: { qty: newQty, price: lastPrice ?? existing.price } });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Holdings update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update holdings' });
  }
});

// List orders for Orders page
app.get('/api/orders', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const orders = await OrderModel.find(query).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// Auth and stock routes
app.use("/", authRoute);
app.use("/api/stocks", stockRoutes);

// Connect to Mongo and start server
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log("MongoDB is connected successfully");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Routes already mounted above

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something broke on the server!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});