import { db } from '../config/database.js';

// Story models
export const StoryModel = {
  findAll: (filters = {}) => {
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

    return db.prepare(query).all(...params);
  },

  findById: (id) => {
    return db.prepare('SELECT * FROM stories WHERE id = ?').get(id);
  },

  create: (storyData) => {
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

    const result = db.prepare(`
      INSERT INTO stories (title, subject, summary, content, category, era, region, image_url, submitted_by, submitter_email, status, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
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
      featured ? 1 : 0
    );

    return StoryModel.findById(result.lastInsertRowid);
  },

  update: (id, updates) => {
    const allowedFields = ['title', 'subject', 'summary', 'content', 'category', 'era', 'region', 'image_url', 'status', 'featured'];
    const setClauses = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key === 'imageUrl' ? 'image_url' : key;
      if (allowedFields.includes(dbKey)) {
        setClauses.push(`${dbKey} = ?`);
        values.push(key === 'featured' ? (value ? 1 : 0) : value);
      }
    }

    if (setClauses.length === 0) return null;

    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE stories SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    return StoryModel.findById(id);
  },

  delete: (id) => {
    return db.prepare('DELETE FROM stories WHERE id = ?').run(id);
  },

  search: (query) => {
    const searchTerm = `%${query.toLowerCase()}%`;
    return db.prepare(`
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
    `).all(
      searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
    );
  },
};

// Submission models
export const SubmissionModel = {
  findAll: (status) => {
    if (status) {
      return db.prepare('SELECT * FROM submissions WHERE status = ? ORDER BY created_at DESC').all(status);
    }
    return db.prepare('SELECT * FROM submissions ORDER BY created_at DESC').all();
  },

  findById: (id) => {
    return db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
  },

  create: (submissionData) => {
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

    const result = db.prepare(`
      INSERT INTO submissions (title, subject, summary, content, category, era, region, submitted_by, submitter_email, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      subject,
      summary,
      content,
      category,
      era,
      region,
      submittedBy,
      submitterEmail,
      'pending'
    );

    return SubmissionModel.findById(result.lastInsertRowid);
  },

  update: (id, updates) => {
    const allowedFields = ['status', 'admin_notes'];
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

    db.prepare(`UPDATE submissions SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    return SubmissionModel.findById(id);
  },

  delete: (id) => {
    return db.prepare('DELETE FROM submissions WHERE id = ?').run(id);
  },
};

// Contribution models
export const ContributionModel = {
  findAll: (filters = {}) => {
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

    return db.prepare(query).all(...params);
  },

  findById: (id) => {
    return db.prepare('SELECT * FROM contributions WHERE id = ?').get(id);
  },

  findByStoryId: (storyId) => {
    return db.prepare('SELECT * FROM contributions WHERE story_id = ? ORDER BY created_at DESC').all(storyId);
  },

  create: (contributionData) => {
    const {
      storyId,
      content,
      contributionType,
      submittedBy,
      submitterEmail,
    } = contributionData;

    const result = db.prepare(`
      INSERT INTO contributions (story_id, content, contribution_type, submitted_by, submitter_email, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      storyId,
      content,
      contributionType,
      submittedBy,
      submitterEmail,
      'pending'
    );

    return ContributionModel.findById(result.lastInsertRowid);
  },

  update: (id, updates) => {
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

    db.prepare(`UPDATE contributions SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    return ContributionModel.findById(id);
  },

  delete: (id) => {
    return db.prepare('DELETE FROM contributions WHERE id = ?').run(id);
  },
};

// Contributor models
export const ContributorModel = {
  findAll: () => {
    return db.prepare('SELECT * FROM contributors ORDER BY created_at DESC').all();
  },

  findByEmail: (email) => {
    const contributor = db.prepare('SELECT * FROM contributors WHERE email = ?').get(email);
    if (contributor) {
      const activities = db.prepare(`
        SELECT * FROM contributor_activities 
        WHERE contributor_id = ? 
        ORDER BY created_at DESC
      `).all(contributor.id);
      return { ...contributor, contributions: activities };
    }
    return null;
  },

  create: (email, name) => {
    const existing = ContributorModel.findByEmail(email);
    if (existing) return existing;

    const result = db.prepare(`
      INSERT INTO contributors (email, name)
      VALUES (?, ?)
    `).run(email, name);

    return ContributorModel.findById(result.lastInsertRowid);
  },

  findById: (id) => {
    const contributor = db.prepare('SELECT * FROM contributors WHERE id = ?').get(id);
    if (contributor) {
      const activities = db.prepare(`
        SELECT * FROM contributor_activities 
        WHERE contributor_id = ? 
        ORDER BY created_at DESC
      `).all(contributor.id);
      return { ...contributor, contributions: activities };
    }
    return null;
  },

  addActivity: (contributorId, activityData) => {
    const { activityType, activityId, storyId, storyTitle, status = 'pending' } = activityData;
    return db.prepare(`
      INSERT INTO contributor_activities (contributor_id, activity_type, activity_id, story_id, story_title, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(contributorId, activityType, activityId, storyId || null, storyTitle || null, status);
  },

  updateActivityStatus: (contributorId, activityId, activityType, status, newStoryId, newStoryTitle) => {
    db.prepare(`
      UPDATE contributor_activities 
      SET status = ?, story_id = ?, story_title = ?
      WHERE contributor_id = ? AND activity_id = ? AND activity_type = ?
    `).run(status, newStoryId || null, newStoryTitle || null, contributorId, activityId, activityType);
  },
};

// User model (for authentication)
export const UserModel = {
  findByEmail: (email) => {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  create: (email, passwordHash, name, role = 'user') => {
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `).run(email, passwordHash, name, role);
    return UserModel.findById(result.lastInsertRowid);
  },

  findById: (id) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (user) {
      delete user.password_hash;
    }
    return user;
  },
};

// Stats model
export const StatsModel = {
  getAdminStats: () => {
    const totalStories = db.prepare("SELECT COUNT(*) as count FROM stories WHERE status = 'approved'").get().count;
    const pendingSubmissions = db.prepare("SELECT COUNT(*) as count FROM submissions WHERE status = 'pending'").get().count;
    const pendingContributions = db.prepare("SELECT COUNT(*) as count FROM contributions WHERE status = 'pending'").get().count;
    const totalContributors = db.prepare('SELECT COUNT(*) as count FROM contributors').get().count;

    return {
      totalStories,
      pendingSubmissions,
      pendingContributions,
      totalContributors,
    };
  },
};
