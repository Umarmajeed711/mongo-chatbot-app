import express from "express";
import Message from "../model/Message.js";
import upload from "../cloudinary.js";
import jwt from 'jsonwebtoken';
import 'dotenv/config';

export default function(io) {

    const router = express.Router()


// chat send api

router.post('/chat/:id' ,upload.single("image"), async (req,res) => {



 const decodedToken = jwt.verify(req.cookies.Token, process.env.WEB_TOKEN)

  const senderId = decodedToken.id
  const receiverId = req.params.id

   const {message} = req.body
   const file = req.file

  try{
    let sendMessage;

    if(file){

      // ✅ Get the Cloudinary URL automatically
    const imageUrl = file.path;

      sendMessage = await Message.create({
      from:senderId,
      to:receiverId,
      imageCaption:req.body.imageCaption,
      imageUrl: imageUrl,
      message: ""

    })


    }
    else{

       if(!message){
      return res.status(400).send({message:"write a message first"})
    }


      sendMessage = await Message.create({
      from:senderId,
      to:receiverId,
      message:message

    })
  }
   
     let conversation = await Message.findById(sendMessage._id)
            .populate({path: 'from', select: {password:0}})
            .populate({path: 'to', select: {password:0}})
            .exec();
            io.emit(`${senderId}-${receiverId}`, conversation)
            // io.emit(`personal-channel-${receiverId}`, conversation)

    //  io.emit(`${senderId}-${receiverId}`, sendMessage)
    //  io.emit(`personal-channel-${receiverId}`, sendMessage)
  

    // io.emit(`${senderId}-${receiverId}`, result)

    res.status(200).send({message:"message sent!", chat:conversation})
  
  }
  catch(error){
    res.status(500).send(error)
  }


})



router.get('/allMessages/:id' , async (req,res) => {

    let receiverId = req.params.id;
    let senderId = req.body.token.id

  try{
    let allMessages = await Message.find(
        {
                $or: [
                    {
                        from: receiverId,
                        to: senderId
                    },
                    {
                        from: senderId,
                        to: receiverId,
                    }
                ]}
    )
     .populate({path: 'from', select: {password:0}})
            .populate({path: 'to', select: {password:0}})
            .exec();

    res.status(200).send({message:"get all messages", allMessages: allMessages})
  }
  catch(error){
    res.status(500).send({message:"Internal server error"})
  }
})


return router


}