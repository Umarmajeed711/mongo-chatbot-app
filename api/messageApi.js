import express from "express";
import Message from "../model/Message.js";



export default function(io) {

    const router = express.Router()


// chat send api

router.post('/chat/:id' , async (req,res) => {

 

  const senderId = req.body.token.id
  const receiverId = req.params.id

   const {message} = req.body

  try{

    if(!message){
      return res.status(400).send({message:"write a message first"})
    }

    let sendMessage = await Message.create({
      from:senderId,
      to:receiverId,
      message:message

    })
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