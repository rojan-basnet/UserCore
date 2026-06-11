import express from 'express';
import cors from 'cors';
import connnectDB from './config/db.js';
import User from './models/User.js';
import Project from './models/Project.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { generateAccessToken, generateRefreshToken } from './util/jwt.js';
import cookieParser from 'cookie-parser';
import { setRefreshCookie } from './util/cookies.helper.js';
import Otp from './models/Otp.js';
import { generateOTP, sendOtpN8n } from './util/gen-pin.js';
import { protect } from './middleware/protect.js';

const app = express();
const PORT = 3000;


app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(cookieParser())
app.use(express.json())



app.get('/', (req, res) => {
  res.send(`Hello, World!     `);
});

app.use("/frontend", express.static("frontend"));

// FOR NEW USER SIGN UP
app.post('/api/auth/sign-up', async (req, res) => {
  try {
    const { name, email, password, projectId } = req.body;
    //console.log(req.body);

    if (!name || !email || !password || !projectId) {
      return res.status(400).json({
        message: "All fields are required",
        success: false
      });
    }

    const hashedpwd = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedpwd, projectId, profilePic: "https://grpssdfzlmfljrelqjvv.supabase.co/storage/v1/object/public/pfp/default-pfp.jpg" });

    const generatedOtp = generateOTP();
    //console.log({generatedOtp});

    const newOtp = new Otp({ userId: newUser._id, projectId: newUser.projectId, otp: generatedOtp });
    const searchedProject = await Project.findById(projectId);

    await newUser.save();
    await newOtp.save();
    await sendOtpN8n(newUser.email, generatedOtp, searchedProject.name);

    const accessToken = generateAccessToken(newUser)
    const refreshToken = generateRefreshToken(newUser)


    setRefreshCookie(res, refreshToken)

    return res.status(201).json({
      message: "new user created",
      token: accessToken,
      success: true
    });

  } catch (err) {
    console.log("ERROR:", err);

    if (err.code === 11000) {
      console.log("duplicate email")
      return res.status(409).json({
        message: "duplicate email",
        success: false
      });
    }

    return res.status(500).json({
      message: "server error",
      success: false
    });
  }
});


//LOGIN
app.post('/api/auth/sign-in', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "bad req", success: false })
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);


    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // generate access and refresh token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setRefreshCookie(res, refreshToken);



    res.status(200).json({ message: "Login successful", success: true, data: user })

  } catch (err) {

    console.log("error: ", err.message)

    res.status(500).json({
      message: "server error",
      success: false
    })
  }
})

/*----------------- verify email-----------------*/

app.post("/api/auth/verify-email", protect, async (req, res) => {
  try {
    const { projectId, otp } = req.body
    const { userId } = req.user

    console.log({ projectId, userId, otp });

    const searchedOtp = await Otp.findOne({ userId: userId, projectId: projectId });

    console.log({ searchedOtp })
    if (!searchedOtp) {

      return res.status(404).json({ message: "otp code not found", success: false })
    }

    if (searchedOtp.otp == otp) {
      await User.findByIdAndUpdate(userId, { verified: true })

      return res.status(200).json({ message: "verified otp", success: true })
    }

  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: "failed to verify email", success: false })
  }
})

/*------------------resend email otp----------------*/


app.post("/api/auth/resend-email-otp", protect, async (req, res) => {
  try {
    const { projectId } = req.body
    const { userId } = req.user

    console.log("------for resending email------------")
    console.log({ projectId, userId });

    const searchedUser = await User.findOne({ _id: userId, projectId: projectId });
    const searchedProject = await Project.findById(projectId);
    console.log({ searchedUser })

    if (!searchedUser || !projectId) {
      return res.status(404).json({ message: "User  could  not be found", success: false })
    }

    const searchedOtp = await Otp.findOne({ userId: userId, projectId: projectId })

    if (!searchedOtp) {

      const otp = generateOTP();
      const newOtp = new Otp({ userId: userId, projectId: projectId, otp: otp });
      await newOtp.save();
      await sendOtpN8n(searchedUser.email, otp, searchedProject.name);

    }else{
      await sendOtpN8n(searchedUser.email, searchedOtp.otp, searchedProject.name);
    }



    res.status(200).json({ message: "sent a new verify email", success: true })
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: "failed to resend verify email", success: false })
  }
})


/* ---------------- REFRESH TOKEN ---------------- */
app.post("/api/auth/refresh", (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const newAccessToken = generateAccessToken({
      _id: decoded.userId
    });

    res.json({ accessToken: newAccessToken });

  } catch (err) {
    res.status(403).json({ message: "Forbidden", success: false });
  }
});

//CREATE NEW PROJECT
app.post('/api/project/create', async (req, res) => {
  try {
    const { name } = req.body

    const newProject = new Project({ name: name })

    await newProject.save();


    res.status(201).json({ message: "New Project Created", newProject: newProject, success: true })
  } catch (err) {
    console.log(err.message)

    if (err.code === 11000) {
      return res.status(409).json({ message: "Duplicate project name", success: false })
    }
    return res.status(500).json({ message: "ERROR CREATING NEW PROJECT", success: false })
  }
})

app.get('/api/project', async (req, res) => {
  try {
    const allProjects = await Project.find();
    //console.log(allProjects);

    return res.status(200).json({ message: "fetched projects", projects: allProjects, success: true })
  } catch (err) {
    console.log(err.message)
    return res.status(500).json({ message: "ERROR CREATING FETCHING PROJECT", success: false })
  }
})


async function fetchProjectInfo(projectId) {
  try {
    const project = await Project.findById(projectId)
    return project
  } catch (err) {
    throw new Error("Error while fecthing project info")
  }
}


// to get users of a project
app.get('/api/users', async (req, res) => {
  try {
    console.log(req.query)
    const { projectId } = req.query;
    const allUsrs = await User.find({ projectId: projectId });
    const projectInfo = await fetchProjectInfo(projectId);

    return res.status(200).json({ message: "fetched projects", users: allUsrs, project: projectInfo, success: true })
  } catch (err) {
    console.log(err.message)
    return res.status(500).json({ message: "ERROR  FETCHING users of  PROJECT", success: false })
  }
})


// so what i want to do 
/*

1. store user info 
2. build secure login with gmail
3. send otp
4. 

make for yourself haina i want this to work so 
1. create new app 
2. handle user


plan 
1. have two collection (users and projects)

*/


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(process.env.NODE_ENV)
  connnectDB();

});