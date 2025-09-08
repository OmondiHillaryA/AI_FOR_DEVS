# Prompt Examples from New-Poll Project

## Chat Prompts Used

### Project Setup
```
please assemble the file that creates the project in one directory called New-poll
```

### Styling & UI
```
let's centre our poll
```

```
lets give the different pages we have a dull vibrant background
```

### Feature Development
```
Enable Voting
Add a basic voting form (radio/select + submit button)
```

```
impliment this one to Display mock poll data: question + options
```

```
Show a placeholder for "thank you" or "results" after submission
```

### Enhancement Requests
```
Lets enhance our New-poll app using this instruction Poll Detail Page Setup
Create a dynamic route (e.g. /polls/[id])
```

```
scaffold the page, add routing, and pass state
```

### Refinement & Debugging
```
what can be refined in our submission logic so that i can use inline edit
```

```
implement the refinement you have share for our submission logic
```

### Project Management
```
how can i refine the project to not receive You must be logged in to create a poll.
```

```
how to commit and push my changes to showcase to the team through github that i worked on the project today
```

### Code Review & Analysis
```
please review if all those files for New-poll are for sure under New-poll project
```

```
please esure all files for the New-Poll project are in the New-poll directory
```

## Inline Edit Prompts (Implied)

### Authentication Bypass
- Removed authentication requirement from Server Actions
- Replaced user validation with mock user

### Background Styling
- Applied gradient backgrounds to all pages
- Changed from vibrant to dull vibrant (muted colors)

### Form Enhancements
- Added loading states to submission logic
- Implemented error handling and form reset
- Added character limits and validation

### Routing Implementation
- Created dynamic routes with state passing
- Separated voting and results into different pages
- Added navigation between pages

## Prompt Patterns Observed

### Effective Patterns:
1. **Direct action requests**: "create", "add", "implement"
2. **Specific feature descriptions**: "voting form with radio buttons"
3. **Contextual refinements**: "refine our submission logic"
4. **Problem-solution format**: "how to fix X" or "how can i do Y"

### Less Effective Patterns:
1. Vague requests without specific outcomes
2. Multiple unrelated requests in one prompt
3. Requests without context about existing code

## Key Learnings:
- Be specific about desired outcomes
- Reference existing code/features when asking for changes
- Break complex requests into smaller, focused prompts
- Use action verbs for clear intent