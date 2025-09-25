const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;
const { validationResult } = require('express-validator');

const getAll = async (req, res) => {
  try {
    const result = await mongodb.getDatabase().collection('products').find();
    const products = await result.toArray();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
};

const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const product = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      sku: req.body.sku,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const response = await mongodb.getDatabase().collection('products').insertOne(product);
    if (response.acknowledged) res.status(201).json(product);
    else res.status(500).json({ error: 'Failed to create product' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
};

const updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const productId = new ObjectId(req.params.id);
    const product = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      sku: req.body.sku,
      updatedAt: new Date()
    };
    const response = await mongodb.getDatabase().collection('products').replaceOne({ _id: productId }, product);
    if (response.modifiedCount > 0) res.status(204).send();
    else res.status(404).json({ error: 'Product not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
};

const deleteProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const productId = new ObjectId(req.params.id);
    const response = await mongodb.getDatabase().collection('products').deleteOne({ _id: productId });
    if (response.deletedCount > 0) res.status(204).send();
    else res.status(404).json({ error: 'Product not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
};

module.exports = { getAll, createProduct, updateProduct, deleteProduct };