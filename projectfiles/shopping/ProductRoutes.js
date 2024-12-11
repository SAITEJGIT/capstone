const express = require("express");
const promClient = require("prom-client");
const Product = require("../models/Shop");
const winston = require("winston");
const LokiTransport = require("winston-loki");
const router = express.Router();

// Initialize Prometheus Metrics
const register = new promClient.Registry();

// HTTP request duration metric
const httpDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Histogram of HTTP request durations",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 1.5, 5, 10], // Example buckets (in seconds)
});

// HTTP request count metric
const httpRequestCount = new promClient.Counter({
  name: "http_request_count_total",
  help: "Total HTTP requests count",
  labelNames: ["method", "route", "status_code"],
});

// Register metrics
register.registerMetric(httpDuration);
register.registerMetric(httpRequestCount);

// Set up Prometheus metrics endpoint
router.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", promClient.register.contentType);
    res.send(await register.metrics());
  } catch (err) {
    res.status(500).json({ error: "Error generating Prometheus metrics." });
  }
});

// Set up Loki logger
const logFormat = winston.format.printf(({ message }) => {
  return message;
});

const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new LokiTransport({
      host: 'http://localhost:3100', // Loki server URL
      labels: { job: 'express' },
      json: true,
    }),
  ],
});

// Middleware to measure request duration and log data
router.use((req, res, next) => {
  const end = httpDuration.startTimer();
  const route = req.route ? req.route.path : req.path;
  res.on('finish', () => {
    const { statusCode } = res;
    // Record the duration and count metrics
    end({ method: req.method, route, status_code: statusCode });
    httpRequestCount.inc({ method: req.method, route, status_code: statusCode });
    // Log request details to Loki
    logger.info(`${req.method} ${route} ${statusCode}`);
  });
  next();
});

// Create multiple products (bulk insertion)
router.post("/bulk", async (req, res) => {
  try {
    const products = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Please provide an array of products." });
    }

    const invalidProducts = products.filter(product =>
      !product.title || !product.description || !product.imgSrc || !product.price
    );

    if (invalidProducts.length > 0) {
      return res.status(400).json({ error: "Some products are missing required fields.", invalidProducts });
    }

    const createdProducts = await Product.insertMany(products);
    res.status(201).json(createdProducts);
  } catch (error) {
    console.error("Error creating bulk products:", error);
    res.status(500).json({ error: "An error occurred while creating bulk products." });
  }
});

// Create a new product
router.post("/", async (req, res) => {
  try {
    const { title, description, imgSrc, price } = req.body;

    if (!title || !description || !imgSrc || !price) {
      return res.status(400).json({ error: "All fields are required (title, description, imgSrc, price)." });
    }

    const newProduct = new Product({ title, description, imgSrc, price });
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ error: "An error occurred while creating the product." });
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "An error occurred while fetching products." });
  }
});

// Get a specific product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "An error occurred while fetching the product." });
  }
});

// Update a product
router.put("/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ error: "An error occurred while updating the product." });
  }
});

// Delete a product
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "An error occurred while deleting the product." });
  }
});

module.exports = router;
