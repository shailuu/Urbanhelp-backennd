// controllers/paymentController.js

const axios = require("axios");

exports.verifyPayment = async (req, res) => {
  const { token, amount } = req.body;

  const config = {
    headers: {
      Authorization: "key 5f73f9343b964c0ea6823f5326c1cea6", // Replace with your secret key
    },
  };

  try {
    const response = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/initiate/",


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