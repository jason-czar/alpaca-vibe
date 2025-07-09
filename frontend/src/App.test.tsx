import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders login/signup modal by default', () => {
    render(<App />);
    expect(screen.getByRole('dialog', { name: /authentication modal/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });

  it('shows bot builder and chat after login', async () => {
    render(<App />);
    // Fill in login form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'testpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    // Wait for bot builder and chat panels
    expect(await screen.findByLabelText(/bot builder panel/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/vibe coding chat panel/i)).toBeInTheDocument();
  });
}); 