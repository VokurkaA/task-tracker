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
    email: string;
    username: string;
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
    email: string;
    passwordHash: string;
    username: string;
    xp: number;
    level: number;
    currentStreak: number;
    lastActive: number;
}