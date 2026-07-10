export interface User {
  id: string;
  username: string;
  email: string;
  fullname: string;
  score: number;
  createdAt: string;
}

export type TabType = 'home' | 'register' | 'game' | 'exporter';

export interface CodeFile {
  name: string;
  language: string;
  description: string;
  content: string;
}
