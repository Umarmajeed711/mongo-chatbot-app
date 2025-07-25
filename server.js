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




const PORT = process.env.PORT || 5002;
const app = express();

const server = createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: "*"} });




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


// get all users

app.get("/api/v1/users" , async (req,res) => {

  try{

    let users = await Users.find({},{password:0})

    res.status(200).send({message:"User Found", users:users})

  }catch(error){
    res.status(500).send({message:"Internal server error"})

  }
} )


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