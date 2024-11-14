const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { verifyToken } = require('../utils/jwtUtils');

// Get all notifications for the current user
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);  // Limit to last 20 notifications
    res.json({notifications});
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread notifications for the current user
router.post('/unread', verifyToken, async (req, res) => {
  try {
    console.log(req.body.userId);
    const notifications = await Notification.find({ user: req.body.userId, isRead: false })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a notification as read
router.post('/:id/read', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id,user :req.user.userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;