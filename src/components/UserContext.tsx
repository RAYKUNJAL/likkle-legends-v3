"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface Subscription {
    plan_id: string;
    status: string;
}

interface ProfileWithSubscriptions {
    id: string;
    first_name: string;
    email: string;
    subscriptions?: Subscription[];
}

interface Profile {
    id: string;
    first_name: string;
    email: string;
    subscription_tier: string;
    subscription_status: string;
}

interface UserContextType {
    user: Profile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const initialized = useRef(false);

    const refreshUser = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        const { data: profile } = await supabase
            .from('users')
            .select('*, subscriptions(plan_id, status)')
            .eq('id', session.user.id)
            .single();

        if (profile) {
            const typedProfile = profile as ProfileWithSubscriptions;
            const { subscriptions, ...userData } = typedProfile;
            const latestSub = subscriptions?.[0];
            setUser({
                ...userData,
                subscription_tier: latestSub?.plan_id || 'free',
                subscription_status: latestSub?.status || 'inactive'
            });
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        Promise.resolve().then(() => {
            refreshUser();
        });
    }, [refreshUser]);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
    }, []);

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        refreshUser,
        logout
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
