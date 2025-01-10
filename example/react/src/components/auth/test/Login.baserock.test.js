import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../../../../src/components/auth/Login';

// Mock the contexts
const mockSetAlert = jest.fn();
const mockLogin = jest.fn();
const mockClearErrors = jest.fn();

jest.mock('../../../context/alert/alertContext', () => ({
  __esModule: true,
  default: {
    Consumer: ({ children }) => children({ setAlert: mockSetAlert }),
    Provider: ({ children }) => children,
  },
}));

jest.mock('../../../context/auth/authContext', () => ({
  __esModule: true,
  default: {
    Consumer: ({ children }) => children({
      login: mockLogin,
      clearErrors: mockClearErrors,
      error: null,
      isAuthenticated: false,
    }),
    Provider: ({ children }) => children,
  },
}));

describe('Login Component', () => {
  const mockHistoryPush = jest.fn();
  const mockProps = {
    history: {
      push: mockHistoryPush,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(<Login {...mockProps} />);
    expect(screen.getByText('כניסה לחשבון')).toBeInTheDocument();
    expect(screen.getByLabelText('דוא"ל')).toBeInTheDocument();
    expect(screen.getByLabelText('סיסמה')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'כניסה' })).toBeInTheDocument();
  });

  test('updates state on input change', () => {
    render(<Login {...mockProps} />);
    const emailInput = screen.getByLabelText('דוא"ל');
    const passwordInput = screen.getByLabelText('סיסמה');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('calls setAlert when form is submitted with empty fields', async () => {
    render(<Login {...mockProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'כניסה' }));

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith('נא למלא את כל השדות', 'danger');
    });
  });

  test('calls login when form is submitted with valid data', async () => {
    render(<Login {...mockProps} />);
    
    fireEvent.change(screen.getByLabelText('דוא"ל'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('סיסמה'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'כניסה' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  test('redirects when authenticated', async () => {
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      isAuthenticated: true,
      login: mockLogin,
      clearErrors: mockClearErrors,
      error: null,
    }));

    render(<Login {...mockProps} />);

    await waitFor(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith('/');
    });
  });

  test('shows alert when there is an error', async () => {
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      isAuthenticated: false,
      login: mockLogin,
      clearErrors: mockClearErrors,
      error: 'הפרטים שהוזנו אינם תקינים.',
    }));

    render(<Login {...mockProps} />);

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith('הפרטים שהוזנו אינם תקינים.', 'danger');
      expect(mockClearErrors).toHaveBeenCalled();
    });
  });
});