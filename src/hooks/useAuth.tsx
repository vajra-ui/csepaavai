import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'faculty' | 'student';

interface AuthState {
  user: User | null;
  session: Session | null;
  roles: UserRole[];
  isLoading: boolean;
  isAdmin: boolean;
  isFaculty: boolean;
  isStudent: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    roles: [],
    isLoading: true,
    isAdmin: false,
    isFaculty: false,
    isStudent: false,
  });

  const fetchUserRoles = useCallback(async (userId: string): Promise<UserRole[]> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching roles:', error);
        return [];
      }

      return (data || []).map((r) => r.role as UserRole);
    } catch (err) {
      console.error('Error fetching roles:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        
        if (user) {
          // Use setTimeout to avoid potential race conditions
          setTimeout(async () => {
            const roles = await fetchUserRoles(user.id);
            setAuthState({
              user,
              session,
              roles,
              isLoading: false,
              isAdmin: roles.includes('admin'),
              isFaculty: roles.includes('faculty'),
              isStudent: roles.includes('student'),
            });
          }, 0);
        } else {
          setAuthState({
            user: null,
            session: null,
            roles: [],
            isLoading: false,
            isAdmin: false,
            isFaculty: false,
            isStudent: false,
          });
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      
      if (user) {
        const roles = await fetchUserRoles(user.id);
        setAuthState({
          user,
          session,
          roles,
          isLoading: false,
          isAdmin: roles.includes('admin'),
          isFaculty: roles.includes('faculty'),
          isStudent: roles.includes('student'),
        });
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserRoles]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
  };
}
