const express = require("express");
const Product = require("../models/Shop");
const client = require("prom-client"); // Import Prometheus client
const router = express.Router();

// Define Prometheus metrics
const productRequestsCounter = new client.Counter({
  name: "product_requests_total",
  help: "Total number of requests to the product API",
  labelNames: ["method", "endpoint", "status_code"]
});

const productRequestDurationHistogram = new client.Histogram({
  name: "product_request_duration_seconds",
  help: "Histogram of product request durations",
  labelNames: ["method", "endpoint"],
  buckets: [0.1, 0.3, 1.5, 5, 10] // Custom buckets
});

const activeProductsGauge = new client.Gauge({
  name: "active_products_total",
  help: "Total number of active products in the database"
});

// Middleware to record request duration
router.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000; // Duration in seconds
    productRequestDurationHistogram.labels(req.method, req.originalUrl).observe(duration);
    productRequestsCounter.labels(req.method, req.originalUrl, res.statusCode).inc();
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

    // Update active products count after insert
    activeProductsGauge.set(await Product.countDocuments());

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

    // Update active products count after insert
    activeProductsGauge.set(await Product.countDocuments());

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

    // Update active products count after delete
    activeProductsGauge.set(await Product.countDocuments());

    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "An error occurred while deleting the product." });
  }
});

// Expose the /metrics route for Prometheus scraping
router.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(500).json({ error: "An error occurred while fetching metrics." });
  }
});

module.exports = router;
