const supabase = require('../config/supabaseClient');

async function getAll(req, res) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('status', 'active')
    .order('full_name');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ users: data });
}

module.exports = { getAll };
