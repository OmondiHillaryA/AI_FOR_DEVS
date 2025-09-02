import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreatePollForm } from '../CreatePollForm';
import * as pollActions from '@/lib/actions/polls';

jest.mock('@/lib/actions/polls', () => ({
  createPoll: jest.fn()
}));

describe('CreatePollForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('allows adding and removing options', () => {
    render(<CreatePollForm />);
    
    // Check initial options (should be 2)
    let optionInputs = screen.getAllByPlaceholderText(/enter option/i);
    expect(optionInputs.length).toBe(2);
    
    // Add a new option
    fireEvent.click(screen.getByText(/add option/i));
    
    // Check if a new option was added
    optionInputs = screen.getAllByPlaceholderText(/enter option/i);
    expect(optionInputs.length).toBe(3);
    
    // Remove the first option
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);
    
    // Check if an option was removed
    optionInputs = screen.getAllByPlaceholderText(/enter option/i);
    expect(optionInputs.length).toBe(2);
    
    // Try to add multiple options
    fireEvent.click(screen.getByText(/add option/i));
    fireEvent.click(screen.getByText(/add option/i));
    
    // Check if options were added
    optionInputs = screen.getAllByPlaceholderText(/enter option/i);
    expect(optionInputs.length).toBe(4);
  });

  it('renders the form with all fields', () => {
    render(<CreatePollForm />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByText(/options/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create poll/i })).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    (pollActions.createPoll as jest.Mock).mockResolvedValue({
      success: true,
      pollId: 'new-poll-id'
    });
    
    render(<CreatePollForm />);
    
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Poll' }
    });
    
    const optionInputs = screen.getAllByPlaceholderText(/enter option/i);
    fireEvent.change(optionInputs[0], { target: { value: 'Option 1' } });
    fireEvent.change(optionInputs[1], { target: { value: 'Option 2' } });
    
    fireEvent.click(screen.getByRole('button', { name: /create poll/i }));
    
    await waitFor(() => {
      expect(pollActions.createPoll).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Poll',
        options: ['Option 1', 'Option 2']
      }));
    });
  });

  it('validates title is required', async () => {
    render(<CreatePollForm />);
    
    // Fill options but leave title empty
    const optionInputs = screen.getAllByPlaceholderText(/enter option/i);
    fireEvent.change(optionInputs[0], { target: { value: 'Option 1' } });
    fireEvent.change(optionInputs[1], { target: { value: 'Option 2' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create poll/i }));
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
    
    // Verify createPoll was not called
    expect(pollActions.createPoll).not.toHaveBeenCalled();
  });

  it('validates at least two options are required', async () => {
    render(<CreatePollForm />);
    
    // Fill title
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Poll' }
    });
    
    // Fill only one option
    const optionInputs = screen.getAllByPlaceholderText(/enter option/i);
    fireEvent.change(optionInputs[0], { target: { value: 'Option 1' } });
    fireEvent.change(optionInputs[1], { target: { value: '' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create poll/i }));
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/at least 2 options are required/i)).toBeInTheDocument();
    });
    
    // Verify createPoll was not called
    expect(pollActions.createPoll).not.toHaveBeenCalled();
  });

  it('handles successful poll creation with redirect', async () => {
    // Mock successful poll creation
    (pollActions.createPoll as jest.Mock).mockResolvedValue({
      success: true,
      pollId: 'new-poll-id'
    });
    
    // Mock window.location.href
    const originalLocation = window.location;
    delete window.location;
    window.location = { ...originalLocation, href: '' } as unknown as Location;
    
    render(<CreatePollForm />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Poll' }
    });
    
    const optionInputs = screen.getAllByPlaceholderText(/enter option/i);
    fireEvent.change(optionInputs[0], { target: { value: 'Option 1' } });
    fireEvent.change(optionInputs[1], { target: { value: 'Option 2' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create poll/i }));
    
    // Verify redirect happens after successful creation
    await waitFor(() => {
      expect(window.location.href).toContain('new-poll-id');
    });
    
    // Restore original location
    window.location = originalLocation;
  });

  it('displays error message when poll creation fails', async () => {
    // Mock failed poll creation
    const errorMessage = 'Database connection error';
    (pollActions.createPoll as jest.Mock).mockResolvedValue({
      success: false,
      error: errorMessage
    });
    
    render(<CreatePollForm />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Poll' }
    });
    
    const optionInputs = screen.getAllByPlaceholderText(/enter option/i);
    fireEvent.change(optionInputs[0], { target: { value: 'Option 1' } });
    fireEvent.change(optionInputs[1], { target: { value: 'Option 2' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create poll/i }));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    
    // Verify form is still enabled for resubmission
    expect(screen.getByRole('button', { name: /create poll/i })).not.toBeDisabled();
  });
});