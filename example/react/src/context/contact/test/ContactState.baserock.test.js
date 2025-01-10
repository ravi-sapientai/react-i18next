import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { render, act } from '@testing-library/react';
import axios from 'axios';
import ContactState from '../../../../src/context/contact/ContactState';
import ContactContext from '../../../../src/context/contact/contactContext';
import {
  ADD_CONTACT,
  DELETE_CONTACT,
  SET_CURRENT,
  CLEAR_CURRENT,
  UPDATE_CONTACT,
  FILTER_CONTACTS,
  CLEAR_FILTER,
  CONTACT_ERROR,
  GET_CONTACTS,
  CLEAR_CONTACTS,
} from '../../../../src/types';

// Mock axios
jest.mock('axios');

// Mock useReducer
const mockDispatch = jest.fn();
jest.mock('react', () => ({
  ...Object.getOwnPropertyNames(React).reduce((acc, key) => {
    acc[key] = key === 'useReducer' ? () => [{}, mockDispatch] : jest.fn();
    return acc;
  }, {}),
  createElement: React.createElement,
}));

const renderHook = (callback, options) => {
  let result;
  function TestComponent() {
    result = callback();
    return null;
  }
  render(<TestComponent />, options);
  return { result };
};

describe('ContactState', () => {
  let wrapper;
  
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = ({ children }) => (
      <ContactState>{children}</ContactState>
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should add a contact successfully', async () => {
    const mockContact = { name: 'John Doe', email: 'john@example.com' };
    const mockResponse = { data: { ...mockContact, _id: '123' } };
    axios.post.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => React.useContext(ContactContext), { wrapper });

    await act(async () => {
      await result.addContact(mockContact);
    });

    expect(axios.post).toHaveBeenCalledWith('/api/contacts', mockContact, expect.any(Object));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: ADD_CONTACT,
      payload: mockResponse.data
    });
  });

  it('should handle add contact error', async () => {
    const mockContact = { name: 'John Doe', email: 'john@example.com' };
    const mockError = { response: { msg: 'Failed to add contact' } };
    axios.post.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => React.useContext(ContactContext), { wrapper });

    await act(async () => {
      await result.addContact(mockContact);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: CONTACT_ERROR,
      payload: mockError.response.msg
    });
  });

  it('should get contacts successfully', async () => {
    const mockContacts = [{ _id: '1', name: 'John Doe' }, { _id: '2', name: 'Jane Doe' }];
    axios.get.mockResolvedValueOnce({ data: mockContacts });

    const { result } = renderHook(() => React.useContext(ContactContext), { wrapper });

    await act(async () => {
      await result.getContacts();
    });

    expect(axios.get).toHaveBeenCalledWith('/api/contacts');
    expect(mockDispatch).toHaveBeenCalledWith({
      type: GET_CONTACTS,
      payload: mockContacts
    });
  });

  it('should handle get contacts error', async () => {
    const mockError = { response: { msg: 'Failed to get contacts' } };
    axios.get.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => React.useContext(ContactContext), { wrapper });

    await act(async () => {
      await result.getContacts();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: CONTACT_ERROR,
      payload: mockError.response.msg
    });
  });

  it('should delete a contact successfully', async () => {
    const contactId = '123';
    axios.delete.mockResolvedValueOnce({});

    const { result } = renderHook(() => React.useContext(ContactContext), { wrapper });

    await act(async () => {
      await result.deleteContact(contactId);
    });

    expect(axios.delete).toHaveBeenCalledWith(`/api/contacts/${contactId}`);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: DELETE_CONTACT,
      payload: contactId
    });
  });

  it('should handle delete contact error', async () => {
    const contactId = '123';
    const mockError = { response: { msg: 'Failed to delete contact' } };
    axios.delete.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => React.useContext(ContactContext), { wrapper });

    await act(async () => {
      await result.deleteContact(contactId);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: CONTACT_ERROR,
      payload: mockError.response.msg
    });
  });

  it('should update a contact successfully', async () => {
    const mockContact = { _id: '123', name: 'Updated John Doe', email: 'john@example.com' };
    axios.put.mockResolvedValueOnce({ data: mockContact });

    const { result } = renderHook(() => React.useContext(ContactContext), { wrapper });

    await act(async () => {
      await result.updateContact(mockContact);
    });

    expect(axios.put).toHaveBeenCalledWith(`/api/contacts/${mockContact._id}`, mockContact, expect.any(Object));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: UPDATE_CONTACT,
      payload: mockContact
    });
  });

  it('should handle update contact error', async () => {
    const mockContact = { _id: '123', name: 'Updated John Doe', email: 'john@example.com' };
    const mockError = { response: { msg: 'Failed to update contact' } };
    axios.put.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => React.useContext(ContactContext), { wrapper });

    await act(async () => {
      await result.updateContact(mockContact);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: CONTACT_ERROR,
      payload: mockError.response.msg
    });
  });

  it('should clear contacts', () => {
    const { result } = renderHook(() => React.useContext(ContactContext), { wrapper });

    act(() => {
      result.clearContacts();
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: CLEAR_CONTACTS });
  });

  it('should set current contact', () => {
    const mockContact = { _id: '123', name: 'John Doe', email: 'john@example.com' };
    const { result } = renderHook(() => React.useContext(ContactContext), { wrapper });

    act(() => {
      result.setCurrent(mockContact);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: SET_CURRENT,
      payload: mockContact
    });
  });

  it('should clear current contact', () => {
    const { result } = renderHook(() => React.useContext(ContactContext), { wrapper });

    act(() => {
      result.clearCurrent();
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: CLEAR_CURRENT });
  });

  it('should filter contacts', () => {
    const filterText = 'John';
    const { result } = renderHook(() => React.useContext(ContactContext), { wrapper });

    act(() => {
      result.filterContacts(filterText);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: FILTER_CONTACTS,
      payload: filterText
    });
  });

  it('should clear filter', () => {
    const { result } = renderHook(() => React.useContext(ContactContext), { wrapper });

    act(() => {
      result.clearFilter();
    });

    expect(mockDispatch).toHaveBeenCalledWith({ type: CLEAR_FILTER });
  });
});