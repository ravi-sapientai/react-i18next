import { describe, it, expect, jest } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route } from 'react-router-dom';
import PrivateRoute from '../../../../src/components/routing/PrivateRoute';
import AuthContext from '../../../../src/context/auth/authContext';

// Mock the AuthContext
const mockAuthContext = {
  isAuthenticated: false,
  loading: false,
};

// Mock component to render when authenticated
const MockComponent = () => <div>Protected Component</div>;

// Helper function to render PrivateRoute with custom auth state
const renderPrivateRoute = (authState) => {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <AuthContext.Provider value={authState}>
        <PrivateRoute path="/protected" component={MockComponent} />
        <Route path="/login">
          <div>Login Page</div>
        </Route>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('PrivateRoute', () => {
  it('redirects to login when not authenticated and not loading', () => {
    renderPrivateRoute(mockAuthContext);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Component')).not.toBeInTheDocument();
  });

  it('renders the component when authenticated', () => {
    const authState = { ...mockAuthContext, isAuthenticated: true };
    renderPrivateRoute(authState);
    expect(screen.getByText('Protected Component')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('renders the component when loading, regardless of authentication state', () => {
    const authState = { ...mockAuthContext, loading: true };
    renderPrivateRoute(authState);
    expect(screen.getByText('Protected Component')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('renders the component when authenticated and loading', () => {
    const authState = { isAuthenticated: true, loading: true };
    renderPrivateRoute(authState);
    expect(screen.getByText('Protected Component')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('handles edge case: falsy non-boolean values for isAuthenticated and loading', () => {
    const authState = { isAuthenticated: null, loading: undefined };
    renderPrivateRoute(authState);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Component')).not.toBeInTheDocument();
  });
});