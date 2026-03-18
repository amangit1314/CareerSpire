import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockService } from '@/services/mock.service';
import type {
  StartMockRequest,
  SubmitSolutionRequest,
  MockSession,
  MockResult,
} from '@/types';

const MOCK_QUERY_KEY = ['mock'] as const;

export const useStartMock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartMockRequest) => mockService.startMock(data),
    onSuccess: (session) => {
      queryClient.setQueryData([...MOCK_QUERY_KEY, session.id], session);
      queryClient.invalidateQueries({ queryKey: MOCK_QUERY_KEY });
    },
  });
};

export const useMockSession = (sessionId: string | null) => {
  return useQuery<MockSession>({
    queryKey: [...MOCK_QUERY_KEY, sessionId],
    queryFn: () => mockService.getSession(sessionId!),
    enabled: !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useSubmitSolution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitSolutionRequest) => mockService.submitSolution(data),
    onSuccess: (result, variables) => {
      // Invalidate session to refetch with new results
      queryClient.invalidateQueries({
        queryKey: [...MOCK_QUERY_KEY, variables.sessionId],
      });
      queryClient.invalidateQueries({ queryKey: MOCK_QUERY_KEY });
    },
  });
};

export const useMockSessions = () => {
  return useQuery<MockSession[]>({
    queryKey: [...MOCK_QUERY_KEY, 'sessions'],
    queryFn: () => mockService.getSessions(),
    staleTime: 60 * 1000, // 1 minute
  });
};
