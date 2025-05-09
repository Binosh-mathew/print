
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { v4: uuidv4 } = require('uuid');

// Get all orders
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all orders...');
    const orders = await Order.find();
    console.log(`Found ${orders.length} orders`);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single order by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`Fetching order with ID: ${req.params.id}`);
    const order = await Order.findById(req.params.id);
    if (order) {
      console.log('Order found:', order);
      res.json(order);
    } else {
      console.log('Order not found');
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(`Error fetching order ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    // Generate a unique orderId if not provided
    const orderId = req.body.orderId || `ORD-${Date.now().toString().slice(-6)}-${uuidv4().slice(0, 4)}`;
    
    // Check if files is an array
    let files = Array.isArray(req.body.files) ? req.body.files : [];
    
    // Handle case when a single file is sent instead of an array
    if (req.body.files && !Array.isArray(req.body.files)) {
      files = [req.body.files];
    }
    
    // Ensure documentName is set from customerName if not provided
    const documentName = req.body.documentName || req.body.customerName;
    
    // Ensure we have the correct number of copies based on files
    const totalCopies = req.body.copies || 
      (files.length > 0 ? files.reduce((total, file) => total + (file.copies || 1), 0) : 1);
    
    // Create new order object
    const order = new Order({
      orderId,
      customerName: req.body.customerName,
      orderDate: req.body.orderDate || new Date(),
      status: req.body.status || 'Pending',
      details: req.body.details,
      userId: req.body.userId,
      files: files,
      copies: totalCopies,
      colorType: req.body.colorType || 'blackAndWhite',
      doubleSided: req.body.doubleSided || false,
      totalPrice: req.body.totalPrice || 0,
      userName: req.body.userName,
      documentName
    });
    
    console.log('Creating new order:', order);
    const newOrder = await order.save();
    console.log('New order created:', newOrder);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update order
router.put('/:id', async (req, res) => {
  try {
    console.log(`Updating order ${req.params.id} with:`, req.body);
    const order = await Order.findById(req.params.id);
    if (order) {
      // Update only the fields that are provided
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          order[key] = req.body[key];
        }
      });

      console.log('Updating order:', order);
      const updatedOrder = await order.save();
      console.log('Order updated:', updatedOrder);
      res.json(updatedOrder);
    } else {
      console.log('Order not found for update');
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(`Error updating order ${req.params.id}:`, error);
    res.status(400).json({ message: error.message });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    console.log(`Deleting order with ID: ${req.params.id}`);
    const result = await Order.findByIdAndDelete(req.params.id);
    if (result) {
      console.log('Order deleted:', result);
      res.json({ message: 'Order deleted', order: result });
    } else {
      console.log('Order not found for deletion');
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(`Error deleting order ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
