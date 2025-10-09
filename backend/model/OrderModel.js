const { model } = require("mongoose");

const { OrderSchema } = require("../schemas/OrderSchema");

const OrderModel = new model("Order", OrderSchema);

module.exports = { OrderModel };
