const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
      const allowedOrigins = process.env.NODE_ENV === 'production' ? 
        ['https://your-production-site.com', '*'] : 
        ['http://localhost:5173', 'http://localhost:3000', '*']; // Development origins
  
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
 
  };


const app = express();
app.use(cors());
app.use(express.json());
app.use(cors(corsOptions));



// PostgreSQL connection
const pool = new Pool({
  //....................
  });
  
// API to save reading data (with single selection per day)
app.post('/api/save', async (req, res) => {
  const { date, hours } = req.body;
  try {
    // Delete any existing entry for the selected day
    await pool.query('DELETE FROM readings WHERE date = $1', [date]);

    // Save the new entry
    const result = await pool.query(
      'INSERT INTO readings (date, hours) VALUES ($1, $2) RETURNING *',
      [date, hours]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// API to delete reading data for a specific day
app.delete('/api/data/:date', async (req, res) => {
  const { date } = req.params;
  try {
    await pool.query('DELETE FROM readings WHERE date = $1', [date]);
    res.json({ message: 'Data deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete data' });
  }
});

// API to get reading data for a specific month

app.get('/api/data/:month', async (req, res) => {
  const { month } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM readings WHERE EXTRACT(MONTH FROM date) = $1',
      [month]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});




// API to get summary statistics for a specific month
app.get('/api/stats/:month', async (req, res) => {
  const { month } = req.params;
  try {
    // Get total hours
    const totalResult = await pool.query(
      'SELECT SUM(hours) as total_hours FROM readings WHERE EXTRACT(MONTH FROM date) = $1',
      [month]
    );
    
    // Get daily average
    const avgResult = await pool.query(
      'SELECT AVG(hours) as avg_hours FROM readings WHERE EXTRACT(MONTH FROM date) = $1',
      [month]
    );
    
    // Get days tracked
    const daysResult = await pool.query(
      'SELECT COUNT(DISTINCT date) as days_tracked FROM readings WHERE EXTRACT(MONTH FROM date) = $1',
      [month]
    );
    
    // Get weekly aggregates
    const weeklyResult = await pool.query(`
      SELECT 
        CEIL(EXTRACT(DAY FROM date) / 7.0) as week_number,
        SUM(hours) as total_hours,
        COUNT(*) as days_count,
        AVG(hours) as avg_hours
      FROM readings 
      WHERE EXTRACT(MONTH FROM date) = $1
      GROUP BY week_number
      ORDER BY week_number
    `, [month]);
    
    res.json({
      totalHours: totalResult.rows[0].total_hours || 0,
      avgHours: avgResult.rows[0].avg_hours || 0,
      daysTracked: daysResult.rows[0].days_tracked || 0,
      weeklyData: weeklyResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});


//Backend implementation for AI agent 

app.get('/api/ai-insights/:userId', async (req, res) => {
  const { userId } = req.params;
  const userData = await fetchUserReadingData(userId);
  
  // Format data for the AI API
  const prompt = `Analyze this reading data and provide 3 actionable insights: ${JSON.stringify(userData)}`;
  
  // Call external AI service
  const aiResponse = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 200
  });
  
  res.json({ insights: aiResponse.data.choices[0].text });
});




const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));