import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PaymentSuccessPage from './PaymentSuccessPage.jsx';

function renderWithState(state = {}) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/payment/success', state }]}>
      <Routes>
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PaymentSuccessPage', () => {
  it('renders success message', () => {
    renderWithState({ success: true });
    expect(screen.getByText('Betalning genomförd!')).toBeInTheDocument();
  });

  it('shows amount breakdown when amount is provided', () => {
    renderWithState({ success: true, amount: 500 });
    expect(screen.getByText('Betalt belopp:')).toBeInTheDocument();
    expect(screen.getByText('Plattformsavgift:')).toBeInTheDocument();
    expect(screen.getByText('Utföraren får:')).toBeInTheDocument();
  });

  it('shows "Visa jobbdetaljer" link when jobId is provided', () => {
    renderWithState({ success: true, jobId: 1 });
    expect(screen.getByText('Visa jobbdetaljer')).toBeInTheDocument();
    expect(screen.getByText('Hitta fler jobb')).toBeInTheDocument();
  });

  it('shows "Mina jobb" link when jobId is not provided', () => {
    renderWithState({ success: true });
    expect(screen.getByText('Mina jobb')).toBeInTheDocument();
    expect(screen.getByText('Hitta fler jobb')).toBeInTheDocument();
  });

  it('shows next steps info', () => {
    renderWithState({ success: true });
    expect(screen.getByText('Nästa steg:')).toBeInTheDocument();
    expect(screen.getByText('Kontakta utföraren via chatten för att koordinera detaljer')).toBeInTheDocument();
  });

  it('handles URL params when accessed without state', () => {
    window.history.pushState({}, '', '/payment/success?payment_intent=pi_123');
    renderWithState({});
    expect(screen.getByText('Betalning genomförd!')).toBeInTheDocument();
  });
});
