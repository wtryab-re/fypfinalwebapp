import axios from "axios";
import FormData from "form-data";

const AI_BASE_URL = "http://localhost:8080"; // Flask API

export const sendImageToAI = async (imageUrl, imageBuffer) => {
  try {
    const fetch = (await import("node-fetch")).default;

    let buffer = imageBuffer;

    // If buffer not provided, download from Cloudinary URL
    if (!buffer) {
      console.log("Downloading image from Cloudinary...");
      const response = await fetch(imageUrl);
      if (!response.ok)
        throw new Error("Failed to fetch image from Cloudinary");
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // Prepare form-data
    const formData = new FormData();
    formData.append("file", buffer, {
      filename: "xray.jpg",
      contentType: "image/jpeg",
    });

    // Send POST request to Flask AI endpoint
    const aiResponse = await axios.post(
      `${AI_BASE_URL}/api/predict`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 60000, // 60 sec timeout
      },
    );

    return aiResponse.data; // JSON returned by Flask
  } catch (err) {
    console.error("Error sending image to AI:", err.message);
    return {
      success: false,
      message:
        err.response?.data?.message || err.message || "AI request failed",
    };
  }
};
