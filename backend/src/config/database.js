import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use absolute path for production (Render), relative for development
const dbPath = process.env.NODE_ENV === 'production'
  ? process.env.DATABASE_PATH || '/opt/render/project/src/db/herstories.db'
  : path.join(__dirname, '../../db/herstories.db');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
const initializeDatabase = async () => {
  console.log('Initializing database...');

  // Users table (for admin authentication)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Stories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      era TEXT NOT NULL,
      region TEXT NOT NULL,
      image_url TEXT,
      submitted_by TEXT NOT NULL,
      submitter_email TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Submissions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      era TEXT NOT NULL,
      region TEXT NOT NULL,
      submitted_by TEXT NOT NULL,
      submitter_email TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Contributions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS contributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      story_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      contribution_type TEXT NOT NULL,
      submitted_by TEXT NOT NULL,
      submitter_email TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE
    )
  `);

  // Contributors table
  db.exec(`
    CREATE TABLE IF NOT EXISTS contributors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Contributor activities (tracks all contributions by a user)
  db.exec(`
    CREATE TABLE IF NOT EXISTS contributor_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contributor_id INTEGER NOT NULL,
      activity_type TEXT NOT NULL,
      activity_id INTEGER NOT NULL,
      story_id INTEGER,
      story_title TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contributor_id) REFERENCES contributors(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
    CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
    CREATE INDEX IF NOT EXISTS idx_stories_featured ON stories(featured);
    CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
    CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);
    CREATE INDEX IF NOT EXISTS idx_contributions_story_id ON contributions(story_id);
    CREATE INDEX IF NOT EXISTS idx_contributor_activities_contributor_id ON contributor_activities(contributor_id);
  `);

  // Insert default admin user if not exists
  const bcrypt = await import('bcryptjs');
  const adminEmail = 'admin@herstories.org';
  const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);

  if (!existingAdmin) {
    const passwordHash = bcrypt.default.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `).run(adminEmail, passwordHash, 'Admin User', 'admin');
    console.log('Default admin user created: admin@herstories.org (password: admin123)');
  }

  // Insert sample stories if stories table is empty
  const storyCount = db.prepare('SELECT COUNT(*) as count FROM stories').get().count;
  if (storyCount === 0) {
    insertSampleStories();
  }

  console.log('Database initialized successfully!');
};

const insertSampleStories = () => {
  const sampleStories = [
    {
      title: 'The Woman Who Mapped the Stars',
      subject: 'Annie Jump Cannon',
      summary: 'Astronomer who developed the stellar classification system still used today.',
      content: 'Annie Jump Cannon (1863-1941) was an American astronomer whose cataloging work was instrumental in the development of contemporary stellar classification. Despite being deafened by scarlet fever in her youth, she became one of the most accomplished astronomers of her time.\n\nCannon developed the Harvard Classification Scheme, which organized stars by their temperatures. This system, with modifications, is still used today. She classified over 350,000 stars during her career at the Harvard College Observatory, where she was paid significantly less than her male counterparts despite doing more work.\n\nHer contributions to astronomy were finally recognized when she became the first woman to receive an honorary doctorate from Oxford University in 1925.',
      category: 'science',
      era: '19th Century',
      region: 'North America',
      imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
      submittedBy: 'Admin',
      submitterEmail: 'admin@herstories.org',
      status: 'approved',
      featured: true,
    },
    {
      title: 'The Mother of Modern Medicine',
      subject: 'Henrietta Lacks',
      summary: 'Her cells revolutionized medical research, though she never knew their impact.',
      content: 'Henrietta Lacks (1920-1951) was an African-American woman whose cancer cells are the source of the HeLa cell line, the first immortalized human cell line and one of the most important cell lines in medical research.\n\nHer cells were taken without her knowledge or consent during a biopsy at Johns Hopkins Hospital. HeLa cells have been used in countless scientific breakthroughs, including the polio vaccine, cancer research, gene mapping, and in vitro fertilization.\n\nIt wasnt until decades later that her family learned about the widespread use of her cells. Her story has sparked important conversations about medical ethics, consent, and the rights of patients.',
      category: 'healthcare',
      era: 'Mid 20th Century (1945-1975)',
      region: 'North America',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      submittedBy: 'Admin',
      submitterEmail: 'admin@herstories.org',
      status: 'approved',
      featured: true,
    },
    {
      title: 'The Warrior Queen Who Defied Empires',
      subject: 'Queen Nzinga of Ndongo',
      summary: 'A 17th-century African queen who successfully resisted Portuguese colonization.',
      content: 'Queen Nzinga Mbandi (1583-1663) was the queen of the Ndongo and Matamba Kingdoms in what is now Angola. She ruled for 37 years and became known for her political and diplomatic wisdom, as well as her military prowess.\n\nNzinga came to power during a period of intense conflict with Portuguese colonizers who were expanding the slave trade. She formed alliances with the Dutch and neighboring African states to resist Portuguese expansion. Her diplomatic skills were legendary - she famously refused to sit on the floor when meeting with Portuguese governors, instead having her servants form a human chair.\n\nShe created a powerful military state and offered sanctuary to escaped slaves and Portuguese-trained African soldiers. Her resistance delayed Portuguese colonization of the interior of Angola for decades.',
      category: 'politics',
      era: 'Early Modern (1500-1800)',
      region: 'Africa',
      imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80',
      submittedBy: 'Admin',
      submitterEmail: 'admin@herstories.org',
      status: 'approved',
      featured: true,
    },
    {
      title: 'The First Computer Programmer',
      subject: 'Ada Lovelace',
      summary: 'Mathematician who wrote the first algorithm intended for a machine.',
      content: 'Ada Lovelace (1815-1852) was an English mathematician and writer, chiefly known for her work on Charles Babbages early mechanical general-purpose computer, the Analytical Engine.\n\nHer notes on the engine include what is recognized as the first algorithm intended to be processed by a machine. Because of this, she is often regarded as the first computer programmer.\n\nLovelace saw possibilities in computing that went beyond mere calculation. She envisioned that computers could be used to create music, art, and more - a concept that would not be realized for over a century.',
      category: 'technology',
      era: '19th Century',
      region: 'Europe',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      submittedBy: 'Admin',
      submitterEmail: 'admin@herstories.org',
      status: 'approved',
      featured: false,
    },
    {
      title: 'The Environmental Defender of the Amazon',
      subject: 'Berta Cáceres',
      summary: 'Indigenous environmental activist who gave her life protecting rivers and land.',
      content: 'Berta Cáceres (1971-2016) was a Honduran environmental activist, indigenous leader, and co-founder of the Council of Popular and Indigenous Organizations of Honduras (COPINH).\n\nShe led a successful campaign to stop the construction of the Agua Zarca Dam, which would have cut off the Gualcarque River, a vital water source for the indigenous Lenca people. Her activism earned her the Goldman Environmental Prize in 2015.\n\nDespite receiving numerous death threats, she continued her work until she was assassinated in her home in 2016. Her death sparked international outrage and highlighted the dangers faced by environmental defenders.',
      category: 'activism',
      era: '21st Century',
      region: 'Latin America',
      imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
      submittedBy: 'Admin',
      submitterEmail: 'admin@herstories.org',
      status: 'approved',
      featured: false,
    },
    {
      title: 'The Hidden Figure of Space Exploration',
      subject: 'Katherine Johnson',
      summary: 'Mathematician whose calculations were critical to NASA space missions.',
      content: 'Katherine Johnson (1918-2020) was an American mathematician whose calculations of orbital mechanics as a NASA employee were critical to the success of the first and subsequent U.S. crewed spaceflights.\n\nDuring her 35-year career at NASA, she calculated the trajectories for many historic missions, including the 1969 Apollo 11 flight to the Moon. Her work was essential in verifying the calculations for John Glenns orbit around Earth.\n\nDespite facing both racial and gender discrimination, she persevered and became one of the most respected mathematicians at NASA. Her story was popularized in the book and film Hidden Figures.',
      category: 'science',
      era: 'Mid 20th Century (1945-1975)',
      region: 'North America',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
      submittedBy: 'Admin',
      submitterEmail: 'admin@herstories.org',
      status: 'approved',
      featured: true,
    },
  ];

  const insertStmt = db.prepare(`
    INSERT INTO stories (title, subject, summary, content, category, era, region, image_url, submitted_by, submitter_email, status, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const story of sampleStories) {
    insertStmt.run(
      story.title,
      story.subject,
      story.summary,
      story.content,
      story.category,
      story.era,
      story.region,
      story.imageUrl,
      story.submittedBy,
      story.submitterEmail,
      story.status,
      story.featured ? 1 : 0
    );
  }

  console.log('Sample stories inserted!');
};

export { db, initializeDatabase };
