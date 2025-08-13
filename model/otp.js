import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {type: Date, default: Date.now}
  }
);

const Otps = mongoose.model("otps", otpSchema);
export default Otps;
