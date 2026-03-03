// Types for HerStories Platform

export interface Story {
  id: string;
  title: string;
  subject: string;
  summary: string;
  content: string;
  category: StoryCategory;
  era: string;
  region: string;
  imageUrl?: string;
  contributions: Contribution[];
  submittedBy: string;
  submitterEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  featured: boolean;
}

export interface Contribution {
  id: string;
  storyId: string;
  content: string;
  submittedBy: string;
  submitterEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface StorySubmission {
  id: string;
  title: string;
  subject: string;
  summary: string;
  content: string;
  category: StoryCategory;
  era: string;
  region: string;
  submittedBy: string;
  submitterEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
}

export interface Contributor {
  email: string;
  name: string;
  contributions: {
    storyId: string;
    storyTitle: string;
    type: 'story' | 'addition';
    date: string;
    status: 'pending' | 'approved' | 'rejected';
  }[];
}

export type StoryCategory = 
  | 'science'
  | 'arts'
  | 'politics'
  | 'activism'
  | 'business'
  | 'education'
  | 'healthcare'
  | 'sports'
  | 'technology'
  | 'other';

export const CATEGORY_LABELS: Record<StoryCategory, string> = {
  science: 'Science & Research',
  arts: 'Arts & Culture',
  politics: 'Politics & Leadership',
  activism: 'Activism & Social Justice',
  business: 'Business & Entrepreneurship',
  education: 'Education & Academia',
  healthcare: 'Healthcare & Medicine',
  sports: 'Sports & Athletics',
  technology: 'Technology & Innovation',
  other: 'Other Fields',
};

export const ERA_OPTIONS = [
  'Ancient (Before 500 CE)',
  'Medieval (500-1500)',
  'Early Modern (1500-1800)',
  '19th Century',
  'Early 20th Century (1900-1945)',
  'Mid 20th Century (1945-1975)',
  'Late 20th Century (1975-2000)',
  '21st Century',
];

export const REGION_OPTIONS = [
  'Africa',
  'Asia',
  'Caribbean',
  'Europe',
  'Latin America',
  'Middle East',
  'North America',
  'Oceania',
  'Global/Multiple Regions',
];
