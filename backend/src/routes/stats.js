import express from 'express';
import { StatsModel } from '../models/index.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get admin stats (admin only)
router.get('/', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const stats = StatsModel.getAdminStats();
    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
