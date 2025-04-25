import { Entry } from './types';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      error.message || 'An error occurred',
      response.status,
      error.code
    );
  }
  return response.json();
}

export const api = {
  entries: {
    getAll: async (): Promise<Entry[]> => {
      const response = await fetch('/api/entries');
      return handleResponse<Entry[]>(response);
    },

    getById: async (id: string): Promise<Entry> => {
      const response = await fetch(`/api/entries/${id}`);
      return handleResponse<Entry>(response);
    },

    create: async (data: Omit<Entry, 'id' | 'date' | 'lastUpdated'>): Promise<Entry> => {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return handleResponse<Entry>(response);
    },

    update: async (id: string, data: Partial<Omit<Entry, 'id' | 'date' | 'lastUpdated'>>): Promise<Entry> => {
      const response = await fetch(`/api/entries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return handleResponse<Entry>(response);
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<void>(response);
    },
  },
}; 