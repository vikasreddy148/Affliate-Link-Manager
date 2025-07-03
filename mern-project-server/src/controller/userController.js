const { USER_ROLES } = require("../constants/userConstants");
const bcrypt = require("bcryptjs");
const Users = require("../model/Users");
const send = require("../service/emailService");
const generateTemporaryPassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const userController = {
  create: async (request, response) => {
    try {
      const { name, email, role } = request.body;
      if (!USER_ROLES.includes(role)) {
        return response.status(400).json({
          message: "Invalid Role",
        });
      }
      const temporaryPassword = generateTemporaryPassword();
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
      const user = await Users.create({
        email: email,
        password: hashedPassword,
        name: name,
        role: role,
        adminId: request.user.id,
      });
      try {
        await send(
          email,
          "Affliate+ Temporary Password",
          `Your Temporary Password is ${temporaryPassword}`
        );
        response.json(user);
      } catch (error) {
        console.log(error);
        console.log(`Error sending password ${temporaryPassword}`);
      }
    } catch (error) {
      console.log(error);
      response.status(500).json({ message: "Internal Server Error" });
    }
  },

  getAll: async (request, response) => {
    try {
      const users = await Users.find({ adminId: request.user.id });
      response.json(users);
    } catch (error) {
      console.log(error);
      response.status(500).json({ message: "Internal Server Error" });
    }
  },

  update: async (request, response) => {
    try {
      const { id } = request.params;
      const { name, role } = request.body;
      if (role && !USER_ROLES.includes(role)) {
        return response.status(400).json({ message: "Invalid Role" });
      }
      const user = await Users.findOne({ _id: id, adminId: request.user.id });
      if (!user) {
        return response.status(404).json({ message: "User does Not exist" });
      }
      console.log(user);
      if (name) user.name = name;
      if (role) user.role = role;
      await user.save();
      response.json(user);
    } catch (error) {
      console.log(error);
      response.status(500).json({ message: "Internal Server Error" });
    }
  },

  delete: async (request, response) => {
    try {
      const { id } = request.params;
      const user = await Users.findByIdAndDelete({
        _id: id,
        adminId: request.user.id,
      });
      if (!user) {
        return response.status(404).json({ message: "User does Not exist" });
      }
      response.json({ message: "User deleted" });
    } catch (error) {
      console.log(error);
      response.status(500).json({ message: "Internal Server Error" });
    }
  },
};

module.exports = userController;
