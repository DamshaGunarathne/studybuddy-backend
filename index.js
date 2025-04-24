const dotenv = require('dotenv');
dotenv.config(); // ✅ load env FIRST
const express = require('express');
const mongoose = require('mongoose');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
require('./cron/repeatTasks');

dotenv.config();

const app = express();
app.use(express.json());


app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
  res.send('🚀 StudyBuddy API is live!');
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB error:', err));
