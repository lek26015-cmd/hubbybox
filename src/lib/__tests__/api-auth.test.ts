import { describe, it, expect, vi, beforeEach } from 'vitest';

// We test the signing/verification logic by importing the module
// Since api-auth.ts uses Node.js crypto and next/headers, we need to mock them properly

// Mock crypto module
vi.mock('crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('crypto')>();
  return {
    ...actual,
    createHmac: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue('abc123signature'),
    }),
    timingSafeEqual: vi.fn((a: Buffer, b: Buffer) => a.toString() === b.toString()),
  };
});

// Mock supabase-service
vi.mock('@/lib/supabase-service', () => ({
  getServiceSupabase: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { user_id: 'user-1' }, error: null }),
    }),
  }),
}));

describe('api-auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AuthError', () => {
    it('should create an error with status code', async () => {
      const { AuthError } = await import('@/lib/api-auth');
      const err = new AuthError('Forbidden', 403);
      expect(err.message).toBe('Forbidden');
      expect(err.status).toBe(403);
      expect(err).toBeInstanceOf(Error);
    });
  });

  describe('errorResponse', () => {
    it('should return JSON response with status from AuthError', async () => {
      const { AuthError, errorResponse } = await import('@/lib/api-auth');
      const err = new AuthError('Not Found', 404);
      const resp = errorResponse(err);
      expect(resp.status).toBe(404);
      const body = await resp.json();
      expect(body.error).toBe('Not Found');
    });

    it('should return 500 for unknown errors', async () => {
      const { errorResponse } = await import('@/lib/api-auth');
      const resp = errorResponse(new Error('Something broke'));
      expect(resp.status).toBe(500);
      const body = await resp.json();
      expect(body.error).toBe('Internal server error');
    });

    it('should return 500 for non-Error values', async () => {
      const { errorResponse } = await import('@/lib/api-auth');
      const resp = errorResponse('string error');
      expect(resp.status).toBe(500);
    });
  });
});
