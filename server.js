import "dotenv/config";
import express, { response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import Message from "./model/Message.js";
import cookieParser from "cookie-parser";
import messageApi from "./api/messageApi.js";
import auth from "./api/auth.js"
import Users from "./model/Users.js";
import {createServer}  from "http"
import { Server } from "socket.io";
import path from "path";
import cookie from "cookie"
import Otps from "./model/otp.js";
import { customAlphabet } from "nanoid";
import nodemailer from "nodemailer";



const PORT = process.env.PORT || 5002;
const app = express();

const server = createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3000", credentials: true, methods: "*"} });

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS
  }
});





app.use(
  // cors()
  cors({
    origin: "http://localhost:3000" ,// Your React app URL
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
const mongoURI = process.env.mongoURI;
const Secret = process.env.WEB_TOKEN;


mongoose.connect(mongoURI);

mongoose.connection.on("connected", () => console.log("mongodb is connected"));
mongoose.connection.on("error", () => console.log("mongodb is not connected"));

app.get("/", async (req, res) => {
  let users = await Users.find();

  res.send({ message: "All users", users });

  //   try {
  //   const result = await SignUp.deleteMany({});
  //   console.log('Deleted:', result.deletedCount, 'users');
  // } catch (err) {
  //   console.error(err);
  // }
});

// sign up
app.post("/api/v1/sign-up", async (req, res) => {
  let { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send({ message: "Required parameters missing" });
  }

  email = email.toLowerCase();

  try {
    // const newUser = new SignUp({ name, email, password });
    // await newUser.save();

    // ✅ Check if email already exists
    const existingUser = await Users.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = await Users.create({
      name: name,
      email: email,
      password: hash,
    });
    res.status(201).json({ message: "User created!", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// login
app.post("/api/v1/login", async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: "Required parameters missing" });
  }

  email = email.toLowerCase();

  try {
    // ✅ Check if email already exists
    const existingUser = await Users.findOne({ email });



    if (!existingUser) {
      return res.status(400).json({ message: "User not exists" });
    }

    let isMatched = bcrypt.compareSync(password, existingUser.password);

    if (!isMatched) {
      res.status(401).send({ message: "Password did not Matched" });
      return;
    }

    let token = jwt.sign(
      {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        user_role: existingUser.user_role,
        iat: Date.now() / 1000,
       exp: (Date.now() / 1000) + (60*60*24)
      },
      Secret,
      // { expiresIn: "1d" }
    );

    res.cookie("Token", token, {
      ////////Token Name , payload Name
      maxAge: 86400000, // Define time in milliseonds  = 1 day
      httpOnly: true,
      secure: true,
    });

    res.status(200).send({
      message: "User Logged in",
      user: existingUser
       
        
      
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "Internel Server Error" });
  }
});

// logout
app.get("/api/v1/logout" ,(req,res) =>{
  try{
   res.cookie('Token', ' ', {
        maxAge: 1,
        httpOnly: true,
        // sameSite: "none",
        secure: true
    });

  res.status(200).send({message:"logout successfully"})

    
  }
  catch(error){
    console.log(error);
    
  }
})


/// Forget Password ///

app.post("/api/v1/generate-otp", async(req , res) => {

  let email = req.body.email?.toLowerCase();

  if(!email){
    res.status(400).send({message: "Required Parameter Missing"})
    return;
  }
  try {
    let user = await Users.findOne({email: email});
    if(!user){
      res.status(404).send({message: "User Not Exist"})
      return;
    }
    
    const customNanoid = customAlphabet('1234567890', 5);
    console.log("customNanoid" , customNanoid)
    let generatedOtp = customNanoid()
    await Otps.create({email: email, otp: generatedOtp})
    let mailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: 'Sending OTP For Reset Password',
      text: "",
      html: `
      <!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Chat App - Your OTP</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    <!-- Outer table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <!-- Card -->
          <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background:#0b69ff;padding:22px 24px;color:#ffffff;text-align:left;">
                <h1 style="margin:0;font-size:20px;line-height:24px;">Chat App</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:28px 24px;color:#111827;">
                <p style="margin:0 0 16px;font-size:16px;line-height:22px;">
                  Hi there,
                </p>

                <p style="margin:0 0 20px;font-size:15px;line-height:22px;color:#374151;">
                  Use the verification code below to complete your action. This code is valid for <strong>10 minutes</strong>.
                </p>

                <!-- OTP box -->
                <table cellpadding="0" cellspacing="0" width="100%" style="margin:18px 0 22px;">
                  <tr>
                    <td align="center">
                      <div style="display:inline-block;padding:18px 26px;border-radius:8px;background:#f1f5f9;font-size:28px;letter-spacing:6px;font-weight:700;color:#0b69ff;">
                        ${generatedOtp}
                      </div>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 18px;font-size:14px;color:#6b7280;line-height:20px;">
                  Didn’t request this code? Someone may have entered your email by mistake. If you didn't request it, you can safely ignore this email or contact support.
                </p>

                <!-- Button (optional) -->
                <table cellpadding="0" cellspacing="0" style="margin-top:6px;">
                  <tr>
                    <td align="left">
                      <a href="{{VERIFY_LINK}}" style="display:inline-block;padding:10px 16px;border-radius:6px;background:#0b69ff;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">
                        Verify now
                      </a>
                    </td>
                  </tr>
                </table>

                <hr style="border:none;border-top:1px solid #eef2f7;margin:22px 0;" />

                <p style="margin:0;font-size:13px;color:#9ca3af;line-height:18px;">
                  If you need help, contact us at <a href="mailto:{{SUPPORT_EMAIL}}" style="color:#0b69ff;text-decoration:none;">{{SUPPORT_EMAIL}}</a>.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb;padding:14px 24px;text-align:center;color:#9ca3af;font-size:12px;">
                © <span id="year">{{YEAR}}</span> {{APP_NAME}}. All rights reserved.
              </td>
            </tr>
          </table>
          <!-- End card -->
        </td>
      </tr>
    </table>

    <!-- Plain-text fallback for older clients (not visible but useful if client shows HTML source) -->
    <!--
      Chat App - Verification Code

      Your verification code: ${generatedOtp}
      Expires in 10 minutes.

      If you didn't request this, ignore this message or contact {{SUPPORT_EMAIL}}.
    -->
  </body>
</html>
`
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        res.status(500).send({message: "Internal Server Error"})
      } else {
        // console.log('Email sent: ' + info.response);
        // res.status(200).send({me})
        res.status(200).send({message: "OTP Sent"})
      }
    });
  } catch (error) {
    console.log("Err", error)
    res.status(500).send({message: "Internal Server Error"})
  }
})

app.post('/api/v1/verify-otp', async(req, res) => {
  let {otp, email} = req.body;
  if(!otp || !email){
    res.status(400).send({message: "Required Parameter Missing"})
    return;
  }
  try {
    let resApi = await Otps.findOne({email: email}).sort({createdAt: -1});
    console.log("resApi", resApi)
    if(!resApi){
      res.status(404).send({message: "OTP Not Found"})
      return;
    }
    if(otp != resApi.otp){
      res.status(401).send({message: "OTP did not matched"})
      return;
    }
    res.status(200).send({message: "OTP Matched"})
  } catch (error) {
    res.status(500).send({message: "Internal Server Error"})
  }
})

app.post('/api/v1/reset-password', async(req, res) => {
  let {email, otp, pass} = req.body;
  if(!email || !otp || !pass){
    res.status(400).send({message: "Required Parameter Missing"})
    return;
  }
  try {
    let resApi = await Otps.findOne({email: email}).sort({createdAt: -1});
    console.log("resApi", resApi)
    if(!resApi){
      res.status(404).send({message: "OTP Not Found"})
      return;
    }
    if(otp != resApi.otp){
      res.status(401).send({message: "OTP did not matched"})
      return;
    }
    // res.status(200).send({message: "OTP Matched"})
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(pass, salt);
    await Users.findOneAndUpdate({email: email}, {password: hash})
    res.status(200).send({message: "Password Changed"})
  } catch (error) {
    res.status(500).send({message: "Internal Server Error"})
  }
})

///////

// middle ware check user login or not
app.use('/api/v1/*splat' ,async (req, res, next) => {

    
    if (!req?.cookies?.Token) {
        res.status(401).send({
            message: "Unauthorized"
            

            
        })
        return;
    }

    jwt.verify(req?.cookies.Token, Secret, (err, decodedData) => {
        if (!err) {

           

            const nowDate = new Date().getTime() / 1000;

            if (decodedData.exp < nowDate) {

                res.status(401);
                res.cookie('Token', '', {
                    maxAge: 1,
                    httpOnly: true,
                    // sameSite: "none",
                    secure: true
                });
                res.send({ message: "token expired" })

            } else {

                console.log("token approved");
              
                

                // req.body.token = decodedData

                  req.body = {
                    ...req.body,
                    token: decodedData
                }

                
                next();
            }
        } else {
            res.status(401).send({message: "invalid token"})
        }
    });
})

// get all users

app.get("/api/v1/users" , async (req,res) => {

   const  name = req.query.user;

  
 
  try{

     let users;

    if(name){
     users = await Users.find({$text: {$search: name}},{password:0})
    }
    else{
     users = await Users.find({},{password:0})
    }

    

    res.status(200).send({message:"User Found", users:users})

  }catch(error){
    res.status(500).send({message:"Internal server error"})

  }
} )



// get user details

app.get('/api/v1/user-detail' , async(req, res) => {

    let queryUserId;

    if(req?.query.user_id){
      queryUserId = req.query.user_id;


    }
    else{
       queryUserId = req.body.token.id;

    }
    

    try {
        let result = await Users.findById(queryUserId, {password: 0})
        
        res.status(200).send({message: "User Found" , user: {
        user_id: result._id,
        name: result.name,
        email: result.email,
        phone: result.phone,
        user_role: result.user_role,
        profile: result.profile,
        create_at: result.created_at,
        updated_at: result.updated_at,
        email_verified: result.email_verified,
        }})
    } catch (error) {
        console.log("Error", error);
        res.status(500).send({message: "Internal Server Error",error})
    }
})

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
     // console.log('a user connected', socket.id);
    console.log("Socket cookie: ", socket?.handshake?.headers?.cookie);
    let userCookie;
    if(socket?.handshake?.headers?.cookie){
        userCookie = cookie.parse(socket?.handshake?.headers?.cookie);
        
        if (!userCookie?.Token) {
            socket.disconnect();
        }
    
        jwt.verify(userCookie.Token, Secret, (err, decodedData) => {
            if (!err) {
                const nowDate = new Date().getTime() / 1000;
    
                if (decodedData.exp < nowDate) {
                    socket.disconnect()
                } else {
    
                }
            } else {
                socket.disconnect()
            }
        });
    }

    socket.on("disconnect", (reason) => {
        console.log("Client disconnected:", socket.id, "Reason:", reason);
    });

});

app.use("/api/v1",messageApi(io))



server.listen(PORT, () => {
    console.log("Server is Running")
})


// setInterval(() => {

//     io.emit("Test topic", { event: "ADDED_ITEM", data: "some data" });
//     // console.log("emiting data to all client");

// }, 2000)
// app.listen(PORT, () => {
//   console.log("Server is running on port", PORT);
// });

const __dirname = path.resolve(); // import the path first I:\Backend\Node.js\Full-Ecommerce\web-frontened
const fileLocation = path.join(__dirname, "./chat-frontened/build");
app.use("/", express.static(fileLocation));
app.use("/*splat", express.static(fileLocation));

mongoose.connection.on('connected', function () {//connected
    console.log("Mongoose is connected");
});

mongoose.connection.on('disconnected', function () {//disconnected
    console.log("Mongoose is disconnected");
    process.exit(1);
});

mongoose.connection.on('error', function (err) {//any error
    console.log('Mongoose connection error: ', err);
    process.exit(1);
});