import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

describe('Footer', () => {
  it('renders the copyright notice', () => {
    render(<Footer />);
    
    const year = new Date().getFullYear();
    const copyrightText = screen.getByText(`© ${year} Digital World. All rights reserved.`);
    
    expect(copyrightText).toBeInTheDocument();
  });

  it('contains links to other pages', () => {
    render(<Footer />);
    
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });
});
