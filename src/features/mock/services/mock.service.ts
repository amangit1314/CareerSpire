import { apiManager } from '@/lib/api-manager';
import type {
  StartMockRequest,
  StartMockResponse,
  SubmitSolutionRequest,
  SubmitSolutionResponse,
  MockSession,
  MockResult,
} from '@/types';

export const mockService = {
  startMock: async (data: StartMockRequest): Promise<MockSession> => {
    const response = await apiManager.post<StartMockResponse>('/mock/start', data);
    console.log(`Start mock response: ${JSON.stringify(response)}`);
    if (response.error) {
      throw new Error(typeof response.error === 'string' ? response.error : response.error.message);
    }
    if (!response.data) throw new Error('No data returned from startMock');
    return response.data.session;
  },

  getSession: async (sessionId: string): Promise<MockSession> => {
    const response = await apiManager.get<MockSession>(`/mock/${sessionId}`);
    if (response.error) {
      throw new Error(typeof response.error === 'string' ? response.error : response.error.message);
    }
    if (!response.data) throw new Error('No session data returned');
    return response.data;
  },

  submitSolution: async (data: SubmitSolutionRequest): Promise<MockResult> => {
    const response = await apiManager.post<SubmitSolutionResponse>('/mock/submit', data);
    if (response.error) {
      throw new Error(typeof response.error === 'string' ? response.error : response.error.message);
    }
    if (!response.data) throw new Error('No data returned from submitSolution');
    return response.data.result;
  },

  getSessions: async (): Promise<MockSession[]> => {
    const response = await apiManager.get<MockSession[]>('/mock/sessions');
    if (response.error) {
      throw new Error(typeof response.error === 'string' ? response.error : response.error.message);
    }
    if (!response.data) throw new Error('No sessions data returned');
    return response.data;
  },
};
