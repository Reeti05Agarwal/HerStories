import type { Story, StorySubmission, Contribution, Contributor, StoryCategory } from '@/types';

const STORAGE_KEYS = {
  stories: 'herstories_stories',
  submissions: 'herstories_submissions',
  contributions: 'herstories_contributions',
  contributors: 'herstories_contributors',
};

// Initialize with sample data
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.stories)) {
    const sampleStories: Story[] = [
      {
        id: '1',
        title: 'The Woman Who Mapped the Stars',
        subject: 'Annie Jump Cannon',
        summary: 'Astronomer who developed the stellar classification system still used today.',
        content: 'Annie Jump Cannon (1863-1941) was an American astronomer whose cataloging work was instrumental in the development of contemporary stellar classification. Despite being deafened by scarlet fever in her youth, she became one of the most accomplished astronomers of her time.\n\nCannon developed the Harvard Classification Scheme, which organized stars by their temperatures. This system, with modifications, is still used today. She classified over 350,000 stars during her career at the Harvard College Observatory, where she was paid significantly less than her male counterparts despite doing more work.\n\nHer contributions to astronomy were finally recognized when she became the first woman to receive an honorary doctorate from Oxford University in 1925.',
        category: 'science',
        era: '19th Century',
        region: 'North America',
        imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
        contributions: [],
        submittedBy: 'Admin',
        submitterEmail: 'admin@herstories.org',
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        featured: true,
      },
      {
        id: '2',
        title: 'The Mother of Modern Medicine',
        subject: 'Henrietta Lacks',
        summary: 'Her cells revolutionized medical research, though she never knew their impact.',
        content: 'Henrietta Lacks (1920-1951) was an African-American woman whose cancer cells are the source of the HeLa cell line, the first immortalized human cell line and one of the most important cell lines in medical research.\n\nHer cells were taken without her knowledge or consent during a biopsy at Johns Hopkins Hospital. HeLa cells have been used in countless scientific breakthroughs, including the polio vaccine, cancer research, gene mapping, and in vitro fertilization.\n\nIt wasnt until decades later that her family learned about the widespread use of her cells. Her story has sparked important conversations about medical ethics, consent, and the rights of patients.',
        category: 'healthcare',
        era: 'Mid 20th Century (1945-1975)',
        region: 'North America',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
        contributions: [],
        submittedBy: 'Admin',
        submitterEmail: 'admin@herstories.org',
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        featured: true,
      },
      {
        id: '3',
        title: 'The Warrior Queen Who Defied Empires',
        subject: 'Queen Nzinga of Ndongo',
        summary: 'A 17th-century African queen who successfully resisted Portuguese colonization.',
        content: 'Queen Nzinga Mbandi (1583-1663) was the queen of the Ndongo and Matamba Kingdoms in what is now Angola. She ruled for 37 years and became known for her political and diplomatic wisdom, as well as her military prowess.\n\nNzinga came to power during a period of intense conflict with Portuguese colonizers who were expanding the slave trade. She formed alliances with the Dutch and neighboring African states to resist Portuguese expansion. Her diplomatic skills were legendary - she famously refused to sit on the floor when meeting with Portuguese governors, instead having her servants form a human chair.\n\nShe created a powerful military state and offered sanctuary to escaped slaves and Portuguese-trained African soldiers. Her resistance delayed Portuguese colonization of the interior of Angola for decades.',
        category: 'politics',
        era: 'Early Modern (1500-1800)',
        region: 'Africa',
        imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80',
        contributions: [],
        submittedBy: 'Admin',
        submitterEmail: 'admin@herstories.org',
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        featured: true,
      },
      {
        id: '4',
        title: 'The First Computer Programmer',
        subject: 'Ada Lovelace',
        summary: 'Mathematician who wrote the first algorithm intended for a machine.',
        content: 'Ada Lovelace (1815-1852) was an English mathematician and writer, chiefly known for her work on Charles Babbages early mechanical general-purpose computer, the Analytical Engine.\n\nHer notes on the engine include what is recognized as the first algorithm intended to be processed by a machine. Because of this, she is often regarded as the first computer programmer.\n\nLovelace saw possibilities in computing that went beyond mere calculation. She envisioned that computers could be used to create music, art, and more - a concept that would not be realized for over a century.',
        category: 'technology',
        era: '19th Century',
        region: 'Europe',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
        contributions: [],
        submittedBy: 'Admin',
        submitterEmail: 'admin@herstories.org',
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        featured: false,
      },
      {
        id: '5',
        title: 'The Environmental Defender of the Amazon',
        subject: 'Berta Cáceres',
        summary: 'Indigenous environmental activist who gave her life protecting rivers and land.',
        content: 'Berta Cáceres (1971-2016) was a Honduran environmental activist, indigenous leader, and co-founder of the Council of Popular and Indigenous Organizations of Honduras (COPINH).\n\nShe led a successful campaign to stop the construction of the Agua Zarca Dam, which would have cut off the Gualcarque River, a vital water source for the indigenous Lenca people. Her activism earned her the Goldman Environmental Prize in 2015.\n\nDespite receiving numerous death threats, she continued her work until she was assassinated in her home in 2016. Her death sparked international outrage and highlighted the dangers faced by environmental defenders.',
        category: 'activism',
        era: '21st Century',
        region: 'Latin America',
        imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
        contributions: [],
        submittedBy: 'Admin',
        submitterEmail: 'admin@herstories.org',
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        featured: false,
      },
      {
        id: '6',
        title: 'The Hidden Figure of Space Exploration',
        subject: 'Katherine Johnson',
        summary: 'Mathematician whose calculations were critical to NASA space missions.',
        content: 'Katherine Johnson (1918-2020) was an American mathematician whose calculations of orbital mechanics as a NASA employee were critical to the success of the first and subsequent U.S. crewed spaceflights.\n\nDuring her 35-year career at NASA, she calculated the trajectories for many historic missions, including the 1969 Apollo 11 flight to the Moon. Her work was essential in verifying the calculations for John Glenns orbit around Earth.\n\nDespite facing both racial and gender discrimination, she persevered and became one of the most respected mathematicians at NASA. Her story was popularized in the book and film Hidden Figures.',
        category: 'science',
        era: 'Mid 20th Century (1945-1975)',
        region: 'North America',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
        contributions: [],
        submittedBy: 'Admin',
        submitterEmail: 'admin@herstories.org',
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        featured: true,
      },
    ];
    localStorage.setItem(STORAGE_KEYS.stories, JSON.stringify(sampleStories));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.submissions)) {
    localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.contributions)) {
    localStorage.setItem(STORAGE_KEYS.contributions, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.contributors)) {
    localStorage.setItem(STORAGE_KEYS.contributors, JSON.stringify([]));
  }
};

