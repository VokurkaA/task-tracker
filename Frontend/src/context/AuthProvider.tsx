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
    const queryClient = useQueryClient();

    useEffect(() => {
        if (token && user?.id) {
            const newSocket = io('http://localhost:4000', {
                auth: {userId: user.id},
            });

            newSocket.on('connect', () => {
                console.log('Connected to socket');
            });

            newSocket.on('update', (event) => {
                console.log('Real-time update received:', event);
                queryClient.invalidateQueries({queryKey: ['tasks']});
            });

            const timeoutId = setTimeout(() => {
                setSocket(newSocket);
            }, 0);

            return () => {
                clearTimeout(timeoutId);
                newSocket.disconnect();
            };
        }
    }, [token, user?.id, queryClient]);

    const login = async (credentials: LoginCredentials) => {
        const {data} = await api.post<AuthResponse>('/auth/login', credentials);
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
    };

    const signup = async (credentials: SignupCredentials) => {
        await api.post('/auth/signup', credentials);
        await login(credentials);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    };

    return (<AuthContext.Provider value={{user, token, socket, login, signup, logout}}>
        {children}
    </AuthContext.Provider>);
};