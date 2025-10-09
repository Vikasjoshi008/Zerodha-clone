const { Schema } = require("mongoose");

const OrderSchema = new Schema(
  {
    name: String,
    qty: Number,
    price: Number,
    mode: String, // BUY or SELL
    status: { type: String, default: 'PLACED' },
  },
  { timestamps: true }
);

module.exports = { OrderSchema };
