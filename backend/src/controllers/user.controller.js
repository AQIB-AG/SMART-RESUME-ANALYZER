// Mock user data (shared with auth controller)
// In real app, this would be imported from a shared data source or DB

/**
 * Get user info
 */
export const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // In real implementation, fetch from DB
    // For now, return user from token
    res.json({
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user info'
    });
  }
};

