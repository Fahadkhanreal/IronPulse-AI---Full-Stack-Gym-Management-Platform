
### Skill 3: complete_task

```markdown
---
name: "complete_task"
description: "MCP tool to mark a specific task as completed. Use when user says done, finished, complete, mark as done, checked off."
version: "1.0.0"
---

# Complete Task Skill

## When to Use This Skill
- User says "mark task 3 as complete", "done with groceries", "finished call mom"
- Task ID is clearly mentioned or resolved from context

## How This Skill Works
1. Validate user_id and task_id
2. Fetch task with user_id + task_id filter
3. If not found → raise clear error
4. Set completed = True, update timestamp
5. Commit change
6. Return confirmation with original title

## Output Format
JSON object:
- task_id: string
- status: "completed"
- title: string

## Quality Criteria
Execution successful when:
- Task was pending → now completed
- No change if already completed (still return success)
- Ownership strictly enforced (403-like error if mismatch)
- Timestamp updated correctly

## Example
**Input**: {"user_id": "550e8400-e29b-41d4-a716-446655440000", "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"}

**Output**:
```json
{
  "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "completed",
  "title": "Buy groceries"
}