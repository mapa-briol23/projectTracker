const supabase = require('../config/supabaseClient');

async function getByProject(req, res) {
  const { projectId } = req.params;

  const { data, error } = await supabase
    .from('tasks')
    .select('*, assignee:profiles!assigned_to(full_name)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const tasks = data.map((task) => ({
    ...task,
    assignee_name: task.assignee?.full_name || null,
    assignee: undefined,
  }));

  res.json({ tasks });
}

async function create(req, res) {
  const { projectId } = req.params;
  const { title, description, status, priority, assigned_to, due_date } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      project_id: projectId,
      title,
      description,
      status,
      priority,
      assigned_to: assigned_to || null,
      due_date: due_date || null,
      created_by: req.user.id,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ task: data });
}

async function update(req, res) {
  const { id } = req.params;
  const { title, description, status, priority, assigned_to, due_date } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const { data, error } = await supabase
    .from('tasks')
    .update({
      title,
      description,
      status,
      priority,
      assigned_to: assigned_to || null,
      due_date: due_date || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ task: data });
}

async function remove(req, res) {
  const { id } = req.params;

  const { error } = await supabase.from('tasks').delete().eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Task deleted' });
}

module.exports = { getByProject, create, update, remove };
