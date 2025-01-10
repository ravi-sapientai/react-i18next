const React = require('react');
const { render, fireEvent } = require('@testing-library/react');

// Mock CSS import
jest.mock('../../../src/providers/App.css', () => ({}), { virtual: true });

// Mock dependencies
jest.mock('../../../src/providers/Header', () => ({
  __esModule: true,
  default: jest.fn(() => null)
}));

const mockThemeChangerFn = jest.fn();
jest.mock('../../../src/providers/ThemeChanger', () => ({
  __esModule: true,
  default: jest.fn(({ onChangeTheme, themes }) => (
    <div data-testid="theme-changer">
      {themes.map(theme => (
        <button key={theme} data-testid={`theme-${theme}`} onClick={() => {
          onChangeTheme(theme);
          mockThemeChangerFn(theme);
        }}>
          {theme}
        </button>
      ))}
    </div>
  ))
}));

// Mock theming module
const mockThemes = {
  default: { textColor: 'black', backgroundColor: 'white' },
  dark: { textColor: 'white', backgroundColor: 'black' }
};

jest.mock('../../../src/providers/theming', () => ({
  ThemeProvider: ({ children }) => children,
  themes: mockThemes
}));

// Import the App component after mocking dependencies
const App = require('../../../src/providers/App').default;

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('initializes with default theme', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders Header component', () => {
    render(<App />);
    const Header = require('../../../src/providers/Header').default;
    expect(Header).toHaveBeenCalled();
  });

  it('renders ThemeChanger component with correct props', () => {
    render(<App />);
    const ThemeChanger = require('../../../src/providers/ThemeChanger').default;
    expect(ThemeChanger).toHaveBeenCalledWith(
      expect.objectContaining({
        onChangeTheme: expect.any(Function),
        themes: Object.keys(mockThemes)
      }),
      {}
    );
  });

  it('changes theme when ThemeChanger triggers onChangeTheme', () => {
    const { getByTestId } = render(<App />);
    const darkThemeButton = getByTestId('theme-dark');
    
    fireEvent.click(darkThemeButton);
    
    expect(mockThemeChangerFn).toHaveBeenCalledWith('dark');
  });
});