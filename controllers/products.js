const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAllProducts = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const products = await db.collection('products').find().toArray();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

const createProduct = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
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
    const result = await db.collection('products').insertOne(product);
    res.status(201).json({ _id: result.insertedId, ...product });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const productId = req.params.id;
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const updateFields = { updatedAt: new Date() };
    if (req.body.name) updateFields.name = req.body.name;
    if (req.body.description) updateFields.description = req.body.description;
    if (req.body.price) updateFields.price = req.body.price;
    if (req.body.stock) updateFields.stock = req.body.stock;
    if (req.body.category) updateFields.category = req.body.category;
    if (req.body.sku) updateFields.sku = req.body.sku;
    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(productId) },
      { $set: updateFields }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const productId = req.params.id;
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const result = await db.collection('products').deleteOne({ _id: new ObjectId(productId) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

module.exports = { getAllProducts, createProduct, updateProduct, deleteProduct };