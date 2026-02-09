'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    email: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    role?: 'user' | 'admin';
    plan_type?: 'free' | 'pro';
    tree_limit?: number;
    date_of_birth?: string | Date;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any; user: User | null }>;
    signUp: (email: string, password: string, data: { first_name: string; middle_name?: string; last_name: string; date_of_birth?: Date }) => Promise<{ error: any; user: User | null }>;
    signOut: () => void;
    updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: false,
    signIn: async () => ({ error: null, user: null }),
    signUp: async () => ({ error: null, user: null }),
    signOut: () => { },
    updateUser: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }

            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                } else if (res.status === 401) {
                    // Token invalid/expired
                    localStorage.removeItem('user');
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to refresh session', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                return { error: data, user: null };
            }

            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            return { error: null, user: data.user };
        } catch (error) {
            return { error: { message: 'Network error' }, user: null };
        }
    };

    const signUp = async (email: string, password: string, extraData: { first_name: string; middle_name?: string; last_name: string; date_of_birth?: Date }) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, ...extraData }),
            });
            const data = await res.json();

            if (!res.ok) {
                return { error: data, user: null };
            }

            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            return { error: null, user: data.user };
        } catch (error) {
            return { error: { message: 'Network error' }, user: null };
        }
    };

    const signOut = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            router.push('/login');
        }
    };

    const updateUser = (updatedUser: Partial<User>) => {
        if (user) {
            const newUser = { ...user, ...updatedUser };
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
