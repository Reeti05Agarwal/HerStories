import { runQuery, getRow, allRows } from '../config/database.js';

// Story models
export const StoryModel = {
  findAll: async (filters = {}) => {
    let query = 'SELECT * FROM stories WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.era) {
      query += ' AND era = ?';
      params.push(filters.era);
    }

    if (filters.region) {
      query += ' AND region = ?';
      params.push(filters.region);
    }

    if (filters.featured !== undefined) {
      query += ' AND featured = ?';
      params.push(filters.featured ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC';

    return await allRows(query, params);
  },

  findById: async (id) => {
    return await getRow('SELECT * FROM stories WHERE id = ?', [id]);
  },

  create: async (storyData) => {
    const {
      title,
      subject,
      summary,
      content,
      category,
      era,
      region,
      imageUrl,
      submittedBy,
      submitterEmail,
      status = 'pending',
      featured = false,
    } = storyData;

    await runQuery(`
      INSERT INTO stories (title, subject, summary, content, category, era, region, image_url, submitted_by, submitter_email, status, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      subject,
      summary,
      content,
      category,
      era,
      region,
      imageUrl || null,
      submittedBy,
      submitterEmail,
      status,
      featured ? 1 : 0,
    ]);

    // Get the last inserted row
    const result = await getRow('SELECT * FROM stories ORDER BY id DESC LIMIT 1');
    return result;
  },

  update: async (id, updates) => {
    const allowedFields = ['title', 'subject', 'summary', 'content', 'category', 'era', 'region', 'imageUrl', 'status', 'featured'];
    const setClauses = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key === 'imageUrl' ? 'image_url' : key;
      if (allowedFields.includes(dbKey)) {
        setClauses.push(`${dbKey} = ?`);
        if (dbKey === 'featured') {
          values.push(value ? 1 : 0);
        } else {
          values.push(value);
        }
      }
    }

    if (setClauses.length === 0) return null;

    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await runQuery(`UPDATE stories SET ${setClauses.join(', ')} WHERE id = ?`, values);
    return await getRow('SELECT * FROM stories WHERE id = ?', [id]);
  },

  delete: async (id) => {
    const story = await getRow('SELECT * FROM stories WHERE id = ?', [id]);
    await runQuery('DELETE FROM stories WHERE id = ?', [id]);
    return story;
  },

  search: async (query) => {
    const searchTerm = `%${query.toLowerCase()}%`;
    return await allRows(`
      SELECT * FROM stories
      WHERE status = 'approved'
      AND (
        LOWER(title) LIKE ? OR
        LOWER(subject) LIKE ? OR
        LOWER(summary) LIKE ? OR
        LOWER(content) LIKE ? OR
        LOWER(category) LIKE ? OR
        LOWER(era) LIKE ? OR
        LOWER(region) LIKE ?
      )
      ORDER BY created_at DESC
    `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]);
  },
};

// Submission models
export const SubmissionModel = {
  findAll: async (status) => {
    if (status) {
      return await allRows('SELECT * FROM submissions WHERE status = ? ORDER BY created_at DESC', [status]);
    }
    return await allRows('SELECT * FROM submissions ORDER BY created_at DESC');
  },

  findById: async (id) => {
    return await getRow('SELECT * FROM submissions WHERE id = ?', [id]);
  },

  create: async (submissionData) => {
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
    } = submissionData;

    await runQuery(`
      INSERT INTO submissions (title, subject, summary, content, category, era, region, submitted_by, submitter_email, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      subject,
      summary,
      content,
      category,
      era,
      region,
      submittedBy,
      submitterEmail,
      'pending',
    ]);

    // Get the last inserted row
    const result = await getRow('SELECT * FROM submissions ORDER BY id DESC LIMIT 1');
    return result;
  },

  update: async (id, updates) => {
    const allowedFields = ['status', 'adminNotes'];
    const setClauses = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key === 'adminNotes' ? 'admin_notes' : key;
      if (allowedFields.includes(dbKey)) {
        setClauses.push(`${dbKey} = ?`);
        values.push(value);
      }
    }

    if (setClauses.length === 0) return null;

    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await runQuery(`UPDATE submissions SET ${setClauses.join(', ')} WHERE id = ?`, values);
    return await getRow('SELECT * FROM submissions WHERE id = ?', [id]);
  },

  delete: async (id) => {
    const submission = await getRow('SELECT * FROM submissions WHERE id = ?', [id]);
    await runQuery('DELETE FROM submissions WHERE id = ?', [id]);
    return submission;
  },
};

