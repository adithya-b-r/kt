'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    email: string;
    first_name: string;
    last_name: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any; user: User | null }>;
    signUp: (email: string, password: string, data: { first_name: string; last_name: string }) => Promise<{ error: any; user: User | null }>;
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
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
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

    const signUp = async (email: string, password: string, extraData: { first_name: string; last_name: string }) => {
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

    const signOut = () => {
        setUser(null);
        localStorage.removeItem('user');
        router.push('/login');
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
