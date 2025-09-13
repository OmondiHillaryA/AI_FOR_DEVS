/**
 * User interface representing authenticated users in the system
 * 
 * Security Notes:
 * - id is UUID from Supabase auth.users
 * - email is validated and sanitized during registration
 * - image is optional profile picture URL
 */
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * PollOption interface for individual poll choices
 * 
 * Security Notes:
 * - text is sanitized to prevent XSS attacks
 * - votes is calculated server-side to prevent manipulation
 */
export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

/**
 * Poll interface representing a complete poll with metadata
 * 
 * Security Notes:
 * - createdBy links to authenticated user (ownership verification)
 * - title and description are sanitized inputs
 * - options array contains validated PollOption objects
 */
export interface Poll {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
  endDate?: Date;
  settings: PollSettings;
}

export interface PollSettings {
  allowMultipleVotes: boolean;
  requireAuthentication: boolean;
}

// Vote types
export interface Vote {
  id: string;
  pollId: string;
  optionId: string;
  userId?: string; // Optional if anonymous voting is allowed
  createdAt: Date;
}

/**
 * CreatePollFormData interface for poll creation form validation
 * 
 * Security Notes:
 * - All string fields undergo sanitization
 * - options array is validated for minimum 2 items
 * - endDate is optional and validated if provided
 */
export interface CreatePollFormData {
  title: string;
  description?: string;
  options: string[];
  settings: PollSettings;
  endDate?: string;
}

/**
 * LoginFormData interface for secure user authentication
 * 
 * WHAT: Type definition for login form data structure
 * WHY: Ensures type safety and documents expected data format for authentication,
 *      preventing runtime errors and providing clear API contract
 * 
 * Security Implementation:
 * - email: Validated with regex, normalized (trim + lowercase)
 * - password: Never logged or stored in plain text, validated for presence
 * 
 * Edge Cases:
 * - Both fields must be non-empty strings (no null, undefined, or objects)
 * - Email format must match standard email regex pattern
 * - Password can contain any characters (no restrictions at type level)
 */
export interface LoginFormData {
  email: string;
  password: string;
}

/**
 * RegisterFormData interface for secure user registration
 * 
 * WHAT: Type definition for user registration form data
 * WHY: Enforces consistent registration data structure and documents validation
 *      requirements, ensuring all registration attempts follow the same format
 * 
 * Security Implementation:
 * - name: Trimmed of whitespace, no HTML/script content allowed
 * - email: Format validated, normalized to lowercase
 * - password: Minimum 6 characters enforced at validation layer
 * 
 * Edge Cases:
 * - name: Cannot be empty after trimming whitespace
 * - email: Must be valid format and unique in system
 * - password: Strength validation happens in auth-actions, not at type level
 */
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}