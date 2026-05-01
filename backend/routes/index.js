const express  = require('express');
const router   = express.Router();

const { login, getLogin, getMe }                                     = require('../controllers/authController');
const { getDashboard }                                               = require('../controllers/dashboardController');
const { getProducts, addProduct, updateProduct, deleteProduct, getStores } = require('../controllers/productController');
const { getInventory }                                               = require('../controllers/inventoryController');
const { getCustomers, addCustomer, deleteCustomer }                  = require('../controllers/customerController');
const { getSales }                                                   = require('../controllers/salesController');
const { getTransfers, createTransfer }                               = require('../controllers/transferController');
const { getExpiryAlerts }                                            = require('../controllers/expiryController');
const { requireAuth, requireAdmin, requireManager }                  = require('../middleware/auth');

// ── Auth (public) ─────────────────────────────────────────────────────────────
router.get('/auth/login',  getLogin);
router.post('/auth/login', login);
router.get('/auth/me',     requireAuth, getMe);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard',       requireAuth, getDashboard);

// ── Products ──────────────────────────────────────────────────────────────────
router.get('/products',        requireAuth,    getProducts);
router.post('/products',       requireManager, addProduct);
router.put('/products/:id',    requireManager, updateProduct);
router.delete('/products/:id', requireAdmin,   deleteProduct);

// ── Stores ────────────────────────────────────────────────────────────────────
router.get('/stores',          requireAuth,    getStores);

// ── Other data (any logged-in user) ──────────────────────────────────────────
router.get('/inventory', requireAuth, getInventory);
router.get('/customers', requireAuth, getCustomers);
router.post('/customers', requireAuth, addCustomer);
router.delete('/customers/:id', requireAdmin, deleteCustomer);
router.get('/sales',     requireAuth, getSales);
router.get('/transfers', requireAuth, getTransfers);
router.post('/transfers', requireManager, createTransfer);
router.get('/expiry',    requireAuth, getExpiryAlerts);

module.exports = router;
