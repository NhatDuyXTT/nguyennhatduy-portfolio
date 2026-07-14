export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  github_url: string | null;
  demo_url: string | null;
  created_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  published_at: string | null;
}

export interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
