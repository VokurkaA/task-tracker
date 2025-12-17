import {type ReactNode, useEffect, useState} from 'react';
import {api} from '../lib/api';
import type {AuthResponse, LoginCredentials, SignupCredentials, User} from '../types';
import {io, Socket} from 'socket.io-client';
import {useQueryClient} from '@tanstack/react-query';
import {AuthContext} from './AuthContext';

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const queryClient = useQueryClient();

    useEffect(() => {
        let socketInstance: Socket | null = null;

        const initAuth = async () => {
            if (token && !user) {
                try {
                    const {data} = await api.get('/auth/me');
                    setUser(data);
                } catch (err) {
                    console.error("Session restore failed", err);
                    setToken(null);
                    setUser(null);
                    localStorage.removeItem('token');
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        initAuth();

        if (token && user?.id) {
            socketInstance = io('http://localhost:4000', {
                auth: {userId: user.id},
            });

            socketInstance.on('connect', () => {
                console.log('Connected to socket');
            });

            socketInstance.on('update', (event) => {
                console.log('Real-time update received:', event);
                queryClient.invalidateQueries({queryKey: ['tasks']});
            });

            setSocket(socketInstance);
        }

        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, [token, user?.id, queryClient, user]);

    const login = async (credentials: LoginCredentials) => {
        const {data} = await api.post<AuthResponse>('/auth/login', credentials);
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const signup = async (credentials: SignupCredentials) => {
        const {data} = await api.post<AuthResponse>('/auth/signup', credentials);
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');

        queryClient.clear();

        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    };

    return (<AuthContext.Provider value={{
        user, token, socket, isLoading, login, signup, logout
    }}>
        {children}
    </AuthContext.Provider>);
};