// Contribution models
export const ContributionModel = {
  findAll: async (filters = {}) => {
    let query = 'SELECT * FROM contributions WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.storyId) {
      query += ' AND story_id = ?';
      params.push(filters.storyId);
    }

    query += ' ORDER BY created_at DESC';

    return await allRows(query, params);
  },

  findById: async (id) => {
    return await getRow('SELECT * FROM contributions WHERE id = ?', [id]);
  },

  findByStoryId: async (storyId) => {
    return await allRows('SELECT * FROM contributions WHERE story_id = ? ORDER BY created_at DESC', [storyId]);
  },

  create: async (contributionData) => {
    const {
      storyId,
      content,
      contributionType,
      submittedBy,
      submitterEmail,
    } = contributionData;

    await runQuery(`
      INSERT INTO contributions (story_id, content, contribution_type, submitted_by, submitter_email, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      storyId,
      content,
      contributionType,
      submittedBy,
      submitterEmail,
      'pending',
    ]);

    // Get the last inserted row
    const result = await getRow('SELECT * FROM contributions ORDER BY id DESC LIMIT 1');
    return result;
  },

  update: async (id, updates) => {
    const allowedFields = ['status'];
    const setClauses = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (setClauses.length === 0) return null;

    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await runQuery(`UPDATE contributions SET ${setClauses.join(', ')} WHERE id = ?`, values);
    return await getRow('SELECT * FROM contributions WHERE id = ?', [id]);
  },

  delete: async (id) => {
    const contribution = await getRow('SELECT * FROM contributions WHERE id = ?', [id]);
    await runQuery('DELETE FROM contributions WHERE id = ?', [id]);
    return contribution;
  },
};

// Contributor models
export const ContributorModel = {
  findAll: async () => {
    return await allRows('SELECT * FROM contributors ORDER BY created_at DESC');
  },

  findByEmail: async (email) => {
    const contributor = await getRow('SELECT * FROM contributors WHERE email = ?', [email]);
    if (contributor) {
      const activities = await allRows(`
        SELECT * FROM contributor_activities
        WHERE contributor_id = ?
        ORDER BY created_at DESC
      `, [contributor.id]);
      return { ...contributor, contributions: activities };
    }
    return null;
  },

  findById: async (id) => {
    const contributor = await getRow('SELECT * FROM contributors WHERE id = ?', [id]);
    if (contributor) {
      const activities = await allRows(`
        SELECT * FROM contributor_activities
        WHERE contributor_id = ?
        ORDER BY created_at DESC
      `, [contributor.id]);
      return { ...contributor, contributions: activities };
    }
    return null;
  },

  create: async (email, name) => {
    const existing = await ContributorModel.findByEmail(email);
    if (existing) return existing;

    await runQuery(`
      INSERT INTO contributors (email, name)
      VALUES (?, ?)
    `, [email, name]);

    // Get the last inserted row
    const result = await getRow('SELECT * FROM contributors ORDER BY id DESC LIMIT 1');
    return result;
  },

  addActivity: async (contributorId, activityData) => {
    const { activityType, activityId, storyId, storyTitle, status = 'pending' } = activityData;
    await runQuery(`
      INSERT INTO contributor_activities (contributor_id, activity_type, activity_id, story_id, story_title, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [contributorId, activityType, activityId, storyId || null, storyTitle || null, status]);

    // Get the last inserted row
    const result = await getRow('SELECT * FROM contributor_activities ORDER BY id DESC LIMIT 1');
    return result;
  },

  updateActivityStatus: async (contributorId, activityId, activityType, status, newStoryId, newStoryTitle) => {
    await runQuery(`
      UPDATE contributor_activities
      SET status = ?, story_id = ?, story_title = ?
      WHERE contributor_id = ? AND activity_id = ? AND activity_type = ?
    `, [status, newStoryId || null, newStoryTitle || null, contributorId, activityId, activityType]);

    return await getRow('SELECT * FROM contributor_activities WHERE contributor_id = ? AND activity_id = ? AND activity_type = ?', 
      [contributorId, activityId, activityType]);
  },
};

// User model (for authentication)
export const UserModel = {
  findByEmail: async (email) => {
    return await getRow('SELECT * FROM users WHERE email = ?', [email]);
  },

  create: async (email, passwordHash, name, role = 'user') => {
    await runQuery(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `, [email, passwordHash, name, role]);

    // Get the last inserted row
    const result = await getRow('SELECT * FROM users ORDER BY id DESC LIMIT 1');
    return result;
  },

  findById: async (id) => {
    const user = await getRow('SELECT * FROM users WHERE id = ?', [id]);
    if (user) {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  },
};

// Stats model
export const StatsModel = {
  getAdminStats: async () => {
    const totalStoriesResult = await getRow("SELECT COUNT(*) as count FROM stories WHERE status = 'approved'");
    const pendingSubmissionsResult = await getRow("SELECT COUNT(*) as count FROM submissions WHERE status = 'pending'");
    const pendingContributionsResult = await getRow("SELECT COUNT(*) as count FROM contributions WHERE status = 'pending'");
    const totalContributorsResult = await getRow('SELECT COUNT(*) as count FROM contributors');

    return {
      totalStories: parseInt(totalStoriesResult.count),
      pendingSubmissions: parseInt(pendingSubmissionsResult.count),
      pendingContributions: parseInt(pendingContributionsResult.count),
      totalContributors: parseInt(totalContributorsResult.count),
    };
  },
};
