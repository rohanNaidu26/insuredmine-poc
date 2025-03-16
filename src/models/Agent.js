import mongoose from 'mongoose'

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
})

export default mongoose.model('Agent', agentSchema)
