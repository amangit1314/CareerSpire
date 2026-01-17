import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import type { SignUpRequest, SignInRequest, User } from '@/types';

const AUTH_QUERY_KEY = ['auth'] as const;
const USER_QUERY_KEY = ['auth', 'user'] as const;

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: USER_QUERY_KEY,
    queryFn: async () => {
      try {
        return await authService.getCurrentUser();
      } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
      }
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('auth_token'),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const signUpMutation = useMutation({
    mutationFn: (data: SignUpRequest) => authService.signUp(data),
    onSuccess: (response) => {
      if (typeof window !== 'undefined' && response.session?.accessToken) {
        localStorage.setItem('auth_token', response.session.accessToken);
      }
      queryClient.setQueryData(USER_QUERY_KEY, response.user);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });

  const signInMutation = useMutation({
    mutationFn: (data: SignInRequest) => authService.signIn(data),
    onSuccess: (response) => {
      if (typeof window !== 'undefined' && response.session?.accessToken) {
        localStorage.setItem('auth_token', response.session.accessToken);
      }
      queryClient.setQueryData(USER_QUERY_KEY, response.user);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });

  const signOutMutation = useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(USER_QUERY_KEY, null);
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp: signUpMutation.mutateAsync,
    signIn: signInMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    isSigningUp: signUpMutation.isPending,
    isSigningIn: signInMutation.isPending,
    isSigningOut: signOutMutation.isPending,
  };
};
