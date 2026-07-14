const supabase = require('../config/supabaseClient');

async function getAll(req, res) {
  const { search, status, priority } = req.query;

  let query = supabase
    .from('projects')
    .select('*, creator:profiles(full_name)')
    .order('created_at', { ascending: false });

  if (search) query = query.ilike('name', `%${search}%`);
  if (status) query = query.eq('status', status);
  if (priority) query = query.eq('priority', priority);

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const projects = data.map((project) => ({
    ...project,
    creator_name: project.creator?.full_name || null,
    creator: undefined,
  }));

  res.json({ projects });
}

async function getById(req, res) {
  const { id } = req.params;

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*, creator:profiles(full_name)')
    .eq('id', id)
    .single();

  if (projectError || !project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*, assignee:profiles!assigned_to(full_name)')
    .eq('project_id', id)
    .order('created_at', { ascending: false });

  if (tasksError) {
    return res.status(500).json({ error: tasksError.message });
  }

  const normalizedTasks = tasks.map((task) => ({
    ...task,
    assignee_name: task.assignee?.full_name || null,
    assignee: undefined,
  }));

  const totalTasks = normalizedTasks.length;
  const completedTasks = normalizedTasks.filter((task) => task.status === 'completed').length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  res.json({
    project: {
      ...project,
      creator_name: project.creator?.full_name || null,
      creator: undefined,
      tasks: normalizedTasks,
      progress,
    },
  });
}

async function create(req, res) {
  const { name, description, status, priority, start_date, end_date } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name,
      description,
      status,
      priority,
      start_date: start_date || null,
      end_date: end_date || null,
      created_by: req.user.id,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ project: data });
}

async function update(req, res) {
  const { id } = req.params;
  const { name, description, status, priority, start_date, end_date } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const { data, error } = await supabase
    .from('projects')
    .update({
      name,
      description,
      status,
      priority,
      start_date: start_date || null,
      end_date: end_date || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ project: data });
}

async function remove(req, res) {
  const { id } = req.params;

  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Project deleted' });
}

module.exports = { getAll, getById, create, update, remove };
