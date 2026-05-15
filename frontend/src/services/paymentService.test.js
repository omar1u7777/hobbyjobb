import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentService } from './paymentService.js';

// Mock the api module
vi.mock('./api.js', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  }
}));

import api from './api.js';

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCheckout', () => {
    it('should call POST /payments/checkout with jobId and amount', async () => {
      const mockResponse = {
        data: {
          data: {
            clientSecret: 'cs_test_123',
            paymentIntentId: 'pi_123',
            amount: 500,
          },
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await paymentService.createCheckout(1, 500);

      expect(api.post).toHaveBeenCalledWith('/payments/checkout', { jobId: 1, amount: 500 });
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should throw on API error', async () => {
      api.post.mockRejectedValue(new Error('Network error'));

      await expect(paymentService.createCheckout(1, 500)).rejects.toThrow('Network error');
    });
  });

  describe('confirmPayment', () => {
    it('should call POST /payments/confirm with paymentIntentId', async () => {
      const mockResponse = {
        data: {
          data: { status: 'held', paymentId: 1 },
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await paymentService.confirmPayment('pi_123');

      expect(api.post).toHaveBeenCalledWith('/payments/confirm', { paymentIntentId: 'pi_123' });
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('releaseEscrow', () => {
    it('should call POST /payments/release/:jobId', async () => {
      const mockResponse = {
        data: {
          data: { paymentId: 1, status: 'released' },
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await paymentService.releaseEscrow(1);

      expect(api.post).toHaveBeenCalledWith('/payments/release/1');
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('getHistory', () => {
    it('should call GET /payments/history and return payments array', async () => {
      const mockResponse = {
        data: {
          data: { payments: [{ id: 1, amount_total: 500, status: 'held' }] },
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await paymentService.getHistory();

      expect(api.get).toHaveBeenCalledWith('/payments/history');
      expect(result).toEqual([{ id: 1, amount_total: 500, status: 'held' }]);
    });

    it('should return empty array when no payments', async () => {
      const mockResponse = { data: { data: {} } };
      api.get.mockResolvedValue(mockResponse);

      const result = await paymentService.getHistory();

      expect(result).toEqual([]);
    });
  });

  describe('createBoost', () => {
    it('should call POST /payments/boost with package', async () => {
      const mockResponse = {
        data: {
          data: {
            clientSecret: 'cs_test_boost',
            paymentIntentId: 'pi_boost',
            amount: 29,
            package: 'standard',
          },
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await paymentService.createBoost(1, 'standard');

      expect(api.post).toHaveBeenCalledWith('/payments/boost', { jobId: 1, package: 'standard' });
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('confirmBoost', () => {
    it('should call POST /payments/boost/confirm', async () => {
      const mockResponse = {
        data: {
          data: { jobId: 1, is_boosted: true },
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await paymentService.confirmBoost('pi_boost');

      expect(api.post).toHaveBeenCalledWith('/payments/boost/confirm', { paymentIntentId: 'pi_boost' });
      expect(result).toEqual(mockResponse.data.data);
    });
  });
});
