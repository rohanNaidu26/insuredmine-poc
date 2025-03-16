import mongoose from 'mongoose'

const accountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  account_name: { type: String, required: true },
  account_type: { type: String, required: true },
})

export default mongoose.model('Account', accountSchema)
