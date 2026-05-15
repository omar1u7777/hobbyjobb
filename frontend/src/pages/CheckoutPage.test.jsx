import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CheckoutPage from './CheckoutPage.jsx';

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({}))
}));

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }) => <div data-testid="stripe-elements">{children}</div>,
  PaymentElement: () => <div data-testid="payment-element">PaymentElement</div>,
  useStripe: () => ({ confirmPayment: vi.fn(() => Promise.resolve({ error: null })) }),
  useElements: () => ({ submit: vi.fn(() => Promise.resolve({ error: null })) })
}));

vi.mock('../services/paymentService.js', () => ({
  paymentService: {
    createCheckout: vi.fn(),
    confirmPayment: vi.fn()
  }
}));

vi.mock('../services/jobService.js', () => ({
  jobService: {
    getJob: vi.fn(() => Promise.resolve({ id: 1, title: 'Test Job', price: 500, description: 'Test' }))
  }
}));

import { paymentService } from '../services/paymentService.js';
import { jobService } from '../services/jobService.js';

function renderWithRouter(ui, { route = '/checkout/1' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/checkout/:jobId" element={ui} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    jobService.getJob.mockImplementation(() => new Promise(() => {}));
    renderWithRouter(<CheckoutPage />);

    expect(screen.getByText('Förbereder betalning...')).toBeInTheDocument();
  });

  it('renders checkout form when data loaded', async () => {
    jobService.getJob.mockResolvedValue({ id: 1, title: 'Test Job', price: 500, description: 'Test' });
    paymentService.createCheckout.mockResolvedValue({
      clientSecret: 'cs_test_123',
      paymentIntentId: 'pi_123',
      amount: 500,
      platformFee: 40,
      recipientAmount: 460
    });

    renderWithRouter(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText('Betala för jobb')).toBeInTheDocument();
      expect(screen.getByText('Test Job')).toBeInTheDocument();
    });
  });

  it('calls createCheckout with correct params', async () => {
    jobService.getJob.mockResolvedValue({ id: 1, title: 'Test Job', price: 500, description: 'Test' });
    paymentService.createCheckout.mockResolvedValue({
      clientSecret: 'cs_test',
      paymentIntentId: 'pi_123',
      amount: 500,
      platformFee: 40,
      recipientAmount: 460
    });

    renderWithRouter(<CheckoutPage />);

    await waitFor(() => {
      expect(paymentService.createCheckout).toHaveBeenCalledWith(1, 500);
    });
  });

  it('shows error when job fetch fails', async () => {
    jobService.getJob.mockRejectedValue(new Error('Jobbet kunde inte hittas'));

    renderWithRouter(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText('Jobbet kunde inte hittas')).toBeInTheDocument();
    });
  });

  it('shows error when job data is null', async () => {
    jobService.getJob.mockResolvedValue(null);

    renderWithRouter(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText('Jobbet kunde inte hittas')).toBeInTheDocument();
    });
  });

  it('shows error when createCheckout fails', async () => {
    jobService.getJob.mockResolvedValue({ id: 1, title: 'Test Job', price: 500, description: 'Test' });
    paymentService.createCheckout.mockRejectedValue(new Error('Kunde inte skapa checkout'));

    renderWithRouter(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText('Kunde inte skapa checkout')).toBeInTheDocument();
    });
  });
});
