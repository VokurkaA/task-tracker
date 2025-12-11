export enum Priority {
    LOW = 'low', MEDIUM = 'medium', HIGH = 'high', CRITICAL = 'critical'
}

export enum Role {
    OWNER = 'owner', EDITOR = 'editor', VIEWER = 'viewer'
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
    username: string;
    xp: number;
    email?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password?: string;
}

export interface SignupCredentials {
    email: string;
    password?: string;
    username: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}