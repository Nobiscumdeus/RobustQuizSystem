const { prisma } = require('../database'); // Import prisma client

// Get user details (for example, admin users)
exports.getUserDetails = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }, // Find user by ID
      include: {
        role: true, // Include the associated role
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user); // Return user details
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get user details" });
  }
};
