import axios from "axios";

const ORS_API_KEY = process.env.REACT_APP_ORS_API_KEY;

export const getRouteFromORS = async (startCoords, endCoords) => {
  try {
    const response = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        coordinates: [startCoords, endCoords],
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const geometry = response.data.features[0].geometry;
    const distance = response.data.features[0].properties.summary.distance;

    return { geometry, distance };
  } catch (error) {
    console.error("ORS routing error:", error);
    return {};
  }
};
