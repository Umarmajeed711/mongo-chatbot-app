import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
    from: { type: mongoose.ObjectId, ref: 'users', required: true },
    to: { type: mongoose.ObjectId, ref: 'users', required: true },
    message: {type: String, required: true},
    imageUrl: {type: String},
    createdOn: { type: Date, default: Date.now },
});

const Message = mongoose.model("message",messageSchema)
export default Message
