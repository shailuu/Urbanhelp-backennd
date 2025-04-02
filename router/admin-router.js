const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/auth-middleware");

const { 
    getUsers, updateUser, deleteUser, 
    getContacts, updateContact, deleteContact, 
    getWorkWithUs, updateWorkWithUs, deleteWorkWithUs 
} = require("../controllers/admin-controller");

// User Management
router.get("/users", authMiddleware, isAdmin, getUsers);
router.put("/users/:id", authMiddleware, isAdmin, updateUser);
router.delete("/users/:id", authMiddleware, isAdmin, deleteUser);

// Contact Management
router.get("/contacts", authMiddleware, isAdmin, getContacts);
router.put("/contacts/:id", authMiddleware, isAdmin, updateContact);
router.delete("/contacts/:id", authMiddleware, isAdmin, deleteContact);

// WorkWithUs Applications
router.get("/workwithus", authMiddleware, isAdmin, getWorkWithUs);
router.put("/workwithus/:id", authMiddleware, isAdmin, updateWorkWithUs);
router.delete("/workwithus/:id", authMiddleware, isAdmin, deleteWorkWithUs);

module.exports = router;