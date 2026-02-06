import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../api/client';

type AuthState = {
  user: any;
  role: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  role: null,
  loading: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true
  });

  useEffect(() => {
    const session = supabase.auth.getSession();

    session.then(async ({ data }) => {
      if (!data.session) {
        setState({ user: null, role: null, loading: false });
        return;
      }

      const user = data.session.user;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setState({
        user,
        role: profile?.role ?? null,
        loading: false
      });
    });
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);