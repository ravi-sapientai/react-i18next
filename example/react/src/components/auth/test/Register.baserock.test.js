import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Register from '../../../../src/components/auth/Register';
import AlertContext from '../../../../src/context/alert/alertContext';
import AuthContext from '../../../../src/context/auth/authContext';

// Mock functions
const mockSetAlert = jest.fn();
const mockRegister = jest.fn();
const mockClearErrors = jest.fn();
const mockHistoryPush = jest.fn();

// Mock contexts
const mockAlertContext = {
  setAlert: mockSetAlert
};

const mockAuthContext = {
  register: mockRegister,
  error: null,
  clearErrors: mockClearErrors,
  isAuthenticated: false
};

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

const renderWithContext = (component) => {
  return render(
    <AlertContext.Provider value={mockAlertContext}>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </AlertContext.Provider>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithContext(<Register />);
    expect(screen.getByText('טופס הרשמה')).toBeInTheDocument();
  });

  it('updates state on input change', () => {
    renderWithContext(<Register />);
    const nameInput = screen.getByLabelText('שם');
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    expect(nameInput.value).toBe('John Doe');
  });

  it('shows alert when form is submitted with empty fields', async () => {
    renderWithContext(<Register />);
    const submitButton = screen.getByText('הרשמה');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith('נא למלא את כל השדות', 'danger');
    });
  });

  it('shows alert when passwords do not match', async () => {
    renderWithContext(<Register />);
    
    fireEvent.change(screen.getByLabelText('שם'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('דוא"ל'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('סיסמה'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('אימות סיסמה'), { target: { value: 'password456' } });
    
    const submitButton = screen.getByText('הרשמה');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith('הסיסמאות אינן תואמות', 'danger');
    });
  });

  it('calls register function when form is submitted correctly', async () => {
    renderWithContext(<Register />);
    
    fireEvent.change(screen.getByLabelText('שם'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('דוא"ל'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('סיסמה'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('אימות סיסמה'), { target: { value: 'password123' } });
    
    const submitButton = screen.getByText('הרשמה');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
    });
  });

  it('redirects to home page when authenticated', async () => {
    mockAuthContext.isAuthenticated = true;
    renderWithContext(<Register />);

    await waitFor(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith('/');
    });
    mockAuthContext.isAuthenticated = false;
  });

  it('shows alert when user already exists', async () => {
    mockAuthContext.error = 'המשתמש כבר קיים.';
    renderWithContext(<Register />);

    await waitFor(() => {
      expect(mockSetAlert).toHaveBeenCalledWith('המשתמש כבר קיים.', 'danger');
      expect(mockClearErrors).toHaveBeenCalled();
    });
    mockAuthContext.error = null;
  });
});