// Story operations
export const getStories = (): Story[] => {
  initializeData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.stories) || '[]');
};

export const getApprovedStories = (): Story[] => {
  return getStories().filter(story => story.status === 'approved');
};

export const getFeaturedStories = (): Story[] => {
  return getApprovedStories().filter(story => story.featured);
};

export const getStoryById = (id: string): Story | undefined => {
  return getStories().find(story => story.id === id);
};

export const addStory = (story: Omit<Story, 'id' | 'createdAt' | 'updatedAt' | 'contributions'>): Story => {
  const stories = getStories();
  const newStory: Story = {
    ...story,
    id: Date.now().toString(),
    contributions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  stories.push(newStory);
  localStorage.setItem(STORAGE_KEYS.stories, JSON.stringify(stories));
  return newStory;
};

export const updateStory = (id: string, updates: Partial<Story>): Story | null => {
  const stories = getStories();
  const index = stories.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  stories[index] = { ...stories[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEYS.stories, JSON.stringify(stories));
  return stories[index];
};

// Submission operations
export const getSubmissions = (): StorySubmission[] => {
  initializeData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.submissions) || '[]');
};

export const addSubmission = (submission: Omit<StorySubmission, 'id' | 'createdAt' | 'status'>): StorySubmission => {
  const submissions = getSubmissions();
  const newSubmission: StorySubmission = {
    ...submission,
    id: Date.now().toString(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  submissions.push(newSubmission);
  localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(submissions));
  
  // Track contributor
  trackContributor(submission.submitterEmail, submission.submittedBy, {
    storyId: newSubmission.id,
    storyTitle: submission.title,
    type: 'story',
    date: newSubmission.createdAt,
    status: 'pending',
  });
  
  return newSubmission;
};

export const approveSubmission = (id: string, adminNotes?: string): { submission: StorySubmission; story: Story } | null => {
  const submissions = getSubmissions();
  const index = submissions.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  submissions[index].status = 'approved';
  submissions[index].adminNotes = adminNotes;
  localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(submissions));
  
  // Create story from submission
  const submission = submissions[index];
  const story = addStory({
    title: submission.title,
    subject: submission.subject,
    summary: submission.summary,
    content: submission.content,
    category: submission.category,
    era: submission.era,
    region: submission.region,
    submittedBy: submission.submittedBy,
    submitterEmail: submission.submitterEmail,
    status: 'approved',
    featured: false,
  });
  
  // Update contributor status
  updateContributorStatus(submission.submitterEmail, id, 'story', 'approved', story.id, story.title);
  
  return { submission: submissions[index], story };
};

export const rejectSubmission = (id: string, adminNotes?: string): StorySubmission | null => {
  const submissions = getSubmissions();
  const index = submissions.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  submissions[index].status = 'rejected';
  submissions[index].adminNotes = adminNotes;
  localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(submissions));
  
  // Update contributor status
  updateContributorStatus(submissions[index].submitterEmail, id, 'story', 'rejected');
  
  return submissions[index];
};

