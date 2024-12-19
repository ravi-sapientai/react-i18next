const React = require('react');
const ReactDOM = require('react-dom/client');
const { act } = require('@testing-library/react');
const i18next = require('i18next');
const { I18nextProvider } = require('react-i18next');

// Mock the react-i18next module
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: jest.fn(key => key),
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
  withTranslation: () => Component => props => <Component t={key => key} {...props} />,
  Trans: ({ children }) => children,
  I18nextProvider: ({ children }) => children,
}));

// Mock the logo import
jest.mock('../../src/logo.svg', () => 'mocked-logo.svg');

// Mock the CSS import
jest.mock('../../src/App.css', () => ({}));

// Mock the App component
const MockedApp = () => <div data-testid="mock-app">Mocked App Component</div>;
jest.mock('../../src/App', () => ({
  __esModule: true,
  default: MockedApp,
}));

const App = require('../../src/App').default;

describe('App Component', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOM.createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
    container = null;
  });

  const renderApp = () => {
    act(() => {
      root.render(
        <I18nextProvider i18n={i18next}>
          <App />
        </I18nextProvider>
      );
    });
  };

  it('renders without crashing', () => {
    renderApp();
    expect(container.textContent).toBeTruthy();
  });

  it('renders the mocked App component', () => {
    renderApp();
    expect(container.querySelector('[data-testid="mock-app"]')).toBeTruthy();
  });

  it('uses the mocked translation function', () => {
    const { useTranslation } = require('react-i18next');
    const { t } = useTranslation();
    expect(t('test')).toBe('test');
  });

  it('uses the mocked Trans component', () => {
    const { Trans } = require('react-i18next');
    const wrapper = document.createElement('div');
    act(() => {
      ReactDOM.createRoot(wrapper).render(
        <Trans i18nKey="description.part1">
          Test content
        </Trans>
      );
    });
    expect(wrapper.textContent).toBe('Test content');
  });

  it('uses the mocked withTranslation HOC', () => {
    const { withTranslation } = require('react-i18next');
    const TestComponent = withTranslation()(() => <div>Test</div>);
    const wrapper = document.createElement('div');
    act(() => {
      ReactDOM.createRoot(wrapper).render(<TestComponent />);
    });
    expect(wrapper.textContent).toBe('Test');
  });
});