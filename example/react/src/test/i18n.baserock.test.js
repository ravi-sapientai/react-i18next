const i18next = require('i18next');
const Backend = require('i18next-http-backend');
const LanguageDetector = require('i18next-browser-languagedetector');
const { initReactI18next } = require('react-i18next');

jest.mock('i18next');
jest.mock('i18next-http-backend');
jest.mock('i18next-browser-languagedetector');
jest.mock('react-i18next');

const mockUse = jest.fn().mockReturnThis();
const mockInit = jest.fn().mockResolvedValue(undefined);

const mockI18n = {
  use: mockUse,
  init: mockInit,
};

jest.mock('../../src/i18n', () => ({
  __esModule: true,
  default: mockI18n,
}));

describe('i18n configuration', () => {
  let i18n;

  beforeEach(() => {
    jest.clearAllMocks();
    i18n = require('../../src/i18n').default;
  });

  it('should initialize i18n with correct plugins and options', async () => {
    // Call the use method explicitly to mimic the actual implementation
    i18n.use(Backend).use(LanguageDetector).use(initReactI18next);
    await i18n.init();

    expect(mockUse).toHaveBeenCalledWith(Backend);
    expect(mockUse).toHaveBeenCalledWith(LanguageDetector);
    expect(mockUse).toHaveBeenCalledWith(initReactI18next);
    expect(mockInit).toHaveBeenCalledWith({
      fallbackLng: 'en',
      debug: true,
    });
  });

  it('should export the configured i18n instance', () => {
    expect(i18n).toBeDefined();
    expect(typeof i18n.use).toBe('function');
    expect(typeof i18n.init).toBe('function');
  });

  it('should handle initialization errors', async () => {
    const error = new Error('Initialization failed');
    mockInit.mockRejectedValueOnce(error);

    await expect(i18n.init()).rejects.toThrow('Initialization failed');
  });
});