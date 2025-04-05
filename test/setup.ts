import { vi } from 'vitest';
import { beforeEach } from 'vitest';

const mockSetTimeout = vi.fn();
const mockClearTimeout = vi.fn();

global.setTimeout = mockSetTimeout as unknown as typeof global.setTimeout;
global.clearTimeout = mockClearTimeout as unknown as typeof global.clearTimeout;

beforeEach(() => {
  vi.resetAllMocks();
});