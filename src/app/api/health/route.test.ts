import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/prisma', () => ({
  prisma: { $queryRaw: vi.fn() },
}));

import { prisma } from '@/lib/prisma';

describe('GET /api/health', () => {
  it('returns 200 and ok status when the DB responds', async () => {
    (prisma.$queryRaw as ReturnType<typeof vi.fn>).mockResolvedValueOnce([{ '?column?': 1 }]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.db).toBe('ok');
    expect(typeof body.timestamp).toBe('string');
  });

  it('returns 503 when the DB query throws', async () => {
    (prisma.$queryRaw as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('connection refused'));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe('error');
    expect(body.db).toBe('error');
  });
});
