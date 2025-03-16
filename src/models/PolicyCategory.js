import mongoose from 'mongoose'

const policyCategorySchema = new mongoose.Schema({
  category_name: { type: String, required: true },
})

export default mongoose.model('PolicyCategory', policyCategorySchema)
