import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Contacts from '../../../../src/components/contacts/Contacts';
import ContactContext from '../../../../src/context/contact/contactContext';

// Mock the dependencies
jest.mock('../../../../src/components/contacts/ContactItem', () => ({
  __esModule: true,
  default: () => <div data-testid="contact-item" />
}));

jest.mock('../../../../src/components/layout/Spinner', () => ({
  __esModule: true,
  default: () => <div data-testid="spinner" />
}));

jest.mock('react-transition-group', () => ({
  TransitionGroup: ({ children }) => <div data-testid="transition-group">{children}</div>,
  CSSTransition: ({ children }) => <div data-testid="css-transition">{children}</div>,
}));

const mockGetContacts = jest.fn();
const mockContextValue = {
  contacts: [],
  filtered: null,
  getContacts: mockGetContacts,
  loading: false,
};

const MockContactProvider = ({ contextValue, children }) => (
  <ContactContext.Provider value={contextValue}>
    {children}
  </ContactContext.Provider>
);

describe('Contacts Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render "נא להוסיף אנשי קשר" when contacts is empty and not loading', () => {
    render(
      <MockContactProvider contextValue={mockContextValue}>
        <Contacts />
      </MockContactProvider>
    );
    expect(screen.getByText('נא להוסיף אנשי קשר')).toBeInTheDocument();
  });

  it('should render Spinner when loading', () => {
    const loadingContextValue = { ...mockContextValue, loading: true };
    render(
      <MockContactProvider contextValue={loadingContextValue}>
        <Contacts />
      </MockContactProvider>
    );
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('should render contacts when available', async () => {
    const contacts = [
      { _id: '1', name: 'John Doe' },
      { _id: '2', name: 'Jane Doe' },
    ];
    const contextWithContacts = { ...mockContextValue, contacts };
    
    render(
      <MockContactProvider contextValue={contextWithContacts}>
        <Contacts />
      </MockContactProvider>
    );
    
    await waitFor(() => {
      expect(screen.getAllByTestId('contact-item')).toHaveLength(2);
    });
  });

  it('should render filtered contacts when available', async () => {
    const contacts = [
      { _id: '1', name: 'John Doe' },
      { _id: '2', name: 'Jane Doe' },
    ];
    const filtered = [{ _id: '1', name: 'John Doe' }];
    const contextWithFiltered = { ...mockContextValue, contacts, filtered };
    
    render(
      <MockContactProvider contextValue={contextWithFiltered}>
        <Contacts />
      </MockContactProvider>
    );
    
    await waitFor(() => {
      expect(screen.getAllByTestId('contact-item')).toHaveLength(1);
    });
  });

  it('should call getContacts on mount', () => {
    render(
      <MockContactProvider contextValue={mockContextValue}>
        <Contacts />
      </MockContactProvider>
    );
    expect(mockGetContacts).toHaveBeenCalledTimes(1);
  });

  it('should render TransitionGroup when contacts are available', async () => {
    const contacts = [{ _id: '1', name: 'John Doe' }];
    const contextWithContacts = { ...mockContextValue, contacts };
    
    render(
      <MockContactProvider contextValue={contextWithContacts}>
        <Contacts />
      </MockContactProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('transition-group')).toBeInTheDocument();
    });
  });

  it('should render CSSTransition for each contact', async () => {
    const contacts = [
      { _id: '1', name: 'John Doe' },
      { _id: '2', name: 'Jane Doe' },
    ];
    const contextWithContacts = { ...mockContextValue, contacts };
    
    render(
      <MockContactProvider contextValue={contextWithContacts}>
        <Contacts />
      </MockContactProvider>
    );
    
    await waitFor(() => {
      expect(screen.getAllByTestId('css-transition')).toHaveLength(2);
    });
  });
});