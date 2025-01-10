import { describe, it, expect, jest } from '@jest/globals';
import { createContext } from 'react';
import {
  getDefaults,
  setDefaults,
  getI18n,
  setI18n,
  initReactI18next,
  I18nContext,
  ReportNamespaces,
  composeInitialProps,
  getInitialProps
} from '../../src/context';

// Mock the imported modules
jest.mock('../../src/defaults.js', () => ({
  getDefaults: jest.fn(),
  setDefaults: jest.fn()
}));

jest.mock('../../src/i18nInstance.js', () => ({
  getI18n: jest.fn(),
  setI18n: jest.fn()
}));

jest.mock('../../src/initReactI18next.js', () => ({
  initReactI18next: jest.fn()
}));

describe('React i18next Context', () => {
  it('should export the correct functions and objects', () => {
    expect(getDefaults).toBeDefined();
    expect(setDefaults).toBeDefined();
    expect(getI18n).toBeDefined();
    expect(setI18n).toBeDefined();
    expect(initReactI18next).toBeDefined();
    expect(I18nContext).toBeDefined();
    expect(I18nContext).toEqual(expect.any(Object));
  });

  describe('ReportNamespaces', () => {
    it('should add and retrieve used namespaces', () => {
      const reporter = new ReportNamespaces();
      reporter.addUsedNamespaces(['ns1', 'ns2']);
      reporter.addUsedNamespaces(['ns2', 'ns3']);
      expect(reporter.getUsedNamespaces()).toEqual(['ns1', 'ns2', 'ns3']);
    });
  });

  describe('composeInitialProps', () => {
    it('should compose initial props correctly', async () => {
      const mockComponent = {
        getInitialProps: jest.fn().mockResolvedValue({ componentProp: 'value' })
      };
      const mockCtx = {};
      const mockI18nProps = { initialI18nStore: {}, initialLanguage: 'en' };

      jest.spyOn(global, 'getInitialProps').mockReturnValue(mockI18nProps);

      const result = await composeInitialProps(mockComponent)(mockCtx);

      expect(result).toEqual({
        componentProp: 'value',
        initialI18nStore: {},
        initialLanguage: 'en'
      });
      expect(mockComponent.getInitialProps).toHaveBeenCalledWith(mockCtx);
    });
  });

  describe('getInitialProps', () => {
    it('should return correct initial props', () => {
      const mockI18n = {
        reportNamespaces: {
          getUsedNamespaces: jest.fn().mockReturnValue(['ns1', 'ns2'])
        },
        languages: ['en', 'de'],
        language: 'en',
        getResourceBundle: jest.fn().mockReturnValue({ key: 'value' })
      };

      getI18n.mockReturnValue(mockI18n);

      const result = getInitialProps();

      expect(result).toEqual({
        initialI18nStore: {
          en: { ns1: { key: 'value' }, ns2: { key: 'value' } },
          de: { ns1: { key: 'value' }, ns2: { key: 'value' } }
        },
        initialLanguage: 'en'
      });
    });
  });
});