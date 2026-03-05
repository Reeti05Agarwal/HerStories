import express from 'express';
import { StoryModel, SubmissionModel, ContributorModel } from '../models/index.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all stories (public - only approved)
router.get('/', async (req, res) => {
  try {
    const { category, era, region, featured, search } = req.query;

    let stories;

    if (search) {
      stories = await StoryModel.search(search);
    } else {
      const filters = {
        status: 'approved',
        category: category || undefined,
        era: era || undefined,
        region: region || undefined,
      };

      if (featured !== undefined) {
        filters.featured = featured === 'true';
      }

      stories = await StoryModel.findAll(filters);
    }

    // Get contributions for each story
    const storiesWithContributions = stories.map(story => ({
      ...story,
      imageUrl: story.image_url,
      submittedBy: story.submitted_by,
      submitterEmail: story.submitter_email,
      createdAt: story.created_at,
      updatedAt: story.updated_at,
      featured: !!story.featured,
      contributions: [],
    }));

    res.json({ stories: storiesWithContributions });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// Get story by ID
router.get('/:id', (req, res) => {
  try {
    const story = StoryModel.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const contributions = StoryModel.findAll({ status: 'approved' })
      .filter(s => s.id === req.params.id)
      .flatMap(s => []);

    res.json({
      story: {
        ...story,
        imageUrl: story.image_url,
        submittedBy: story.submitted_by,
        submitterEmail: story.submitter_email,
        createdAt: story.created_at,
        updatedAt: story.updated_at,
        featured: !!story.featured,
        contributions: [],
      },
    });
  } catch (error) {
    console.error('Get story error:', error);
    res.status(500).json({ error: 'Failed to fetch story' });
  }
});

// Create story (admin only)
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const {
      title,
      subject,
      summary,
      content,
      category,
      era,
      region,
      imageUrl,
      featured,
    } = req.body;

    if (!title || !subject || !summary || !content || !category || !era || !region) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const story = StoryModel.create({
      title,
      subject,
      summary,
      content,
      category,
      era,
      region,
      imageUrl,
      submittedBy: req.user.name,
      submitterEmail: req.user.email,
      status: 'approved',
      featured: featured || false,
    });

    res.status(201).json({ story });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

// Update story (admin only)
router.put('/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const story = StoryModel.update(req.params.id, req.body);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    res.json({ story });
  } catch (error) {
    console.error('Update story error:', error);
    res.status(500).json({ error: 'Failed to update story' });
  }
});

// Delete story (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    StoryModel.delete(req.params.id);
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

export default router;
