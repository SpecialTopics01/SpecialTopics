import React, { useEffect, useState, createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, UserType } from '../lib/supabase';
import type { Profile } from '../types/database';
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, userType: UserType, team?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });
    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const {
        data,
        error
      } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, try to create it manually
        if (error.code === 'PGRST116') {
          console.log('Profile not found, this might indicate the trigger didn\'t work');
        }
        throw error;
      }
      console.log('Profile fetched successfully:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };
  const signUp = async (email: string, password: string, fullName: string, userType: UserType, team?: string) => {
    const {
      data,
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: userType,
          team: userType === 'admin' ? team : undefined
        }
      }
    });
    if (error) throw error;
    if (!data.user) throw new Error('User creation failed');
    // Profile will be created automatically by database trigger
  };
  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in user:', email);
    const {
      data,
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    console.log('Sign in successful, user:', data.user?.id);

    // Wait a moment for the auth state change to propagate
    await new Promise(resolve => setTimeout(resolve, 100));

    // If we have a user but no profile after login, try to fetch/create it
    if (data.user) {
      await fetchProfile(data.user.id);
    }
  };
  const signOut = async () => {
    const {
      error
    } = await supabase.auth.signOut();
    if (error) throw error;
  };
  return <AuthContext.Provider value={{
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut
  }}>
      {children}
    </AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}