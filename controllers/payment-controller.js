// controllers/paymentController.js

const axios = require("axios");

exports.verifyPayment = async (req, res) => {
  const { token, amount } = req.body;

  const config = {
    headers: {
      Authorization: "c250e114957747499eb7981e39f48b1a", // Replace with your secret key
    },
  };

  try {
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/ ",
      { token, amount },
      config
    );

    if (response.data.status === "Completed") {
      return res.json({ status: "verified", data: response.data });
    }

    return res.json({ status: "failed", data: response.data });
  } catch (error) {
    console.error("Verification failed:", error.response?.data || error.message);
    return res.status(500).json({ error: "Payment verification failed." });
  }
};