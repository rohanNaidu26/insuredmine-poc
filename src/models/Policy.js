import mongoose from 'mongoose'

const policySchema = new mongoose.Schema({
  policy_number: { type: String, required: true },
  policy_mode: { type: Number },
  premium_amount_written: { type: Number },
  premium_amount: { type: Number },
  policy_type: { type: String },
  policy_start_date: { type: Date },
  policy_end_date: { type: Date },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'PolicyCategory' },
  carrier: { type: mongoose.Schema.Types.ObjectId, ref: 'PolicyCarrier' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

export default mongoose.model('Policy', policySchema)
