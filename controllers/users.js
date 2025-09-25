const mongodb = require('../data/database');
const bcrypt = require('bcrypt');
const ObjectId = require('mongodb').ObjectId;

const getAllUsers = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const users = await db.collection('users').find().toArray();
    res.status(200).json(users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const createUser = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: 'local'
    };
    const result = await db.collection('users').insertOne(user);
    res.status(201).json({ _id: result.insertedId, ...user, password: undefined });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const updateUser = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const userId = req.params.id;
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const { name, email, password, role } = req.body;
    const updateFields = { updatedAt: new Date() };
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (password) updateFields.password = await bcrypt.hash(password, 10);
    if (role) updateFields.role = role;
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateFields }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const userId = req.params.id;
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(userId) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };