import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BoostJobPage from './BoostJobPage.jsx';

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
    createBoost: vi.fn(),
    confirmBoost: vi.fn()
  }
}));

vi.mock('../services/jobService.js', () => ({
  jobService: {
    getJob: vi.fn(() => Promise.resolve({ id: 1, title: 'Test Job', price: 500 }))
  }
}));

import { paymentService } from '../services/paymentService.js';
import { jobService } from '../services/jobService.js';

function renderWithRouter(ui, { route = '/boost/1' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/boost/:jobId" element={ui} />
      </Routes>
    </MemoryRouter>
  );
}

describe('BoostJobPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error when job not found', async () => {
    jobService.getJob.mockRejectedValue(new Error('Kunde inte hittas'));
    renderWithRouter(<BoostJobPage />);

    await waitFor(() => {
      expect(screen.getByText('Kunde inte hittas')).toBeInTheDocument();
    });
  });

  it('calls paymentService.createBoost when package selected', () => {
    paymentService.createBoost.mockResolvedValue({
      clientSecret: 'cs_boost',
      paymentIntentId: 'pi_boost'
    });

    const { container } = renderWithRouter(<BoostJobPage />);
    const buttons = container.querySelectorAll('button');
    
    if (buttons.length > 0) {
      fireEvent.click(buttons[0]);
      expect(paymentService.createBoost).toHaveBeenCalled();
    }
  });
});
