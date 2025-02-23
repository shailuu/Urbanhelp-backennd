const validate = (schema) => async (req, res, next) => {
    try {
        req.body = await schema.parseAsync(req.body); // Validate request body using the schema
        next(); // Proceed to the next middleware if validation is successful
    } catch (error) {
        // Simplify and customize the error message
        const firstError = error.errors?.[0]; // Get the first error message
        if (firstError) {
            // Construct a specific user-friendly message
            let customMessage = '';
            if (firstError.path.includes('username')) {
                customMessage = "Please fill in the username properly (at least 3 characters)";
            } else if (firstError.path.includes('email')) {
                customMessage = "Please provide a valid email address";
            } else if (firstError.path.includes('password')) {
                customMessage = "Password must be at least 8 characters long";
            }
            
            // Create a new error object with a user-friendly message
            const validationError = new Error(customMessage);
            validationError.status = 400;
            validationError.extraDetails = `${firstError.message} in ${firstError.path.join(', ')}`; // Add extra details like the field name
            
            // Pass the error to the global error handler
            next(validationError);
        } else {
            next(error); // Pass unexpected errors to the global error handler
        }
    }
};

module.exports = validate;
