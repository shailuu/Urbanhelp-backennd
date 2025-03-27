const User = require("../models/user-models");
const Service = require("../models/service");
const WorkWithUs = require("../models/workwithus-model");
const Booking = require('../models/booking-model');

// List resources with pagination and search
exports.listResources = async (req, res) => {
  try {
    const { resource } = req.params;
    const { page = 1, limit = 10, search = '', sort = '-createdAt' } = req.query;
    
    let Model;
    switch(resource) {
      case 'users': Model = User; break;
      case 'services': Model = Service; break;
      case 'workwithus': Model = WorkWithUs; break;
      case 'bookings': Model = Booking; break;
      default: return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Build search query
    let query = {};
    if (search) {
      const searchFields = Object.keys(Model.schema.paths)
        .filter(path => Model.schema.paths[path].instance === 'String')
        .map(path => ({ [path]: { $regex: search, $options: 'i' } }));
      
      query = searchFields.length > 0 ? { $or: searchFields } : {};
    }
    
    const [data, count] = await Promise.all([
      Model.find(query)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean(),
      Model.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single resource
exports.getResource = async (req, res) => {
  try {
    const { resource, id } = req.params;
    
    let Model;
    switch(resource) {
      case 'users': Model = User; break;
      case 'services': Model = Service; break;
      case 'workwithus': Model = WorkWithUs; break;
      case 'bookings': Model = Booking; break;
      default: return res.status(404).json({ error: 'Resource not found' });
    }
    
    const data = await Model.findById(id).lean();
    if (!data) {
      return res.status(404).json({ error: `${resource.slice(0, -1)} not found` });
    }
    
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new resource
exports.createResource = async (req, res) => {
  try {
    const { resource } = req.params;
    const payload = req.body;
    
    let Model;
    switch(resource) {
      case 'users': Model = User; break;
      case 'services': Model = Service; break;
      case 'workwithus': Model = WorkWithUs; break;
      case 'bookings': Model = Booking; break;
      default: return res.status(404).json({ error: 'Resource not found' });
    }
    
    const newItem = new Model(payload);
    await newItem.save();
    
    res.status(201).json({ 
      success: true, 
      message: `${resource.slice(0, -1)} created successfully`,
      data: newItem
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: err.message });
  }
};

// Update resource
exports.updateResource = async (req, res) => {
  try {
    const { resource, id } = req.params;
    const payload = req.body;
    
    let Model;
    switch(resource) {
      case 'users': Model = User; break;
      case 'services': Model = Service; break;
      case 'workwithus': Model = WorkWithUs; break;
      case 'bookings': Model = Booking; break;
      default: return res.status(404).json({ error: 'Resource not found' });
    }
    
    const updatedItem = await Model.findByIdAndUpdate(
      id, 
      payload, 
      { new: true, runValidators: true }
    ).lean();
    
    if (!updatedItem) {
      return res.status(404).json({ error: `${resource.slice(0, -1)} not found` });
    }
    
    res.json({ 
      success: true, 
      message: `${resource.slice(0, -1)} updated successfully`,
      data: updatedItem
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: err.message });
  }
};

// Delete resource
exports.deleteResource = async (req, res) => {
  try {
    const { resource, id } = req.params;
    
    let Model;
    switch(resource) {
      case 'users': Model = User; break;
      case 'services': Model = Service; break;
      case 'workwithus': Model = WorkWithUs; break;
      case 'bookings': Model = Booking; break;
      default: return res.status(404).json({ error: 'Resource not found' });
    }
    
    const deletedItem = await Model.findByIdAndDelete(id).lean();
    
    if (!deletedItem) {
      return res.status(404).json({ error: `${resource.slice(0, -1)} not found` });
    }
    
    res.json({ 
      success: true, 
      message: `${resource.slice(0, -1)} deleted successfully`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get dashboard statistics
exports.getStats = async (req, res) => {
  try {
    const [users, services, workwithus, bookings] = await Promise.all([
      User.countDocuments(),
      Service.countDocuments(),
      WorkWithUs.countDocuments(),
      Booking.countDocuments()
    ]);
    
    res.json({
      success: true,
      data: { users, services, workwithus, bookings }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle admin status for user
exports.toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent modifying own admin status
    if (user._id.toString() === req.user.userID) {
      return res.status(400).json({ error: 'Cannot modify your own admin status' });
    }
    
    user.isAdmin = !user.isAdmin;
    await user.save();
    
    res.json({
      success: true,
      message: `Admin status ${user.isAdmin ? 'granted' : 'revoked'}`,
      data: { isAdmin: user.isAdmin }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};