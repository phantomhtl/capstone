const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/httpError");
const User = require("../models/user");

// Helper Functions
const findUserByEmail = async (email) => {
  return await User.findOne({ email: email });
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

const generateToken = (userId, email) => {
  return jwt.sign({ userId: userId, email: email }, "supersecret_dont_share", {
    expiresIn: "1h",
  });
};

// Get Users
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

// Sign Up
const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input", 422));
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await findUserByEmail(email);
  } catch (err) {
    return next(new HttpError("Signing up failed", 500));
  }

  if (existingUser) {
    return next(
      new HttpError("User already exists. Please login instead.", 422)
    );
  }

  let hashedPassword;
  try {
    hashedPassword = await hashPassword(password);
  } catch (err) {
    return next(new HttpError("Error creating user", 500));
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError("Error saving user", 500));
  }

  let token;
  try {
    token = generateToken(createdUser.id, createdUser.email);
  } catch (err) {
    return next(new HttpError("Sign up failed", 500));
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token });
};

// Login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await findUserByEmail(email);
  } catch (err) {
    return next(new HttpError("Logging in failed", 500));
  }

  if (!existingUser) {
    return next(new HttpError("Invalid credentials", 403));
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(new HttpError("Invalid credentials", 500));
  }

  if (!isValidPassword) {
    return next(new HttpError("Invalid credentials", 403));
  }

  let token;
  try {
    token = generateToken(existingUser.id, existingUser.email);
  } catch (err) {
    return next(new HttpError("Logging in failed", 500));
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token,
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
