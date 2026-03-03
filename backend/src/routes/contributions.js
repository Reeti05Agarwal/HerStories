import express from 'express';
import { ContributionModel, StoryModel, ContributorModel } from '../models/index.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all contributions (admin only)
router.get('/', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { status, storyId } = req.query;
    const contributions = ContributionModel.findAll({ status, storyId });

    const formattedContributions = contributions.map(c => ({
      ...c,
      storyId: c.story_id,
      contributionType: c.contribution_type,
      submittedBy: c.submitted_by,
      submitterEmail: c.submitter_email,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

    res.json({ contributions: formattedContributions });
  } catch (error) {
    console.error('Get contributions error:', error);
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
});

// Get contribution by ID (admin only)
router.get('/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const contribution = ContributionModel.findById(req.params.id);
    
    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    res.json({
      contribution: {
        ...contribution,
        storyId: contribution.story_id,
        contributionType: contribution.contribution_type,
        submittedBy: contribution.submitted_by,
        submitterEmail: contribution.submitter_email,
        createdAt: contribution.created_at,
        updatedAt: contribution.updated_at,
      },
    });
  } catch (error) {
    console.error('Get contribution error:', error);
    res.status(500).json({ error: 'Failed to fetch contribution' });
  }
});

// Create contribution (public)
router.post('/', async (req, res) => {
  try {
    const {
      storyId,
      content,
      contributionType,
      submittedBy,
      submitterEmail,
    } = req.body;

    if (!storyId || !content || !contributionType || !submittedBy || !submitterEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const story = StoryModel.findById(storyId);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const contribution = ContributionModel.create({
      storyId,
      content,
      contributionType,
      submittedBy,
      submitterEmail,
    });

    // Track contributor
    let contributor = ContributorModel.findByEmail(submitterEmail);
    if (!contributor) {
      contributor = ContributorModel.create(submitterEmail, submittedBy);
    }
    
    ContributorModel.addActivity(contributor.id, {
      activityType: 'addition',
      activityId: contribution.id,
      storyId,
      storyTitle: story.title,
      status: 'pending',
    });

    res.status(201).json({ contribution });
  } catch (error) {
    console.error('Create contribution error:', error);
    res.status(500).json({ error: 'Failed to create contribution' });
  }
});

// Approve contribution (admin only)
router.post('/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const contribution = ContributionModel.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    // Update contribution status
    ContributionModel.update(req.params.id, { status: 'approved' });

    // Add to story (in a real app, you'd append the contribution content to the story)
    const story = StoryModel.findById(contribution.story_id);

    // Update contributor activity
    const contributor = ContributorModel.findByEmail(contribution.submitter_email);
    if (contributor) {
      ContributorModel.updateActivityStatus(
        contributor.id,
        contribution.id,
        'addition',
        'approved',
        story.id,
        story.title
      );
    }

    res.json({ 
      contribution: {
        ...contribution,
        status: 'approved',
      },
      story,
    });
  } catch (error) {
    console.error('Approve contribution error:', error);
    res.status(500).json({ error: 'Failed to approve contribution' });
  }
});

// Reject contribution (admin only)
router.post('/:id/reject', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const contribution = ContributionModel.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    ContributionModel.update(req.params.id, { status: 'rejected' });

    // Update contributor activity
    const contributor = ContributorModel.findByEmail(contribution.submitter_email);
    if (contributor) {
      ContributorModel.updateActivityStatus(
        contributor.id,
        contribution.id,
        'addition',
        'rejected',
        null,
        null
      );
    }

    res.json({ 
      contribution: {
        ...contribution,
        status: 'rejected',
      },
    });
  } catch (error) {
    console.error('Reject contribution error:', error);
    res.status(500).json({ error: 'Failed to reject contribution' });
  }
});

// Delete contribution (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    ContributionModel.delete(req.params.id);
    res.json({ message: 'Contribution deleted successfully' });
  } catch (error) {
    console.error('Delete contribution error:', error);
    res.status(500).json({ error: 'Failed to delete contribution' });
  }
});

export default router;
