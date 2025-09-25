const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const getAll = async (req, res) => {
  try {
    const result = await mongodb.getDatabase().collection('users').find({}, { projection: { password: 0 } });
    const users = await result.toArray();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
};

const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const response = await mongodb.getDatabase().collection('users').insertOne(user);
    if (response.acknowledged) {
      res.status(201).json(user);
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
};

const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const userId = new ObjectId(req.params.id);
    const user = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      updatedAt: new Date()
    };
    const response = await mongodb.getDatabase().collection('users').replaceOne({ _id: userId }, user);
    if (response.modifiedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
};

const deleteUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const userId = new ObjectId(req.params.id);
    const response = await mongodb.getDatabase().collection('users').deleteOne({ _id: userId });
    if (response.deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user', details: err.message });
  }
};

module.exports = { getAll, createUser, updateUser, deleteUser };