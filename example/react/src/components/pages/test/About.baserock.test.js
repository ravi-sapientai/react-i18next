import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import About from '../../../../src/components/pages/About';

describe('About Component', () => {
  it('renders the heading correctly', () => {
    render(<About />);
    const headingElement = screen.getByRole('heading', { level: 1 });
    expect(headingElement.textContent).toBe('אודות:');
  });

  it('renders the description paragraph', () => {
    render(<About />);
    const descriptionElement = screen.getByText(/אפליקציית Full stack לניהול אנשי קשר/i);
    expect(descriptionElement).toBeTruthy();
  });

  it('contains a link to the author\'s GitHub profile', () => {
    render(<About />);
    const linkElement = screen.getByText('אורי ברעם');
    expect(linkElement.getAttribute('href')).toBe('https://github.com/obrm');
    expect(linkElement.getAttribute('target')).toBe('_blank');
    expect(linkElement.getAttribute('rel')).toBe('noreferrer');
  });

  it('displays the correct version number', () => {
    render(<About />);
    const versionElement = screen.getByText(/גרסה/i);
    expect(versionElement.textContent).toMatch(/גרסה.*1\.0\.0/);
  });

  it('applies the correct CSS classes', () => {
    render(<About />);
    const descriptionParagraph = screen.getByText(/אפליקציית Full stack לניהול אנשי קשר/i);
    const versionParagraph = screen.getByText(/גרסה/i);
    
    expect(descriptionParagraph.className).toContain('my-1');
    expect(versionParagraph.className).toContain('bg-dark');
    expect(versionParagraph.className).toContain('p');
  });
});