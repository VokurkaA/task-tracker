import {createContext} from 'react';
import {Socket} from 'socket.io-client';
import type {LoginCredentials, SignupCredentials, User} from '../types';

export interface AuthContextType {
    user: User | null;
    token: string | null;
    socket: Socket | null;
    isLoading: boolean;
    login: (data: LoginCredentials) => Promise<void>;
    signup: (data: SignupCredentials) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);