const Notification = require('../models/Notification');
const User = require('../models/User');
const moment = require('moment-timezone');

class NotificationService {
  static async createNotification({ userId, type, content, relatedEntity = null ,timezone}) {
    try {
      const localTime = moment().tz(timezone);
      console.log("1"+userId, type, content, relatedEntity ,timezone);

      if (!userId || !type || !content) {
        throw new Error('Missing required fields for notification');
      }
  console.log(userId, type, content, relatedEntity);
      const notification = new Notification({
        user: userId,
        type,
        content,
        relatedEntity,
        createdAt: localTime.toDate(),
      });
  
  
      await notification.save();
      console.log("1"+notification);

      await User.findByIdAndUpdate(userId, {
        $push: { notifications: notification._id }
      });
  
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async getUnreadNotifications(userId) {
    try {
      return await Notification.find({ user: userId, isRead: false }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      throw error;
    }
  }

  static async markNotificationAsRead(notificationId) {
    try {
      return await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;