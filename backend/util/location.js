const axios = require("axios");
const HttpError = require("../models/httpError");
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Helper function to handle API response
const handleApiResponse = (data) => {
  if (!data || data.status === "ZERO_RESULTS") {
    throw new HttpError(
      "Failed to find location for the specified address.",
      422
    );
  }
  return data.results[0].geometry.location;
};

// Function to get coordinates for a given address
async function getCoordsForAddress(address) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${API_KEY}`
    );
    return handleApiResponse(response.data);
  } catch (error) {
    throw new HttpError(
      "Failed to fetch coordinates from Google Maps API.",
      500
    );
  }
}

module.exports = getCoordsForAddress;
