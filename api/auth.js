import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Users from "../model/Users.js";


const router = express.Router();
const Secret = process.env.WEB_TOKEN;



// Signup api
router.post("/sign-up", async (req, res) => {
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
router.post("/login", async (req, res) => {
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
router.get("/logout" ,(req,res) =>{
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



export default router