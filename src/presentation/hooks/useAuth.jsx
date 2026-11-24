"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { getSupabaseClient } from "../../infrastructure/database/supabase-photo.adapter";

export function useAuth() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false);
      return;
    }

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) {
          setUser(data?.session?.user || null);
          setIsAuthLoading(false);
        }
      })
      .catch(() => {
        if (active) setIsAuthLoading(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active) {
          setUser(session?.user || null);
          setIsAuthLoading(false);
        }
      }
    );

    return () => {
      active = false;
      subscription?.subscription?.unsubscribe();
    };
  }, [supabase]);

  const signIn = useCallback(
    async ({ email, password }) => {
      if (!supabase) {
        return { error: "Supabase client is not configured." };
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { error: error.message };
      setUser(data?.user || null);
      return { user: data?.user || null };
    },
    [supabase]
  );

  const signUp = useCallback(
    async ({ email, password, fullName }) => {
      if (!supabase) {
        return { error: "Supabase client is not configured." };
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: (fullName || "").trim(),
          },
        },
      });
      if (error) return { error: error.message };
      if (data?.session?.user) {
        setUser(data.session.user);
      }
      return {
        user: data?.user || null,
        session: data?.session || null,
        needsEmailConfirmation: Boolean(data?.user && !data?.session),
      };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  const updateProfile = useCallback(
    async ({ fullName, username, bio, avatarUrl }) => {
      if (!supabase) {
        return { error: "Supabase client is not configured." };
      }
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: (fullName || "").trim(),
          username: (username || "").trim(),
          bio: (bio || "").trim(),
          avatar_url: (avatarUrl || "").trim(),
        },
      });
      if (error) return { error: error.message };
      if (data?.user) {
        setUser(data.user);
      }
      return { user: data?.user || null };
    },
    [supabase]
  );

  const updatePassword = useCallback(
    async ({ newPassword }) => {
      if (!supabase) {
        return { error: "Supabase client is not configured." };
      }
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) return { error: error.message };
      return { user: data?.user || null };
    },
    [supabase]
  );

  return {
    user,
    isAuthLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updatePassword,
  };
}
