import { createPoll, CreatePollFormData } from '@/lib/actions/polls';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';

// Mock dependencies
jest.mock('@/lib/supabase/client', () => ({
  createServerSupabaseClient: jest.fn()
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}));

jest.mock('@/lib/supabase/auth', () => ({
  getCurrentUser: jest.fn().mockResolvedValue({ id: 'test-user-id' })
}));

describe('Poll Actions', () => {
  let mockSupabaseClient: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock Supabase client
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn()
    };
    
    (createServerSupabaseClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });
  
  describe('createPoll', () => {
    const validPollData: CreatePollFormData = {
      title: 'Test Poll',
      description: 'Test Description',
      options: ['Option 1', 'Option 2'],
      isPublic: true,
      allowMultipleVotes: false,
      allowAnonymousVotes: true
    };
    
    it('should create a poll successfully', async () => {
      // Mock successful poll creation
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: 'test-poll-id' },
        error: null
      });
      
      // Mock successful options creation
      mockSupabaseClient.insert.mockResolvedValueOnce({
        error: null
      });
      
      const result = await createPoll(validPollData);
      
      // Verify result
      expect(result).toEqual({
        success: true,
        pollId: 'test-poll-id'
      });
      
      // Verify Supabase calls
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('polls');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Poll',
        description: 'Test Description'
      }));
      
      // Verify path revalidation
      expect(revalidatePath).toHaveBeenCalledWith('/polls');
    });
    
    it('should return error when title is empty', async () => {
      const invalidData = { ...validPollData, title: '' };
      const result = await createPoll(invalidData);
      
      expect(result).toEqual({
        success: false,
        error: 'Title is required'
      });
    });
    
    it('should return error when less than 2 options are provided', async () => {
      const invalidData = { ...validPollData, options: ['Option 1'] };
      const result = await createPoll(invalidData);
      
      expect(result).toEqual({
        success: false,
        error: 'At least 2 options are required'
      });
    });
    
    it('should return error when more than 10 options are provided', async () => {
      const invalidData = { 
        ...validPollData, 
        options: Array(11).fill(0).map((_, i) => `Option ${i+1}`) 
      };
      const result = await createPoll(invalidData);
      
      expect(result).toEqual({
        success: false,
        error: 'Maximum 10 options allowed'
      });
    });
    
    it('should handle poll creation error', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      });
      
      const result = await createPoll(validPollData);
      
      expect(result).toEqual({
        success: false,
        error: 'Failed to create poll'
      });
    });
  });
});