const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  content: { type: String, required: true },
  relatedEntity: {
    type: { type: String },
    id: { type: Schema.Types.ObjectId }
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date}
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;