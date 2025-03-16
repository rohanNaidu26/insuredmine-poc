import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Message', messageSchema)
