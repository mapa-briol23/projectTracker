const supabase = require('../config/supabaseClient');

async function getStats(req, res) {
  const [
    totalProjects,
    activeProjects,
    completedProjects,
    totalTasks,
    completedTasks,
    recentProjects,
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase
      .from('projects')
      .select('id, name, status, priority, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  res.json({
    totalProjects: totalProjects.count ?? 0,
    activeProjects: activeProjects.count ?? 0,
    completedProjects: completedProjects.count ?? 0,
    totalTasks: totalTasks.count ?? 0,
    completedTasks: completedTasks.count ?? 0,
    recentProjects: recentProjects.data ?? [],
  });
}

module.exports = { getStats };
