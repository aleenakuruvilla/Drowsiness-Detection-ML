import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './model/UserDetails.js';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// Secret key for JWT
const JWT_SECRET = "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jdsds039[]]pou89ywe";

// MongoDB connection
mongoose.connect('mongodb+srv://aleenavaithra:gZhcGdwzKbTh4DMs@drowsy.7srtb.mongodb.net/?retryWrites=true&w=majority&appName=drowsy')
  .then(() => console.log('Connected to MongoDB'))
  .catch(e => console.log('Database connection error:', e));

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});
const upload = multer({ storage });

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Registration route with image upload
app.post('/register', upload.single('aadhaarImage'), async (req, res) => {
  const { name, email, mobile } = req.body;
  const imagePath = req.file ? req.file.path : null; // Save image path if uploaded

  // Check if user already exists
  const oldUser = await User.findOne({ email });
  if (oldUser) {
    return res.send({ status: "error", data: "User already exists!!" });
  }

  try {
    await User.create({
      name,
      email,
      mobile,
      image: imagePath,
      password: null,
    });
    res.send({ status: "ok", data: "User Created" });
  } catch (error) {
    res.send({ status: "error", data: error });
  }
});

// Login route
app.post('/login-user', async (req, res) => {
  const { email, password } = req.body;

  try {
    const oldUser = await User.findOne({ email });
    if (!oldUser) {
      return res.json({ message: "User doesn't exist!!" });
    }

    if (!oldUser.password) {
      return res.json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, oldUser.password);
    if (isMatch) {
      const token = jwt.sign({ email: oldUser.email }, JWT_SECRET);
      return res.json({ status: "ok", data: token, isadmin: oldUser.isadmin });
    } else {
      return res.json({ message: "Invalid credentials" });
    }
  } catch (error) {
    return res.json({ message: 'Internal server error' });
  }
});

// Get user data by token
app.post('/userdata', async (req, res) => {
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

// Update user details
app.post('/updateuser', async (req, res) => {
  const { name, email, password, mobile } = req.body;
  try {
    await User.updateOne({ email }, { $set: { name, email, password, mobile } });
    return res.send({ status: "Ok", data: "Updated" });
  } catch (error) {
    return res.send({ error: error });
  }
});

// Get all users
app.get('/get-all-user', async (req, res) => {
  try {
    const data = await User.find({});
    res.send({ status: "Ok", data });
  } catch (error) {
    return res.send({ error: error });
  }
});

// Get user details by ID
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

// Update user password
app.post('/update-password', async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ status: 'ok', message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ status: 'error', message: 'An error occurred' });
  }
});

// Optional: Uncomment to allow user deletion
// app.post("/delete-user", async (req, res) => {
//   const { id } = req.body;
//   try {
//     await User.deleteOne({ _id: id });
//     res.send({ status: "Ok", data: "User Deleted" });
//   } catch (error) {
//     return res.send({ error: error });
//   }
// });

// Start server
app.listen(5001, () => {
  console.log("Node.js server started on port 5001");
});
