const fs = require("fs");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const HttpError = require("../models/httpError");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

// Helper functions
const findPlaceById = async (placeId) => {
  return await Place.findById(placeId);
};

const findUserById = async (userId) => {
  return await User.findById(userId).populate("places");
};

const createTransaction = async (createdPlace, user) => {
  const sess = await mongoose.startSession();
  sess.startTransaction();
  await createdPlace.save({ session: sess });
  user.places.push(createdPlace);
  await user.save({ session: sess });
  await sess.commitTransaction();
};

const deleteImage = (imagePath) => {
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.log(err);
    }
  });
};

// Controller functions
const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await findPlaceById(placeId);
  } catch (err) {
    return next(new HttpError("Error finding destination", 500));
  }

  if (!place) {
    return next(new HttpError("The User has not shared a destination", 404));
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithPlaces;
  try {
    userWithPlaces = await findUserById(userId);
  } catch (err) {
    return next(new HttpError("Error fetching places", 500));
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(new HttpError("Could not find destination", 404));
  }

  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input data", 422));
  }

  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await findUserById(req.userData.userId);
  } catch (err) {
    return next(new HttpError("Error creating destination", 500));
  }

  if (!user) {
    return next(new HttpError("Could not find user", 404));
  }

  try {
    await createTransaction(createdPlace, user);
  } catch (err) {
    return next(new HttpError("Error creating destination", 500));
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input data", 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await findPlaceById(placeId);
  } catch (err) {
    return next(new HttpError("Error updating destination", 500));
  }

  if (place.creator.toString() !== req.userData.userId) {
    return next(
      new HttpError("You are NOT allowed to edit this destination", 401)
    );
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    return next(new HttpError("Error updating destination", 500));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    return next(new HttpError("Error deleting destination", 500));
  }

  if (!place) {
    return next(new HttpError("Error finding destination", 404));
  }

  if (place.creator.id !== req.userData.userId) {
    return next(
      new HttpError("You are NOT allowed to delete this destination", 401)
    );
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await Place.deleteOne({ _id: placeId }).session(sess);
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Error deleting destination", 500));
  }

  deleteImage(imagePath);

  res.status(200).json({ message: "Destination Deleted" });
};

// Export functions
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
