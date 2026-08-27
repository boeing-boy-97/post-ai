const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('postwave_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Authentication
  async signup(payload: { name: string; email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to sign up');
    return json;
  },

  async signin(payload: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to sign in');
    return json;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch user session');
    return json.user;
  },

  // Accounts
  async getAccounts() {
    const res = await fetch(`${API_BASE}/accounts`, {
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch accounts');
    return json.data;
  },

  async connectAccount(payload: { platform: string; accountName: string; accountHandle: string; accessToken?: string }) {
    const res = await fetch(`${API_BASE}/accounts/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to connect account');
    return json.data;
  },

  async disconnectAccount(id: string) {
    const res = await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to disconnect account');
    return json;
  },

  // Posts
  async getPosts(status?: string, platform?: string, search?: string) {
    const params = new URLSearchParams();
    if (status && status !== 'ALL' && status !== 'all') params.append('status', status);
    if (platform && platform !== 'ALL' && platform !== 'all') params.append('platform', platform);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/posts?${params.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch posts');
    return json.data;
  },

  async getPostById(id: string) {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch post');
    return json.data;
  },

  async createPost(payload: any) {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create post');
    return json.data;
  },

  async publishPostNow(id: string) {
    const res = await fetch(`${API_BASE}/posts/${id}/publish`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to publish post immediately');
    return json.data;
  },

  async cancelPost(id: string) {
    const res = await fetch(`${API_BASE}/posts/${id}/cancel`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to cancel post');
    return json.data;
  },

  async retryPost(id: string) {
    const res = await fetch(`${API_BASE}/posts/${id}/retry`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to retry post');
    return json.data;
  },

  async deletePost(id: string) {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete post');
    return json.data;
  },

  // Brand Memory (RAG)
  async getBrandDocs() {
    const res = await fetch(`${API_BASE}/brand`, {
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch brand documents');
    return json;
  },

  async createBrandDoc(payload: { title: string; docType: string; content: string; summary?: string; tags?: string[] }) {
    const res = await fetch(`${API_BASE}/brand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to ingest brand document');
    return json.data;
  },

  async updateBrandVoice(brandVoice: string) {
    const res = await fetch(`${API_BASE}/brand/voice`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ brandVoice }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update brand voice');
    return json;
  },

  async deleteBrandDoc(id: string) {
    const res = await fetch(`${API_BASE}/brand/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete document');
    return json;
  },

  // Campaigns Studio
  async getCampaigns() {
    const res = await fetch(`${API_BASE}/campaigns`, {
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch campaigns');
    return json.data;
  },

  async generateCampaign(payload: { name: string; objective: string; durationDays: number; targetPlatforms: string[] }) {
    const res = await fetch(`${API_BASE}/campaigns/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to generate campaign');
    return json.data;
  },

  async approveScheduleCampaign(id: string) {
    const res = await fetch(`${API_BASE}/campaigns/${id}/approve-schedule`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to schedule campaign');
    return json;
  },

  async deleteCampaign(id: string) {
    const res = await fetch(`${API_BASE}/campaigns/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete campaign');
    return json;
  },

  // Templates
  async getTemplates() {
    const res = await fetch(`${API_BASE}/templates`, {
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch templates');
    return json.data;
  },

  async createTemplate(payload: { title: string; content: string; mediaUrls?: string[]; platforms?: string[] }) {
    const res = await fetch(`${API_BASE}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create template');
    return json.data;
  },

  async deleteTemplate(id: string) {
    const res = await fetch(`${API_BASE}/templates/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete template');
    return json.data;
  },

  // Analytics
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch analytics');
    return json.data;
  },

  // AI Content
  async generateAIContent(payload: { topic: string; platform?: string; tone?: string; targetAudience?: string; additionalInstructions?: string }) {
    const res = await fetch(`${API_BASE}/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to generate AI content');
    return json.data;
  },

  async adaptAllPlatforms(masterContent: string) {
    const res = await fetch(`${API_BASE}/ai/adapt-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ masterContent }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to adapt content across platforms');
    return json.data;
  },

  // Media
  async getStockPresets() {
    const res = await fetch(`${API_BASE}/upload/presets`, {
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch stock presets');
    return json.data;
  },

  async uploadMedia(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to upload media');
    return json.url;
  },
};
