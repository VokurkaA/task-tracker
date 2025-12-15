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
        let socketInstance: Socket | null = null;

        const initAuth = async () => {
            if (token && !user) {
                try {
                    const {data} = await api.get('/auth/me');
                    setUser(data);
                } catch (err) {
                    setToken(null);
                    setUser(null);
                    localStorage.removeItem('token');
                }
                return;
            }

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
        };

        initAuth();

        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, [token, user, queryClient]);

    const login = async (credentials: LoginCredentials) => {
        const {data} = await api.post<AuthResponse>('/auth/login', credentials);
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
    };

    const signup = async (credentials: SignupCredentials) => {
        const {data} = await api.post<AuthResponse>('/auth/signup', credentials);
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
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