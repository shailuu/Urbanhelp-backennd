const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin-controller');
const adminAuthMiddleware = require('../middlewares/admin-auth');

// Apply admin auth middleware to all admin routes
router.use(adminAuthMiddleware);

// Generic resource routes
router.get('/:resource', adminController.listResources);
router.get('/:resource/:id', adminController.getResource);
router.post('/:resource', adminController.createResource);
router.put('/:resource/:id', adminController.updateResource);
router.delete('/:resource/:id', adminController.deleteResource);

// Custom admin routes
router.get('/stats', adminController.getStats);
router.post('/users/:id/toggle-admin', adminController.toggleAdminStatus);

module.exports = router;