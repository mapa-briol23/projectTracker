const supabase = require('../config/supabaseClient');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, status, created_at')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile || profile.status !== 'active') {
    return res.status(403).json({ error: 'Account not found or inactive' });
  }

  req.user = profile;
  next();
}

module.exports = { requireAuth };
