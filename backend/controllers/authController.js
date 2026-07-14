const supabase = require('../config/supabaseClient');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

async function login(req, res) {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { session, user } = data;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return res.status(403).json({ error: 'Account not found' });
  }

  res.cookie('refresh_token', session.refresh_token, REFRESH_COOKIE_OPTIONS);

  res.json({
    access_token: session.access_token,
    user: profile,
  });
}

async function logout(req, res) {
  res.clearCookie('refresh_token', { path: '/api/auth' });
  res.json({ message: 'Logged out' });
}

async function refresh(req, res) {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token provided' });
  }

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

  if (error) {
    res.clearCookie('refresh_token', { path: '/api/auth' });
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  res.cookie('refresh_token', data.session.refresh_token, REFRESH_COOKIE_OPTIONS);

  res.json({ access_token: data.session.access_token });
}

async function getMe(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, logout, refresh, getMe };
