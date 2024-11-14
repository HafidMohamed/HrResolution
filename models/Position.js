const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const positionSchema = new Schema({
  name: String,
  description: String,
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  hourlyRate: {
    type: Number,
    required: true,
  },
  colour: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

});

const Position = mongoose.model('Position', positionSchema);
module.exports = Position;