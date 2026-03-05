import { pool } from '../config/database.js';

// Story models
export const StoryModel = {
  findAll: async (filters = {}) => {
    let query = 'SELECT * FROM stories WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.category) {
      query += ` AND category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    if (filters.era) {
      query += ` AND era = $${paramIndex}`;
      params.push(filters.era);
      paramIndex++;
    }

    if (filters.region) {
      query += ` AND region = $${paramIndex}`;
      params.push(filters.region);
      paramIndex++;
    }

    if (filters.featured !== undefined) {
      query += ` AND featured = $${paramIndex}`;
      params.push(filters.featured);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  },

  findById: async (id) => {
    const result = await pool.query('SELECT * FROM stories WHERE id = $1', [id]);
    return result.rows[0] || null;
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

    const result = await pool.query(`
      INSERT INTO stories (title, subject, summary, content, category, era, region, image_url, submitted_by, submitter_email, status, featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
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
      featured,
    ]);

    return result.rows[0];
  },

  update: async (id, updates) => {
    const allowedFields = ['title', 'subject', 'summary', 'content', 'category', 'era', 'region', 'imageUrl', 'status', 'featured'];
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key === 'imageUrl' ? 'image_url' : key;
      if (allowedFields.includes(dbKey)) {
        setClauses.push(`${dbKey} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) return null;

    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE stories SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  delete: async (id) => {
    const result = await pool.query('DELETE FROM stories WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },

  search: async (query) => {
    const searchTerm = `%${query.toLowerCase()}%`;
    const result = await pool.query(`
      SELECT * FROM stories
      WHERE status = 'approved'
      AND (
        LOWER(title) LIKE $1 OR
        LOWER(subject) LIKE $2 OR
        LOWER(summary) LIKE $3 OR
        LOWER(content) LIKE $4 OR
        LOWER(category) LIKE $5 OR
        LOWER(era) LIKE $6 OR
        LOWER(region) LIKE $7
      )
      ORDER BY created_at DESC
    `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]);
    return result.rows;
  },
};

// Submission models
export const SubmissionModel = {
  findAll: async (status) => {
    let result;
    if (status) {
      result = await pool.query('SELECT * FROM submissions WHERE status = $1 ORDER BY created_at DESC', [status]);
    } else {
      result = await pool.query('SELECT * FROM submissions ORDER BY created_at DESC');
    }
    return result.rows;
  },

  findById: async (id) => {
    const result = await pool.query('SELECT * FROM submissions WHERE id = $1', [id]);
    return result.rows[0] || null;
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

    const result = await pool.query(`
      INSERT INTO submissions (title, subject, summary, content, category, era, region, submitted_by, submitter_email, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
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

    return result.rows[0];
  },

  update: async (id, updates) => {
    const allowedFields = ['status', 'adminNotes'];
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key === 'adminNotes' ? 'admin_notes' : key;
      if (allowedFields.includes(dbKey)) {
        setClauses.push(`${dbKey} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) return null;

    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE submissions SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  delete: async (id) => {
    const result = await pool.query('DELETE FROM submissions WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },
};

// Contribution models
export const ContributionModel = {
  findAll: async (filters = {}) => {
    let query = 'SELECT * FROM contributions WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.storyId) {
      query += ` AND story_id = $${paramIndex}`;
      params.push(filters.storyId);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  },

  findById: async (id) => {
    const result = await pool.query('SELECT * FROM contributions WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  findByStoryId: async (storyId) => {
    const result = await pool.query('SELECT * FROM contributions WHERE story_id = $1 ORDER BY created_at DESC', [storyId]);
    return result.rows;
  },

  create: async (contributionData) => {
    const {
      storyId,
      content,
      contributionType,
      submittedBy,
      submitterEmail,
    } = contributionData;

    const result = await pool.query(`
      INSERT INTO contributions (story_id, content, contribution_type, submitted_by, submitter_email, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      storyId,
      content,
      contributionType,
      submittedBy,
      submitterEmail,
      'pending',
    ]);

    return result.rows[0];
  },

  update: async (id, updates) => {
    const allowedFields = ['status'];
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) return null;

    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE contributions SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  delete: async (id) => {
    const result = await pool.query('DELETE FROM contributions WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },
};

// Contributor models
export const ContributorModel = {
  findAll: async () => {
    const result = await pool.query('SELECT * FROM contributors ORDER BY created_at DESC');
    return result.rows;
  },

  findByEmail: async (email) => {
    const contributorResult = await pool.query('SELECT * FROM contributors WHERE email = $1', [email]);
    const contributor = contributorResult.rows[0];
    if (contributor) {
      const activitiesResult = await pool.query(`
        SELECT * FROM contributor_activities
        WHERE contributor_id = $1
        ORDER BY created_at DESC
      `, [contributor.id]);
      return { ...contributor, contributions: activitiesResult.rows };
    }
    return null;
  },

  findById: async (id) => {
    const contributorResult = await pool.query('SELECT * FROM contributors WHERE id = $1', [id]);
    const contributor = contributorResult.rows[0];
    if (contributor) {
      const activitiesResult = await pool.query(`
        SELECT * FROM contributor_activities
        WHERE contributor_id = $1
        ORDER BY created_at DESC
      `, [contributor.id]);
      return { ...contributor, contributions: activitiesResult.rows };
    }
    return null;
  },

  create: async (email, name) => {
    const existing = await ContributorModel.findByEmail(email);
    if (existing) return existing;

    const result = await pool.query(`
      INSERT INTO contributors (email, name)
      VALUES ($1, $2)
      RETURNING *
    `, [email, name]);

    return result.rows[0];
  },

  addActivity: async (contributorId, activityData) => {
    const { activityType, activityId, storyId, storyTitle, status = 'pending' } = activityData;
    const result = await pool.query(`
      INSERT INTO contributor_activities (contributor_id, activity_type, activity_id, story_id, story_title, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [contributorId, activityType, activityId, storyId || null, storyTitle || null, status]);
    return result.rows[0];
  },

  updateActivityStatus: async (contributorId, activityId, activityType, status, newStoryId, newStoryTitle) => {
    const result = await pool.query(`
      UPDATE contributor_activities
      SET status = $1, story_id = $2, story_title = $3
      WHERE contributor_id = $4 AND activity_id = $5 AND activity_type = $6
      RETURNING *
    `, [status, newStoryId || null, newStoryTitle || null, contributorId, activityId, activityType]);
    return result.rows[0];
  },
};

// User model (for authentication)
export const UserModel = {
  findByEmail: async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  create: async (email, passwordHash, name, role = 'user') => {
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [email, passwordHash, name, role]);
    return result.rows[0];
  },

  findById: async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = result.rows[0];
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
    const totalStoriesResult = await pool.query("SELECT COUNT(*) as count FROM stories WHERE status = 'approved'");
    const pendingSubmissionsResult = await pool.query("SELECT COUNT(*) as count FROM submissions WHERE status = 'pending'");
    const pendingContributionsResult = await pool.query("SELECT COUNT(*) as count FROM contributions WHERE status = 'pending'");
    const totalContributorsResult = await pool.query('SELECT COUNT(*) as count FROM contributors');

    return {
      totalStories: parseInt(totalStoriesResult.rows[0].count),
      pendingSubmissions: parseInt(pendingSubmissionsResult.rows[0].count),
      pendingContributions: parseInt(pendingContributionsResult.rows[0].count),
      totalContributors: parseInt(totalContributorsResult.rows[0].count),
    };
  },
};
