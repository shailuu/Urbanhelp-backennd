const { z } = require("zod");

// Validation schema for profile updates using Zod
const profileUpdateSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  dob: z.string().optional().nullable(),
  gender: z.enum(["Male", "Female", "Other"]).optional().nullable(),
  city: z.string().optional().nullable(),
  phoneNumber: z.string().regex(/^[0-9]+$/).optional().nullable(),
  address: z.string().optional().nullable()
});

// Export the schema
module.exports = { profileUpdateSchema };