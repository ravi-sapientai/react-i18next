const React = require('react');
const ReactDOM = require('react-dom/client');

// Mock createRoot and its render method
const mockRender = jest.fn();
const mockCreateRoot = jest.fn(() => ({
  render: mockRender
}));

// Mock react-dom/client module
jest.mock('react-dom/client', () => ({
  createRoot: () => ({
    render: mockRender
  })
}));

// Mock App component
jest.mock('../App', () => jest.fn(() => null));

// Mock CSS import
jest.mock('../index.css', () => ({}));

// Mock i18n import
jest.mock('../i18n', () => ({}));

describe('Application Entry Point', () => {
  let consoleErrorSpy;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should create root and render App component', () => {
    jest.isolateModules(() => {
      require('../../src/index');
    });

    const rootElement = document.getElementById('root');
    expect(rootElement).not.toBeNull();
    expect(mockRender).toHaveBeenCalled();
  });

  it('should render App component within StrictMode', () => {
    const mockCreateElement = jest.spyOn(React, 'createElement');

    jest.isolateModules(() => {
      require('../../src/index');
    });

    expect(mockCreateElement).toHaveBeenCalledWith(
      React.StrictMode,
      {},
      expect.any(Object)
    );
    expect(mockCreateElement).toHaveBeenCalledWith(require('../App'), {});
  });

  it('should handle missing root element gracefully', () => {
    document.body.innerHTML = '';

    jest.isolateModules(() => {
      require('../../src/index');
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Cannot find element with id 'root'")
    );
  });

  it('should import necessary dependencies', () => {
    jest.isolateModules(() => {
      const indexModule = jest.requireActual('../../src/index');
      expect(indexModule).toBeDefined();
    });
  });
});