import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../components/Button';

describe('Button', () => {
  const defaultProps = {
    children: 'Click me',
  };

  it('renders correctly with default props', () => {
    render(<Button {...defaultProps} />);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-blue-600');
  });

  it('applies different variants correctly', () => {
    const { rerender } = render(<Button {...defaultProps} variant="secondary" />);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-600');

    rerender(<Button {...defaultProps} variant="outline" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('border-gray-300');

    rerender(<Button {...defaultProps} variant="ghost" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('text-gray-700');
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(<Button {...defaultProps} size="sm" />);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');

    rerender(<Button {...defaultProps} size="lg" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('px-6', 'py-3', 'text-base');
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button {...defaultProps} onClick={handleClick} />);
    const button = screen.getByRole('button');
    
    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state correctly', () => {
    render(<Button {...defaultProps} loading={true} />);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
    expect(screen.getByText(/click me/i)).toBeInTheDocument();
    
    // Check for loading spinner
    const spinner = button.querySelector('svg');
    expect(spinner).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button {...defaultProps} disabled={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies custom className correctly', () => {
    const customClass = 'custom-class';
    render(<Button {...defaultProps} className={customClass} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass(customClass);
  });

  it('forwards data-testid correctly', () => {
    render(<Button {...defaultProps} data-testid="custom-button" />);
    const button = screen.getByTestId('custom-button');
    expect(button).toBeInTheDocument();
  });

  it('has correct type attribute', () => {
    const { rerender } = render(<Button {...defaultProps} type="submit" />);
    let button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');

    rerender(<Button {...defaultProps} type="reset" />);
    button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'reset');
  });
});