// Contribution operations
export const getContributions = (): Contribution[] => {
  initializeData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.contributions) || '[]');
};

export const addContribution = (contribution: Omit<Contribution, 'id' | 'createdAt' | 'status'>): Contribution => {
  const contributions = getContributions();
  const newContribution: Contribution = {
    ...contribution,
    id: Date.now().toString(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  contributions.push(newContribution);
  localStorage.setItem(STORAGE_KEYS.contributions, JSON.stringify(contributions));
  
  // Track contributor
  const story = getStoryById(contribution.storyId);
  trackContributor(contribution.submitterEmail, contribution.submittedBy, {
    storyId: contribution.storyId,
    storyTitle: story?.title || 'Unknown Story',
    type: 'addition',
    date: newContribution.createdAt,
    status: 'pending',
  });
  
  return newContribution;
};

export const approveContribution = (id: string): { contribution: Contribution; story: Story } | null => {
  const contributions = getContributions();
  const index = contributions.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  contributions[index].status = 'approved';
  localStorage.setItem(STORAGE_KEYS.contributions, JSON.stringify(contributions));
  
  // Add to story
  const contribution = contributions[index];
  const story = getStoryById(contribution.storyId);
  if (story) {
    story.contributions.push(contribution);
    updateStory(story.id, { contributions: story.contributions });
  }
  
  // Update contributor status
  updateContributorStatus(contribution.submitterEmail, id, 'addition', 'approved');
  
  return { contribution: contributions[index], story: story! };
};

export const rejectContribution = (id: string): Contribution | null => {
  const contributions = getContributions();
  const index = contributions.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  contributions[index].status = 'rejected';
  localStorage.setItem(STORAGE_KEYS.contributions, JSON.stringify(contributions));
  
  // Update contributor status
  updateContributorStatus(contributions[index].submitterEmail, id, 'addition', 'rejected');
  
  return contributions[index];
};

// Contributor operations
export const getContributors = (): Contributor[] => {
  initializeData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.contributors) || '[]');
};

export const trackContributor = (
  email: string,
  name: string,
  contribution: Contributor['contributions'][0]
): void => {
  const contributors = getContributors();
  const index = contributors.findIndex(c => c.email === email);
  
  if (index === -1) {
    contributors.push({
      email,
      name,
      contributions: [contribution],
    });
  } else {
    contributors[index].contributions.push(contribution);
  }
  
  localStorage.setItem(STORAGE_KEYS.contributors, JSON.stringify(contributors));
};

export const updateContributorStatus = (
  email: string,
  contributionId: string,
  type: 'story' | 'addition',
  status: 'approved' | 'rejected',
  storyId?: string,
  storyTitle?: string
): void => {
  const contributors = getContributors();
  const index = contributors.findIndex(c => c.email === email);
  
  if (index !== -1) {
    const contribution = contributors[index].contributions.find(
      c => c.storyId === contributionId && c.type === type
    );
    if (contribution) {
      contribution.status = status;
      if (storyId) contribution.storyId = storyId;
      if (storyTitle) contribution.storyTitle = storyTitle;
      localStorage.setItem(STORAGE_KEYS.contributors, JSON.stringify(contributors));
    }
  }
};

export const getContributorByEmail = (email: string): Contributor | undefined => {
  return getContributors().find(c => c.email === email);
};

// Search and filter
export const searchStories = (query: string, stories?: Story[]): Story[] => {
  const targetStories = stories || getApprovedStories();
  const lowerQuery = query.toLowerCase();
  
  return targetStories.filter(story =>
    story.title.toLowerCase().includes(lowerQuery) ||
    story.subject.toLowerCase().includes(lowerQuery) ||
    story.summary.toLowerCase().includes(lowerQuery) ||
    story.content.toLowerCase().includes(lowerQuery) ||
    story.category.toLowerCase().includes(lowerQuery) ||
    story.era.toLowerCase().includes(lowerQuery) ||
    story.region.toLowerCase().includes(lowerQuery)
  );
};

export const filterStoriesByCategory = (category: StoryCategory, stories?: Story[]): Story[] => {
  const targetStories = stories || getApprovedStories();
  return targetStories.filter(story => story.category === category);
};

export const filterStoriesByEra = (era: string, stories?: Story[]): Story[] => {
  const targetStories = stories || getApprovedStories();
  return targetStories.filter(story => story.era === era);
};

export const filterStoriesByRegion = (region: string, stories?: Story[]): Story[] => {
  const targetStories = stories || getApprovedStories();
  return targetStories.filter(story => story.region === region);
};

// Admin stats
export const getAdminStats = () => {
  const stories = getStories();
  const submissions = getSubmissions();
  const contributions = getContributions();
  
  return {
    totalStories: stories.filter(s => s.status === 'approved').length,
    pendingSubmissions: submissions.filter(s => s.status === 'pending').length,
    pendingContributions: contributions.filter(c => c.status === 'pending').length,
    totalContributors: getContributors().length,
  };
};
