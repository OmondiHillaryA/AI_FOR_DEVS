import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreatePollForm } from '../CreatePollForm';
import * as pollActions from '@/lib/actions/polls';
import { useRouter } from 'next/navigation';

jest.mock('@/lib/actions/polls', () => ({
  createPoll: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn()
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);

describe('CreatePollForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  // UNIT TESTS
  describe('Unit Tests - Component Rendering', () => {
  
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
    
    const optionInputs = screen.getAllByPlaceholderText(/option/i);
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

  // ADDITIONAL UNIT TESTS
  describe('Unit Tests - Edge Cases and Validation', () => {
    it('should render description field as optional', () => {
      render(<CreatePollForm />);
      const descriptionField = screen.getByLabelText(/description.*optional/i);
      expect(descriptionField).toBeInTheDocument();
      expect(descriptionField).not.toBeRequired();
    });

    it('should limit maximum options to 10', () => {
      render(<CreatePollForm />);
      
      // Add options until we reach the limit
      for (let i = 0; i < 8; i++) {
        fireEvent.click(screen.getByText(/add option/i));
      }
      
      // Should have 10 options now (2 initial + 8 added)
      const optionInputs = screen.getAllByPlaceholderText(/option/i);
      expect(optionInputs.length).toBe(10);
      
      // Add option button should not be visible
      expect(screen.queryByText(/add option/i)).not.toBeInTheDocument();
    });

    it('should prevent removing options when only 2 remain', () => {
      render(<CreatePollForm />);
      
      // Initially should have 2 options with no remove buttons
      const initialRemoveButtons = screen.queryAllByRole('button', { name: /remove/i });
      expect(initialRemoveButtons.length).toBe(0);
      
      // Add one more option
      fireEvent.click(screen.getByText(/add option/i));
      
      // Now should have remove buttons
      const removeButtons = screen.getAllByRole('button');
      const removeButtonsFiltered = removeButtons.filter(btn => 
        btn.querySelector('svg') && btn.type === 'button' && btn.textContent === ''
      );
      expect(removeButtonsFiltered.length).toBe(3); // One for each of the 3 options
    });

    it('should handle empty option validation correctly', async () => {
      render(<CreatePollForm />);
      
      // Fill title
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Test Poll' }
      });
      
      // Add a third option and fill only first and third
      fireEvent.click(screen.getByText(/add option/i));
      const optionInputs = screen.getAllByPlaceholderText(/option/i);
      fireEvent.change(optionInputs[0], { target: { value: 'Option 1' } });
      fireEvent.change(optionInputs[1], { target: { value: '' } }); // Empty
      fireEvent.change(optionInputs[2], { target: { value: 'Option 3' } });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /create poll/i }));
      
      // Should still call createPoll with only non-empty options
      await waitFor(() => {
        expect(pollActions.createPoll).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Test Poll',
          options: ['Option 1', 'Option 3']
        }));
      });
    });

    it('should handle whitespace-only options correctly', async () => {
      render(<CreatePollForm />);
      
      // Fill title
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Test Poll' }
      });
      
      // Fill options with whitespace
      const optionInputs = screen.getAllByPlaceholderText(/option/i);
      fireEvent.change(optionInputs[0], { target: { value: '   Option 1   ' } });
      fireEvent.change(optionInputs[1], { target: { value: '\t\n  ' } }); // Only whitespace
      
      // Add third option with valid content
      fireEvent.click(screen.getByText(/add option/i));
      const updatedInputs = screen.getAllByPlaceholderText(/option/i);
      fireEvent.change(updatedInputs[2], { target: { value: 'Option 2' } });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /create poll/i }));
      
      // Should call createPoll with trimmed options
      await waitFor(() => {
        expect(pollActions.createPoll).toHaveBeenCalledWith(expect.objectContaining({
          options: ['   Option 1   ', 'Option 2'] // Component should pass as-is, server handles trimming
        }));
      });
    });

    it('should show loading state during form submission', async () => {
      // Mock a delayed response
      (pollActions.createPoll as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, pollId: 'test-id' }), 100))
      );
      
      render(<CreatePollForm />);
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Test Poll' }
      });
      
      const optionInputs = screen.getAllByPlaceholderText(/option/i);
      fireEvent.change(optionInputs[0], { target: { value: 'Option 1' } });
      fireEvent.change(optionInputs[1], { target: { value: 'Option 2' } });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /create poll/i }));
      
      // Check loading state
      expect(screen.getByText(/creating poll/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /creating poll/i })).toBeDisabled();
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText(/poll created successfully/i)).toBeInTheDocument();
      });
    });

    it('should handle unexpected errors gracefully', async () => {
      // Mock createPoll to throw an error
      (pollActions.createPoll as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      render(<CreatePollForm />);
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Test Poll' }
      });
      
      const optionInputs = screen.getAllByPlaceholderText(/option/i);
      fireEvent.change(optionInputs[0], { target: { value: 'Option 1' } });
      fireEvent.change(optionInputs[1], { target: { value: 'Option 2' } });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /create poll/i }));
      
      // Should show generic error message
      await waitFor(() => {
        expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
      });
    });
  });

  // INTEGRATION TESTS
  describe('Integration Tests - Full User Workflows', () => {
    it('should complete full poll creation workflow with description', async () => {
      (pollActions.createPoll as jest.Mock).mockResolvedValue({
        success: true,
        pollId: 'integration-test-poll'
      });
      
      const user = userEvent.setup();
      render(<CreatePollForm />);
      
      // Fill out complete form
      await user.type(screen.getByLabelText(/title/i), 'What is your favorite programming language?');
      await user.type(
        screen.getByLabelText(/description/i), 
        'This poll is to understand the preferences of our development team.'
      );
      
      // Fill options
      const optionInputs = screen.getAllByPlaceholderText(/option/i);
      await user.type(optionInputs[0], 'JavaScript');
      await user.type(optionInputs[1], 'Python');
      
      // Add more options
      await user.click(screen.getByText(/add option/i));
      await user.click(screen.getByText(/add option/i));
      
      const updatedInputs = screen.getAllByPlaceholderText(/option/i);
      await user.type(updatedInputs[2], 'TypeScript');
      await user.type(updatedInputs[3], 'Java');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /create poll/i }));
      
      // Verify API call
      await waitFor(() => {
        expect(pollActions.createPoll).toHaveBeenCalledWith({
          title: 'What is your favorite programming language?',
          description: 'This poll is to understand the preferences of our development team.',
          options: ['JavaScript', 'Python', 'TypeScript', 'Java'],
          isPublic: true,
          allowMultipleVotes: false,
          allowAnonymousVotes: true
        });
      });
      
      // Verify success message and redirect
      expect(screen.getByText(/poll created successfully/i)).toBeInTheDocument();
      
      // Wait for redirect (after 2 second timeout)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 2100));
      });
      
      expect(mockPush).toHaveBeenCalledWith('/polls');
    });

    it('should handle complex user interaction flow with option management', async () => {
      const user = userEvent.setup();
      render(<CreatePollForm />);
      
      // Start with basic form
      await user.type(screen.getByLabelText(/title/i), 'Best Framework');
      
      // Add multiple options
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByText(/add option/i));
      }
      
      // Fill all options
      const optionInputs = screen.getAllByPlaceholderText(/option/i);
      const frameworks = ['React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'SvelteKit'];
      
      for (let i = 0; i < Math.min(optionInputs.length, frameworks.length); i++) {
        await user.type(optionInputs[i], frameworks[i]);
      }
      
      // Remove some options
      const removeButtons = screen.getAllByRole('button').filter(btn => 
        btn.querySelector('svg') && btn.type === 'button' && btn.textContent === ''
      );
      
      // Remove the 3rd option (Angular)
      await user.click(removeButtons[2]);
      
      // Verify option was removed
      const updatedInputs = screen.getAllByPlaceholderText(/option/i);
      expect(updatedInputs.length).toBe(6);
      
      // Mock successful creation
      (pollActions.createPoll as jest.Mock).mockResolvedValue({
        success: true,
        pollId: 'complex-workflow-poll'
      });
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /create poll/i }));
      
      // Verify the correct options were submitted (without Angular)
      await waitFor(() => {
        expect(pollActions.createPoll).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Best Framework',
            options: expect.arrayContaining(['React', 'Vue', 'Svelte', 'Next.js', 'Nuxt.js', 'SvelteKit'])
          })
        );
      });
      
      // Ensure Angular is not in the submitted options
      const callArgs = (pollActions.createPoll as jest.Mock).mock.calls[0][0];
      expect(callArgs.options).not.toContain('Angular');
    });

    it('should handle error recovery and resubmission workflow', async () => {
      const user = userEvent.setup();
      
      // First, mock a failure
      (pollActions.createPoll as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Server temporarily unavailable'
      });
      
      render(<CreatePollForm />);
      
      // Fill form
      await user.type(screen.getByLabelText(/title/i), 'Error Recovery Test');
      
      const optionInputs = screen.getAllByPlaceholderText(/option/i);
      await user.type(optionInputs[0], 'Option A');
      await user.type(optionInputs[1], 'Option B');
      
      // Submit and get error
      await user.click(screen.getByRole('button', { name: /create poll/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/server temporarily unavailable/i)).toBeInTheDocument();
      });
      
      // Verify form is still usable
      expect(screen.getByRole('button', { name: /create poll/i })).not.toBeDisabled();
      
      // Mock success for retry
      (pollActions.createPoll as jest.Mock).mockResolvedValueOnce({
        success: true,
        pollId: 'retry-success-poll'
      });
      
      // Modify form slightly and resubmit
      await user.type(screen.getByLabelText(/title/i), ' - Retry');
      await user.click(screen.getByRole('button', { name: /create poll/i }));
      
      // Verify success
      await waitFor(() => {
        expect(screen.getByText(/poll created successfully/i)).toBeInTheDocument();
      });
      
      // Verify error message is cleared
      expect(screen.queryByText(/server temporarily unavailable/i)).not.toBeInTheDocument();
    });
  });
});