const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Users = require("../model/Users");
const { OAuth2Client } = require("google-auth-library");
const { validationResult } = require("express-validator");

//https://www.uuidgenerator.net/
const secret = process.env.JWT_SECRET;

const authController = {
  login: async (request, response) => {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return response.status(401).json({ errors: errors.array() });
      }
      //The Body contains user name and password because of the express.json()
      //middleware configured in the server.js
      const { username, password } = request.body;

      //
      const data = await Users.findOne({ email: username });
      if (!data) {
        return response.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, data.password);
      if (!isMatch) {
        return response.status(401).json({ message: "invalid credentials" });
      }
      const user = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role ? data.role : "admin", // backward compactability
        adminId: data.adminId,
        credits: data.credits,
      };
      const token = jwt.sign(user, secret, { expiresIn: "1h" });
      response.cookie("jwtToken", token, {
        httpOnly: true,
        secure: true,
        domain: "localhost",
        path: "/",
      });
      response.json({ user: user, message: "User authenticated" });
    } catch (error) {
      console.log(error);
      response.status(500).json({ error: "Internal server error" });
    }
  },
  logout: (request, response) => {
    response.clearCookie("jwtToken");
    response.json({ message: "Logout Successfull" });
  },
  isUserLoggedIn: async (request, response) => {
    const token = request.cookies.jwtToken;
    if (!token) {
      return response.status(401).json({ message: "Unauthorized access" });
    }
    jwt.verify(token, secret, async (error, user) => {
      if (error) {
        return response.status(401).json({ message: "Unauthorized access" });
      } else {
        const latestUserDetails = await Users.findById({ _id: user.id });

        response.json({
          message: "User is logged in",
          user: latestUserDetails,
        });
      }
    });
  },
  register: async (request, response) => {
    try {
      const { username, password, name } = request.body;
      //Firstly check if user already exist with the given email
      const data = await Users.findOne({ email: username });
      if (data) {
        return response
          .status(401)
          .json({ message: "Account already exist with given email " });
      }
      //Encrypt the password before saving the record to the database
      const encryptedPassword = await bcrypt.hash(password, 10);
      //Create mongoose model object and set the record values
      const user = new Users({
        email: username,
        password: encryptedPassword,
        name: name,
        role: "admin",
      });
      await user.save();
      const userDetails = {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
      };
      const token = jwt.sign(userDetails, secret, { expiresIn: "1h" });
      response.cookie("jwtToken", token, {
        httpOnly: true,
        secure: true,
        domain: "localhost",
        path: "/",
      });
      response.json({ message: "User registered", user: userDetails });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ error: "Internal Server error" });
    }
  },
  googleAuth: async (request, response) => {
    try {
      const { idToken } = request.body;
      if (!idToken) {
        return response.status(401).json({ message: "Invalid Request" });
      }
      const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const googleResponse = await googleClient.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = googleResponse.getPayload();
      const { sub: googleId, name, email } = payload;
      let data = await Users.findOne({ email: email });
      if (!data) {
        data = new Users({
          email: email,
          name: name,
          isGoogleUser: true,
          googleId: googleId,
          role: user.role,
        });
        await data.save();
      }
      const user = {
        id: data._id ? data._id : googleId,
        username: email,
        name: name,
        role: data.role ? data.role : "admin", // this is the ensure backward compactability
        credits: data.credits,
      };
      const token = jwt.sign(user, secret, {
        expiresIn: "1h",
      });
      response.cookie("jwtToken", token, {
        httpOnly: true,
        secure: true,
        domain: "localhost",
        path: "/",
      });
      response.json({ user: user, message: "User authenticated" });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: "Internal Server error" });
    }
  },
};
module.exports = authController;
