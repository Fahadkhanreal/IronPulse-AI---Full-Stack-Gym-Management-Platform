
### Skill 2: list_tasks

```markdown
---
name: "list_tasks"
description: "MCP tool to retrieve the user's tasks, with optional filtering by status. Use when the user asks to show, list, see, view, what's pending, completed tasks, or all tasks."
version: "1.0.0"
---

# List Tasks Skill

## When to Use This Skill
- User says "show my tasks", "list todos", "what's pending?", "what have I completed?", "see all tasks"
- Agent needs current task state before update/delete
- Ambiguous deletion (e.g., "delete the meeting task") → list first

## How This Skill Works
1. Validate user_id
2. Build SQLModel query filtered by user_id
3. Apply optional status filter ("all", "pending", "completed")
4. Execute query and fetch all matching tasks
5. Format each task minimally (id, title, completed)
6. Return array of task objects

## Output Format
Provide a JSON array of objects:
- id: string (UUID)
- title: string
- completed: boolean

## Quality Criteria
A list_tasks execution is successful when:
- Only user's own tasks are returned
- Correct filtering applied (pending = completed=False)
- Empty list returns [] (no error)
- Fast and efficient query (indexed on user_id + completed)

## Example
**Input**: {"user_id": "550e8400-e29b-41d4-a716-446655440000", "status": "pending"}

**Output**:
```json
[
  {"id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "title": "Buy groceries", "completed": false},
  {"id": "z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4", "title": "Call mom", "completed": false}
]
