import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import App from '../../src/App';

// Mock the components and contexts
jest.mock('../../src/components/layout/Navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('../../src/components/layout/Alerts', () => () => <div data-testid="alerts">Alerts</div>);
jest.mock('../../src/components/pages/Home', () => () => <div data-testid="home">Home</div>);
jest.mock('../../src/components/pages/About', () => () => <div data-testid="about">About</div>);
jest.mock('../../src/components/auth/Register', () => () => <div data-testid="register">Register</div>);
jest.mock('../../src/components/auth/Login', () => () => <div data-testid="login">Login</div>);
jest.mock('../../src/components/routing/PrivateRoute', () => ({ children }) => children);
jest.mock('../../src/context/contact/ContactState', () => ({ children }) => <div data-testid="contact-state">{children}</div>);
jest.mock('../../src/context/auth/AuthState', () => ({ children }) => <div data-testid="auth-state">{children}</div>);
jest.mock('../../src/context/alert/AlertState', () => ({ children }) => <div data-testid="alert-state">{children}</div>);
jest.mock('../../src/utils/setAuthToken');

describe('App Component', () => {
  let originalLocalStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    originalLocalStorage = global.localStorage;
    global.localStorage = {
      getItem: jest.fn(),
    };
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
  });

  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('auth-state')).toBeInTheDocument();
    expect(screen.getByTestId('contact-state')).toBeInTheDocument();
    expect(screen.getByTestId('alert-state')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('alerts')).toBeInTheDocument();
  });

  it('renders Home component for root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('home')).toBeInTheDocument();
  });

  it('renders About component for /about path', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('about')).toBeInTheDocument();
  });

  it('renders Register component for /register path', () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('register')).toBeInTheDocument();
  });

  it('renders Login component for /login path', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('login')).toBeInTheDocument();
  });

  it('calls setAuthToken if localStorage.token exists', () => {
    const setAuthToken = require('../../src/utils/setAuthToken');
    const token = 'test-token';
    global.localStorage.getItem.mockReturnValue(token);

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(setAuthToken).toHaveBeenCalledWith(token);
  });

  it('does not call setAuthToken if localStorage.token does not exist', () => {
    const setAuthToken = require('../../src/utils/setAuthToken');
    global.localStorage.getItem.mockReturnValue(null);

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(setAuthToken).not.toHaveBeenCalled();
  });
});