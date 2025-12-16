export enum Priority {
    LOW = 'low', MEDIUM = 'medium', HIGH = 'high', CRITICAL = 'critical'
}

export enum Role {
    OWNER = 'owner', EDITOR = 'editor', VIEWER = 'viewer'
}

export enum ShareStatus {
    PENDING = 'pending', ACCEPTED = 'accepted'
}

export interface Subtask {
    id: string;
    title: string;
    isComplete: boolean;
}

export interface SharedUser {
    userId: string;
    role: Role;
    status: ShareStatus;
}

export interface Task {
    id: string;
    ownerId: string;
    title: string;
    description?: string;
    category: string;
    priority: Priority;
    isCompleted: boolean;
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