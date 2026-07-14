require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const supabase = require('./config/supabaseClient');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  const { error } = await supabase.from('profiles').select('id').limit(1);
  if (error) {
    console.error('Supabase connection failed:', error.message);
  } else {
    console.log('Supabase connection verified');
  }
});
