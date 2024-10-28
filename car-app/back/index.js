import express from 'express';
import mongoose from "mongoose"
import bcrypt from 'bcryptjs'
import { User } from './model/UserDetails.js'
import cors from 'cors'
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use(cors());


const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jdsds039[]]pou89ywe";

mongoose.connect('mongodb+srv://akhiljose:QLeXvX9q96D9m2mo@carapp.ntg3p.mongodb.net/?retryWrites=true&w=majority&appName=CarAPP')
        .then(() => console.log('connected to database'))
        .catch( ()=>console.log("not connected"))




app.post("/register", async (req, res) => {
  const { name, email, mobile} = req.body;
  console.log(req.body);

  // Check if user already exists
  const oldUser = await User.findOne({ email: email });

  if (oldUser) {
    return res.send({ status: "error", data: "User already exists!!" });
  }

  let encryptedPassword = null; // Initialize encryptedPassword as null

  try {
    await User.create({
      name: name,
      email: email,
      mobile,
      password: encryptedPassword, // Save as null if password is not provided
    });
    res.send({ status: "ok", data: "User Created" });
  } catch (error) {
    res.send({ status: "error", data: error });
  }
});

app.post("/login-user", async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  try {
    // Find user by email
    const oldUser = await User.findOne({ email: email });

    if (!oldUser) {
      return res.json({ message: "User doesn't exist!!" });
    }

    // Check if password is null
    if (!oldUser.password) {
      return res.json({ message: "Invalid credentials" });
    }

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, oldUser.password);

    if (isMatch) {
      const token = jwt.sign({ email: oldUser.email }, JWT_SECRET);
      console.log(token);
      return res.json({ status: "ok", data: token, isadmin: oldUser.isadmin });
    } else {
      return res.json({ message: "Invalid credentials" });
    }
  } catch (error) {
    
    return res.json({ message: 'Internal server error' });
  }
});

app.post("/userdata", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    const useremail = user.email;

    User.findOne({ email: useremail }).then((data) => {
      return res.send({ status: "Ok", data: data });
    });
  } catch (error) {
    return res.send({ error: error });
  }
});

app.post("/updateuser", async (req, res) => {
  const {name, email, password, mobile} = req.body;
  console.log(req.body);
  try {
    await User.updateOne(
      { email: email },{$set: {name, email:email, password, mobile} }
    );
    return res.send({ status: "Ok", data: "Updated" });
  } catch (error) {
    return res.send({ error: error });
  }
});

app.get("/get-all-user", async (req, res) => {
  try {
    const data = await User.find({});
    res.send({ status: "Ok", data: data });
  } catch (error) {
    return res.send({ error: error });
  }
});


app.get('/get-user-details/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ data: user });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/update-password', async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.json({ status: 'ok', message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ status: 'error', message: 'An error occurred' });
  }
});

// app.post("/delete-user",async (req, res) => {
//  const {id}=req.body;
//  try {
//   await User.deleteOne({_id:id});
//   res.send({status:"Ok",data:"User Deleted"});
//  } catch (error) {
//   return res.send({ error: error });
  
//  }
// })



app.listen(5001, () => {
  console.log("Node js server started.");
});
