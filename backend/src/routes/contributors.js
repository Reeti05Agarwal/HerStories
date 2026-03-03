import express from 'express';
import { ContributorModel } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get contributor by email (authenticated)
router.get('/me', authMiddleware, (req, res) => {
  try {
    const contributor = ContributorModel.findByEmail(req.user.email);
    
    if (!contributor) {
      return res.json({ contributor: null });
    }

    const formattedContributor = {
      ...contributor,
      contributions: contributor.contributions.map(c => ({
        ...c,
        activityType: c.activity_type,
        activityId: c.activity_id,
        storyId: c.story_id,
        storyTitle: c.story_title,
        createdAt: c.created_at,
      })),
    };

    res.json({ contributor: formattedContributor });
  } catch (error) {
    console.error('Get contributor error:', error);
    res.status(500).json({ error: 'Failed to fetch contributor' });
  }
});

// Get all contributors (admin only - optional)
router.get('/', authMiddleware, (req, res) => {
  try {
    const contributors = ContributorModel.findAll();
    
    const formattedContributors = contributors.map(c => ({
      ...c,
      contributions: [],
    }));

    res.json({ contributors: formattedContributors });
  } catch (error) {
    console.error('Get contributors error:', error);
    res.status(500).json({ error: 'Failed to fetch contributors' });
  }
});

export default router;
