const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const productsController = require('../controllers/products');

// Middleware para verificar autenticación
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized: Please log in' });
};

// Validaciones para POST y PUT
const productValidationRules = [
  check('name').notEmpty().withMessage('Name is required'),
  check('description').notEmpty().withMessage('Description is required'),
  check('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  check('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  check('category').notEmpty().withMessage('Category is required'),
  check('sku').notEmpty().withMessage('SKU is required')
];

// Rutas con autenticación
router.get('/', isAuthenticated, productsController.getAllProducts);
router.post('/', isAuthenticated, productValidationRules, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, productsController.createProduct);
router.put('/:id', isAuthenticated, productValidationRules, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, productsController.updateProduct);
router.delete('/:id', isAuthenticated, productsController.deleteProduct);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     security:
 *       - OAuth2: []
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *                   name: { type: string }
 *                   description: { type: string }
 *                   price: { type: number }
 *                   stock: { type: integer }
 *                   category: { type: string }
 *                   sku: { type: string }
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new product
 *     security:
 *       - OAuth2: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               category: { type: string }
 *               sku: { type: string }
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               category: { type: string }
 *               sku: { type: string }
 *     responses:
 *       204:
 *         description: Product updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *   delete:
 *     summary: Delete a product
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Product deleted
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
module.exports = router;