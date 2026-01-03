const pool = require('../config/db');

/* =========================
   API 12: Create Project
========================= */
exports.createProject = async (req, res) => {
  const { name, description, status = 'active' } = req.body;
  const { tenantId, userId } = req.user;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Project name required' });
  }

  try {
    // Check tenant project limit
    const tenantResult = await pool.query(
      'SELECT max_projects FROM tenants WHERE id = $1',
      [tenantId]
    );

    const maxProjects = tenantResult.rows[0].max_projects;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM projects WHERE tenant_id = $1',
      [tenantId]
    );

    if (parseInt(countResult.rows[0].count, 10) >= maxProjects) {
      return res.status(403).json({
        success: false,
        message: 'Project limit reached'
      });
    }

    const result = await pool.query(
      `INSERT INTO projects (tenant_id, name, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, status, created_at`,
      [tenantId, name, description, status, userId]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create project' });
  }
};

// API 13: List Projects
exports.listProjects = async (req, res) => {
  const { tenantId } = req.user;
  const { status } = req.query;

  try {
    let query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.status,
        p.created_at,
        u.full_name AS creator_name
      FROM projects p
      JOIN users u ON p.created_by = u.id
      WHERE p.tenant_id = $1
    `;

    const values = [tenantId];

    if (status) {
      query += ` AND p.status = $2`;
      values.push(status);
    }

    query += ` ORDER BY p.created_at DESC`;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("List projects error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects"
    });
  }
};

/* =========================
   API 14: Update Project
========================= */
exports.updateProject = async (req, res) => {
  const { projectId } = req.params;
  const { name, description, status } = req.body;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(
      `UPDATE projects
       SET name = $1, description = $2, status = $3
       WHERE id = $4 AND tenant_id = $5
       RETURNING id, name, description, status`,
      [name, description, status, projectId, tenantId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update project' });
  }
};

/* =========================
   API 15: Delete Project
========================= */
exports.deleteProject = async (req, res) => {
  const { projectId } = req.params;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [projectId, tenantId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
};
