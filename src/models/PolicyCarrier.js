import mongoose from 'mongoose'

const policyCarrierSchema = new mongoose.Schema({
  carrier_name: { type: String, required: true },
})

export default mongoose.model('PolicyCarrier', policyCarrierSchema)
