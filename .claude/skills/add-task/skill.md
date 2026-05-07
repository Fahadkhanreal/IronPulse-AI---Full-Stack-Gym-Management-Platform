---
name: "add_task"
description: "MCP tool to create a new task for the authenticated user in the Todo application. Use when the user wants to add, create, remember, or schedule a new todo item via natural language."
version: "1.0.0"
---

# Add Task Skill

## When to Use This Skill
- User says phrases like "add a task", "create todo", "remember to", "I need to", "schedule", "buy groceries", "pay bills"
- Agent detects intent to create a new task
- No existing task ID is mentioned

## How This Skill Works
1. Validate required parameters: user_id (from JWT/context), title (extracted from message)
2. Optional: extract description if provided
3. Generate UUID for task ID
4. Create Task object with defaults (completed=False, timestamps)
5. Insert into Neon DB using SQLModel session
6. Commit and refresh to get final state
7. Return standardized response matching Phase 3 spec

## Output Format
Provide a JSON object:
- task_id: string (UUID)
- status: "created"
- title: string (the task title that was added)

## Quality Criteria
A add_task execution is successful when:
- Task appears in user's task list (verified via list_tasks)
- user_id is strictly enforced (no cross-user creation)
- Title is not empty
- Response matches exact format from Phase 3 document
- Operation is atomic and idempotent-safe

## Example
**Input (from agent)**: {"user_id": "550e8400-e29b-41d4-a716-446655440000", "title": "Buy groceries", "description": "Milk, eggs, bread"}

**Output**:
```json
{
  "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "created",
  "title": "Buy groceries"
}