import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
    {
      name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true // allow multiple docs with null phone
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  user_role: {
    type: String,
    default: 'user'
  },
  profile: {
    type: String,
    default: null
  },
  email_verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
)




const Users = mongoose.model("users",userSchema)
export default Users
