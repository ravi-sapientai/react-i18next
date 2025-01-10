import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the dependencies
jest.mock('../../contacts/Contacts', () => ({
  __esModule: true,
  default: () => 'Contacts Component'
}));

jest.mock('../../contacts/ContactForm', () => ({
  __esModule: true,
  default: () => 'Contact Form Component'
}));

jest.mock('../../contacts/ContactFilter', () => ({
  __esModule: true,
  default: () => 'Contact Filter Component'
}));

const mockLoadUser = jest.fn();
const mockAuthContext = {
  loadUser: mockLoadUser
};

jest.mock('../../../context/auth/authContext', () => ({
  __esModule: true,
  default: {
    Consumer: ({ children }) => children(mockAuthContext),
  }
}));

// Import the Home component after mocking its dependencies
import Home from '../Home';

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    render(<Home />);
    expect(screen.getByText('Contacts Component')).toBeInTheDocument();
    expect(screen.getByText('Contact Form Component')).toBeInTheDocument();
    expect(screen.getByText('Contact Filter Component')).toBeInTheDocument();
  });

  it('calls loadUser on mount', () => {
    render(<Home />);
    expect(mockLoadUser).toHaveBeenCalledTimes(1);
  });

  it('renders the correct layout', () => {
    const { container } = render(<Home />);
    const gridContainer = container.firstChild;
    expect(gridContainer).toHaveClass('grid-2');
    expect(gridContainer.children).toHaveLength(2);
  });

  it('renders ContactForm in the first column', () => {
    const { container } = render(<Home />);
    const columns = container.firstChild.children;
    expect(columns[0]).toContainHTML('Contact Form Component');
  });

  it('renders ContactFilter and Contacts in the second column', () => {
    const { container } = render(<Home />);
    const columns = container.firstChild.children;
    expect(columns[1]).toContainHTML('Contact Filter Component');
    expect(columns[1]).toContainHTML('Contacts Component');
  });

  it('does not call loadUser on re-render', () => {
    const { rerender } = render(<Home />);
    expect(mockLoadUser).toHaveBeenCalledTimes(1);
    
    rerender(<Home />);
    expect(mockLoadUser).toHaveBeenCalledTimes(1);
  });
});