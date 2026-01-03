const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

/* =========================
   API 16: Create Task
========================= */
exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo, priority = 'medium', dueDate } = req.body;
    const user = req.user;

    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    // Check project exists and belongs to user's tenant
    const projectRes = await pool.query(
      'SELECT tenant_id FROM projects WHERE id=$1',
      [projectId]
    );
    if (!projectRes.rowCount) return res.status(404).json({ success: false, message: 'Project not found' });
    const tenantId = projectRes.rows[0].tenant_id;
    if (tenantId !== user.tenantId) return res.status(403).json({ success: false, message: "Project doesn't belong to your tenant" });

    // If assignedTo, verify user belongs to same tenant
    if (assignedTo) {
      const assignedRes = await pool.query('SELECT tenant_id FROM users WHERE id=$1', [assignedTo]);
      if (!assignedRes.rowCount || assignedRes.rows[0].tenant_id !== tenantId) {
        return res.status(400).json({ success: false, message: 'Assigned user must belong to same tenant' });
      }
    }

    const insertRes = await pool.query(
      `INSERT INTO tasks 
       (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at)
       VALUES ($1,$2,$3,$4,$5,'todo',$6,$7,$8,NOW())
       RETURNING *`,
      [uuidv4(), projectId, tenantId, title, description || null, priority, assignedTo || null, dueDate || null]
    );

    res.status(201).json({ success: true, data: insertRes.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* =========================
   API 17: List Project Tasks
========================= */
exports.listProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const user = req.user;
    const { status, assignedTo, priority, search = '', page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Check project exists and belongs to tenant
    const projectRes = await pool.query('SELECT tenant_id FROM projects WHERE id=$1', [projectId]);
    if (!projectRes.rowCount) return res.status(404).json({ success: false, message: 'Project not found' });
    if (projectRes.rows[0].tenant_id !== user.tenantId) return res.status(403).json({ success: false, message: "Project doesn't belong to your tenant" });

    // Build query dynamically
    let query = `SELECT t.*, u.id AS "assignedToId", u.full_name AS "assignedToName", u.email AS "assignedToEmail"
                 FROM tasks t
                 LEFT JOIN users u ON t.assigned_to = u.id
                 WHERE t.project_id=$1`;
    const params = [projectId];
    let idx = 2;

    if (status) { query += ` AND t.status=$${idx++}`; params.push(status); }
    if (assignedTo) { query += ` AND t.assigned_to=$${idx++}`; params.push(assignedTo); }
    if (priority) { query += ` AND t.priority=$${idx++}`; params.push(priority); }
    if (search) { query += ` AND LOWER(t.title) LIKE $${idx++}`; params.push(`%${search.toLowerCase()}%`); }

    query += ` ORDER BY 
                 CASE t.priority WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC, 
                 t.due_date ASC
               LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(limit, offset);

    const tasksRes = await pool.query(query, params);

    // Total count
    const countRes = await pool.query('SELECT COUNT(*) FROM tasks WHERE project_id=$1', [projectId]);
    const total = parseInt(countRes.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    // Format assignedTo
    const tasks = tasksRes.rows.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedToId ? { id: task.assignedToId, fullName: task.assignedToName, email: task.assignedToEmail } : null,
      dueDate: task.due_date,
      createdAt: task.created_at
    }));

    res.json({
      success: true,
      data: { tasks, total, pagination: { currentPage: parseInt(page), totalPages, limit: parseInt(limit) } }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* =========================
   API 18: Update Task Status
========================= */
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const user = req.user;

    if (!['todo','in_progress','completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Check task exists and belongs to tenant
    const taskRes = await pool.query('SELECT tenant_id FROM tasks WHERE id=$1', [taskId]);
    if (!taskRes.rowCount) return res.status(404).json({ success: false, message: 'Task not found' });
    if (taskRes.rows[0].tenant_id !== user.tenantId) return res.status(403).json({ success: false, message: "Task doesn't belong to your tenant" });

    // Update status
    const updateRes = await pool.query(
      'UPDATE tasks SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING id, status, updated_at AS "updatedAt"',
      [status, taskId]
    );

    res.json({ success: true, data: updateRes.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* =========================
   API 19: Update Task
========================= */
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    const user = req.user;

    // Check task exists and belongs to tenant
    const taskRes = await pool.query('SELECT tenant_id FROM tasks WHERE id=$1', [taskId]);
    if (!taskRes.rowCount) return res.status(404).json({ success: false, message: 'Task not found' });
    if (taskRes.rows[0].tenant_id !== user.tenantId) return res.status(403).json({ success: false, message: "Task doesn't belong to your tenant" });

    const fields = [];
    const values = [];
    let idx = 1;

    if (title) { fields.push(`title=$${idx++}`); values.push(title); }
    if (description !== undefined) { fields.push(`description=$${idx++}`); values.push(description); }
    if (status) { fields.push(`status=$${idx++}`); values.push(status); }
    if (priority) { fields.push(`priority=$${idx++}`); values.push(priority); }

    if (assignedTo === null) {
      fields.push(`assigned_to=NULL`);
    } else if (assignedTo) {
      // Check assigned user belongs to same tenant
      const assignedRes = await pool.query('SELECT tenant_id FROM users WHERE id=$1', [assignedTo]);
      if (!assignedRes.rowCount || assignedRes.rows[0].tenant_id !== user.tenantId) {
        return res.status(400).json({ success: false, message: 'Assigned user must belong to same tenant' });
      }
      fields.push(`assigned_to=$${idx++}`);
      values.push(assignedTo);
    }

    if (dueDate === null) {
      fields.push(`due_date=NULL`);
    } else if (dueDate) {
      fields.push(`due_date=$${idx++}`);
      values.push(dueDate);
    }

    if (fields.length === 0) return res.status(400).json({ success: false, message: 'Nothing to update' });

    values.push(taskId); // for WHERE
    const query = `UPDATE tasks SET ${fields.join(',')}, updated_at=NOW() WHERE id=$${idx} RETURNING *`;
    const updateRes = await pool.query(query, values);

    const updatedTask = updateRes.rows[0];

    // Fetch assignedTo details
    let assignedUser = null;
    if (updatedTask.assigned_to) {
      const userRes = await pool.query('SELECT id, full_name AS "fullName", email FROM users WHERE id=$1', [updatedTask.assigned_to]);
      assignedUser = userRes.rows[0];
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        priority: updatedTask.priority,
        assignedTo: assignedUser,
        dueDate: updatedTask.due_date,
        updatedAt: updatedTask.updated_at
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
