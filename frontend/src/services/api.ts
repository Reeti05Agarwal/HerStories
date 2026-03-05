const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Generic API call function
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  me: async () => {
    return apiCall('/auth/me');
  },
};

// Stories API
export const storiesApi = {
  getAll: async (filters?: { category?: string; era?: string; region?: string; featured?: boolean; search?: string }) => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.category) params.append('category', filters.category);
      if (filters.era) params.append('era', filters.era);
      if (filters.region) params.append('region', filters.region);
      if (filters.featured !== undefined) params.append('featured', String(filters.featured));
      if (filters.search) params.append('search', filters.search);
    }
    const queryString = params.toString();
    return apiCall(`/stories${queryString ? `?${queryString}` : ''}`);
  },
  getById: async (id: string) => {
    return apiCall(`/stories/${id}`);
  },
  create: async (story: Record<string, unknown>) => {
    return apiCall('/stories', {
      method: 'POST',
      body: JSON.stringify(story),
    });
  },
  update: async (id: string, updates: Record<string, unknown>) => {
    return apiCall(`/stories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  delete: async (id: string) => {
    return apiCall(`/stories/${id}`, {
      method: 'DELETE',
    });
  },
};

// Submissions API
export const submissionsApi = {
  getAll: async (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return apiCall(`/submissions${params}`);
  },
  getById: async (id: string) => {
    return apiCall(`/submissions/${id}`);
  },
  create: async (submission: Record<string, unknown>) => {
    return apiCall('/submissions', {
      method: 'POST',
      body: JSON.stringify(submission),
    });
  },
  approve: async (id: string, adminNotes?: string) => {
    return apiCall(`/submissions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ adminNotes }),
    });
  },
  reject: async (id: string, adminNotes?: string) => {
    return apiCall(`/submissions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ adminNotes }),
    });
  },
  delete: async (id: string) => {
    return apiCall(`/submissions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Contributions API
export const contributionsApi = {
  getAll: async (filters?: { status?: string; storyId?: string }) => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.storyId) params.append('storyId', filters.storyId);
    }
    const queryString = params.toString();
    return apiCall(`/contributions${queryString ? `?${queryString}` : ''}`);
  },
  getById: async (id: string) => {
    return apiCall(`/contributions/${id}`);
  },
  create: async (contribution: Record<string, unknown>) => {
    return apiCall('/contributions', {
      method: 'POST',
      body: JSON.stringify(contribution),
    });
  },
  approve: async (id: string) => {
    return apiCall(`/contributions/${id}/approve`, {
      method: 'POST',
    });
  },
  reject: async (id: string) => {
    return apiCall(`/contributions/${id}/reject`, {
      method: 'POST',
    });
  },
  delete: async (id: string) => {
    return apiCall(`/contributions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Contributors API
export const contributorsApi = {
  getMe: async () => {
    return apiCall('/contributors/me');
  },
  getAll: async () => {
    return apiCall('/contributors');
  },
};

// Stats API
export const statsApi = {
  getAdminStats: async () => {
    return apiCall('/stats');
  },
};

// Token management
export const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  return !!getToken();
};
