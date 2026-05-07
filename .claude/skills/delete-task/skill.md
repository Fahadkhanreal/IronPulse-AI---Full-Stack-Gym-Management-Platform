
### Skill 4: delete_task

```markdown
---
name: "delete_task"
description: "MCP tool to permanently remove a task. Use when user says delete, remove, cancel, discard task."
version: "1.0.0"
---

# Delete Task Skill

## When to Use This Skill
- User says "delete task 2", "remove the old meeting", "cancel groceries"
- After listing if task name is ambiguous

## How This Skill Works
1. Validate user_id + task_id
2. Fetch task with strict ownership filter
3. If not found → error
4. Delete record
5. Commit
6. Return confirmation with captured title

## Output Format
JSON object:
- task_id: string
- status: "deleted"
- title: string

## Quality Criteria
Successful when:
- Task no longer exists in user's list
- No cross-user deletion possible
- Error message clear if task not found

## Example
**Input**: {"user_id": "550e8400-e29b-41d4-a716-446655440000", "task_id": "z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4"}

**Output**:
```json
{
  "task_id": "z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4",
  "status": "deleted",
  "title": "Call mom"
}