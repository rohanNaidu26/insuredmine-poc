import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true},
  userName: { type: String, required: true, index:true},
  dob: { type: Date,  },
  address: { type: String,  },
  phone: { type: String },
  state: { type: String,  },
  zip_code: { type: String,  },
  email: { type: String },
  gender: { type: String },
  userType: { type: String,  }
})

export default mongoose.model('User', userSchema)