const errorMiddleware = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";

    // If there's additional details for debugging, add it
    const extraDetails = err.extraDetails || "Error from Backend";

    // If you want to handle specific error codes more gracefully
    if (err.status === 400 && !extraDetails) {
        extraDetails = "Please check the request parameters.";
    }

    return res.status(status).json({
        message,        // User-friendly message
        extraDetails    // Extra details for debugging or additional info
    });
};

module.exports = errorMiddleware;
