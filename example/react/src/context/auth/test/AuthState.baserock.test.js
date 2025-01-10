import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { render, act } from '@testing-library/react';
import AuthState from '../../../../src/context/auth/AuthState';
import AuthContext from '../../../../src/context/auth/authContext';
import * as types from '../../../../src/context/types';

// Mock dependencies
jest.mock('axios', () => ({
  default: {
    get: () => Promise.resolve({ data: {} }),
    post: () => Promise.resolve({ data: {} })
  }
}));

jest.mock('../../../../src/utils/setAuthToken', () => () => {});

const renderHook = (callback, options) => {
  let result;
  function TestComponent() {
    result = callback();
    return null;
  }
  render(<TestComponent />, options);
  return { result };
};

describe('AuthState Component', () => {
  let wrapper;
  let mockDispatch;
  let mockAxios;

  beforeEach(() => {
    jest.clearAllMocks();
    
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    mockDispatch = jest.fn();
    jest.spyOn(React, 'useReducer').mockImplementation(() => [{
      token: null,
      isAuthenticated: null,
      loading: true,
      user: null,
      error: null,
    }, mockDispatch]);

    wrapper = ({ children }) => (
      <AuthState>{children}</AuthState>
    );

    mockAxios = require('axios').default;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('initializes with correct initial state', () => {
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });
    
    expect(result).toEqual(expect.objectContaining({
      token: null,
      isAuthenticated: null,
      loading: true,
      user: null,
      error: null,
    }));
  });

  it('loads user successfully', async () => {
    const mockUser = { id: '1', name: 'Test User' };
    mockAxios.get.mockResolvedValueOnce({ data: mockUser });

    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

    await act(async () => {
      await result.loadUser();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: types.USER_LOADED,
      payload: mockUser,
    });
  });

  it('handles load user error', async () => {
    mockAxios.get.mockRejectedValueOnce(new Error('Failed to load user'));

    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

    await act(async () => {
      await result.loadUser();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: types.AUTH_ERROR,
    });
  });

  it('registers user successfully', async () => {
    const mockResponse = { data: { token: 'test-token' } };
    mockAxios.post.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

    await act(async () => {
      await result.register({ name: 'Test User', email: 'test@test.com', password: 'password123' });
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: types.REGISTER_SUCCESS,
      payload: mockResponse.data,
    });
  });

  it('handles register error', async () => {
    const errorMsg = 'Registration failed';
    mockAxios.post.mockRejectedValueOnce({ response: { data: { msg: errorMsg } } });

    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

    await act(async () => {
      await result.register({ name: 'Test User', email: 'test@test.com', password: 'password123' });
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: types.REGISTER_FAIL,
      payload: errorMsg,
    });
  });

  it('logs in user successfully', async () => {
    const mockResponse = { data: { token: 'test-token' } };
    mockAxios.post.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

    await act(async () => {
      await result.login({ email: 'test@test.com', password: 'password123' });
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: types.LOGIN_SUCCESS,
      payload: mockResponse.data,
    });
  });

  it('handles login error', async () => {
    const errorMsg = 'Login failed';
    mockAxios.post.mockRejectedValueOnce({ response: { data: { msg: errorMsg } } });

    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

    await act(async () => {
      await result.login({ email: 'test@test.com', password: 'password123' });
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: types.LOGIN_FAIL,
      payload: errorMsg,
    });
  });

  it('logs out user', () => {
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

    act(() => {
      result.logout();
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: types.LOGOUT });
  });

  it('clears errors', () => {
    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

    act(() => {
      result.clearErrors();
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: types.CLEAR_ERRORS });
  });

  // Additional test to increase coverage
  it('sets auth token when available in localStorage', async () => {
    const mockToken = 'test-token';
    global.localStorage.getItem.mockReturnValueOnce(mockToken);
    const setAuthToken = require('../../../../src/utils/setAuthToken');

    const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

    await act(async () => {
      await result.loadUser();
    });

    expect(setAuthToken).toHaveBeenCalledWith(mockToken);
  });
});