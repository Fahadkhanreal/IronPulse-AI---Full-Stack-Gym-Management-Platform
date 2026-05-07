
### Skill 5: update_task

```markdown
---
name: "update_task"
description: "MCP tool to modify title and/or description of an existing task. Use when user says change, edit, rename, update task."
version: "1.0.0"
---

# Update Task Skill

## When to Use This Skill
- User says "change task 1 to 'Call mom tonight'", "update groceries to include fruits", "edit description"
- At least one field (title or description) is provided

## How This Skill Works
1. Validate user_id + task_id
2. Fetch task with ownership check
3. Apply changes only if provided (title and/or description)
4. Update timestamp if any change occurred
5. Commit if modified
6. Return status (updated or no_change)

## Output Format
JSON object:
- task_id: string
- status: "updated" or "no_change"
- title: string (current title after update)

## Quality Criteria
Successful when:
- Only specified fields change
- No change if nothing provided → status "no_change"
- Ownership enforced
- Timestamp accurate

## Example
**Input**: {"user_id": "550e8400-e29b-41d4-a716-446655440000", "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "title": "Buy groceries and fruits"}

**Output**:
```json
{
  "task_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "updated",
  "title": "Buy groceries and fruits"
}