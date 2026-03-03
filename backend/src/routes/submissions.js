import express from 'express';
import { SubmissionModel, StoryModel, ContributorModel } from '../models/index.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all submissions (admin only)
router.get('/', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { status } = req.query;
    const submissions = SubmissionModel.findAll(status);

    const formattedSubmissions = submissions.map(sub => ({
      ...sub,
      submittedBy: sub.submitted_by,
      submitterEmail: sub.submitter_email,
      adminNotes: sub.admin_notes,
      createdAt: sub.created_at,
      updatedAt: sub.updated_at,
    }));

    res.json({ submissions: formattedSubmissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get submission by ID (admin only)
router.get('/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const submission = SubmissionModel.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({
      submission: {
        ...submission,
        submittedBy: submission.submitted_by,
        submitterEmail: submission.submitter_email,
        adminNotes: submission.admin_notes,
        createdAt: submission.created_at,
        updatedAt: submission.updated_at,
      },
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// Create submission (public)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      subject,
      summary,
      content,
      category,
      era,
      region,
      submittedBy,
      submitterEmail,
    } = req.body;

    if (!title || !subject || !summary || !content || !category || !era || !region || !submittedBy || !submitterEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const submission = SubmissionModel.create({
      title,
      subject,
      summary,
      content,
      category,
      era,
      region,
      submittedBy,
      submitterEmail,
    });

    // Track contributor
    let contributor = ContributorModel.findByEmail(submitterEmail);
    if (!contributor) {
      contributor = ContributorModel.create(submitterEmail, submittedBy);
    }
    
    ContributorModel.addActivity(contributor.id, {
      activityType: 'story',
      activityId: submission.id,
      storyId: null,
      storyTitle: submission.title,
      status: 'pending',
    });

    res.status(201).json({ submission });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

// Approve submission (admin only)
router.post('/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const submission = SubmissionModel.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Update submission status
    SubmissionModel.update(req.params.id, {
      status: 'approved',
      adminNotes: adminNotes || null,
    });

    // Create story from submission
    const story = StoryModel.create({
      title: submission.title,
      subject: submission.subject,
      summary: submission.summary,
      content: submission.content,
      category: submission.category,
      era: submission.era,
      region: submission.region,
      submittedBy: submission.submitted_by,
      submitterEmail: submission.submitter_email,
      status: 'approved',
      featured: false,
    });

    // Update contributor activity
    const contributor = ContributorModel.findByEmail(submission.submitter_email);
    if (contributor) {
      ContributorModel.updateActivityStatus(
        contributor.id,
        submission.id,
        'story',
        'approved',
        story.id,
        story.title
      );
    }

    res.json({ 
      submission: {
        ...submission,
        status: 'approved',
        adminNotes,
      },
      story,
    });
  } catch (error) {
    console.error('Approve submission error:', error);
    res.status(500).json({ error: 'Failed to approve submission' });
  }
});

// Reject submission (admin only)
router.post('/:id/reject', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { adminNotes } = req.body;
    const submission = SubmissionModel.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    SubmissionModel.update(req.params.id, {
      status: 'rejected',
      adminNotes: adminNotes || null,
    });

    // Update contributor activity
    const contributor = ContributorModel.findByEmail(submission.submitter_email);
    if (contributor) {
      ContributorModel.updateActivityStatus(
        contributor.id,
        submission.id,
        'story',
        'rejected',
        null,
        null
      );
    }

    res.json({ 
      submission: {
        ...submission,
        status: 'rejected',
        adminNotes,
      },
    });
  } catch (error) {
    console.error('Reject submission error:', error);
    res.status(500).json({ error: 'Failed to reject submission' });
  }
});

// Delete submission (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    SubmissionModel.delete(req.params.id);
    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

export default router;
