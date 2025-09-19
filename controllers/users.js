const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;
const { validationResult } = require('express-validator');

const getAll = async (req, res) => {
  console.log('getAll called with req:', req.body); 
  try {
    console.log('Attempting to fetch users from database');
    const result = await mongodb.getDatabase().collection('users').find({}, { projection: { password: 0 } });
    const users = await result.toArray();
    console.log('Fetched users:', users);
    res.status(200).json(users);
  } catch (err) {
    console.log('Error fetching users:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const createUser = async (req, res) => {
  console.log('createUser called with req.body:', req.body); 
  const errors = validationResult(req);
  console.log('Validation result:', errors.array()); 
  if (!errors.isEmpty()) {
    console.log('Validation failed with errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('User object to insert:', user); 
    const response = await mongodb.getDatabase().collection('users').insertOne(user);
    console.log('Insert response:', response); 
    if (response.acknowledged) {
      console.log('User created successfully');
      res.status(201).json(user);
    } else {
      console.log('Insert not acknowledged');
      res.status(500).json({ error: 'Failed to create user' });
    }
  } catch (err) {
    console.log('Error in createUser:', err.message); 
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
};

const updateUser = async (req, res) => {
  console.log('updateUser called with req.params.id:', req.params.id, 'req.body:', req.body); 
  const errors = validationResult(req);
  console.log('Validation result:', errors.array());
  if (!errors.isEmpty()) {
    console.log('Validation failed with errors:', errors.array()); 
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const userId = new ObjectId(req.params.id);
    console.log('Parsed userId:', userId);
    const user = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      updatedAt: new Date()
    };
    console.log('User object to update:', user); 
    const response = await mongodb.getDatabase().collection('users').replaceOne({ _id: userId }, user);
    console.log('Update response:', response); 
    if (response.modifiedCount > 0) {
      console.log('User updated successfully');
      res.status(204).send();
    } else {
      console.log('No user found or no changes made');
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.log('Error in updateUser:', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  console.log('deleteUser called with req.params.id:', req.params.id); 
  try {
    const userId = new ObjectId(req.params.id);
    console.log('Parsed userId:', userId); 
    const response = await mongodb.getDatabase().collection('users').deleteOne({ _id: userId });
    console.log('Delete response:', response); 
    if (response.deletedCount > 0) {
      console.log('User deleted successfully');
      res.status(204).send();
    } else {
      console.log('No user found to delete');
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.log('Error in deleteUser:', err.message); 
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = { getAll, createUser, updateUser, deleteUser };