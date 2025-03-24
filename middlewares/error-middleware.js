module.exports = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    const extraDetails = err.extraDetails || "Error from Backend";

    // Handle specific error codes more gracefully
    if (status === 400 && !extraDetails) {
        extraDetails = "Please check the request parameters.";
    }

    return res.status(status).json({
        success: false,
        message,        // User-friendly message
        extraDetails    // Extra details for debugging or additional info
    });
};