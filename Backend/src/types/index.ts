export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum Role {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

export interface Subtask {
  id: string;
  title: string;
  isComplete: boolean;
}

export interface SharedUser {
  userId: string;
  role: Role;
}

export interface Task {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  priority: Priority;
  status: 'pending' | 'completed';
  createdAt: number;
  sharedWith: SharedUser[];
  subtasks: Subtask[];
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  xp: number;
  level: number;
  currentStreak: number;
  lastActive: number;
}