const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const axios = require('axios');

require('dotenv').config()

// Express app setup
const app = express();

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.NODE_ENV === 'production' ? 
      ['https://your-production-site.com'] : 
      ['http://localhost:5173', 'http://localhost:3000'];

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

// Apply middleware
app.use(express.json());
app.use(cors(corsOptions));

// AI service configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER_IMDC,           // DB username
  host: process.env.DB_HOST_IMDC,           // DB host
  database: process.env.DB_DATABASE_IMDC,   // DB name
  password: process.env.DB_PASSWORD_IMDC,   // DB password
  port: process.env.DB_PORT_IMDC,   
});

// Middleware to handle AI service error
const handleAIServiceError = (err, res) => {
  console.error('AI Service Error: ', err);
  if (err.response) {
    console.error('Error details: ', err.response.data);
    return res.status(err.response.status).json({
      error: 'AI Service Error',
      details: err.response.data
    });
  }
  return res.status(500).json({
    error: 'AI Service unavailable',
    details: 'Could not connect to AI Service'
  });
};


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

/*
// Proxy endpoint to analyze reading data
app.post('/ai/analyze', async (req, res) => {
  try {
    // Get the month from the request body
    const { month } = req.body;

    // Query your PostgreSQL database for the specified month
    const result = await pool.query(
      'SELECT date, hours FROM readings WHERE EXTRACT(MONTH FROM date) = $1',
      [month]
    );

    // Convert to the format expected by the AI service
    const readings = result.rows.map(row => ({
      date: row.date,
      hours: parseFloat(row.hours) // Ensure hours is a number
    }));

    // Call the AI service with the formatted readings
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/analyze`, {
      readings
    });

    // Return the AI service's response
    res.json(aiResponse.data);
  } catch (err) {
    handleAIServiceError(err, res);
  }
});
*/
app.post('/ai/analyze', async (req, res) => {
  try {
    // 1. Validate month
    const month = parseInt(req.body.month);
    if (isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid month (must be 1-12)' });
    }

    console.log(`Querying for month: ${month}`);

    // 2. Query with timezone handling
    const result = await pool.query(`
      SELECT date, hours 
      FROM readings 
      WHERE EXTRACT(MONTH FROM date AT TIME ZONE 'UTC') = $1
      ORDER BY date
    `, [month]);

    console.log(`Found ${result.rows.length} records`);

    // 3. If no data, return meaningful error
    if (result.rows.length === 0) {
      return res.status(404).json({
        insights: [{
          type: "error",
          title: "No Data Found",
          message: `No reading data found for month ${month}`,
          score: 0
        }]
      });
    }

    // 4. Transform data
    const readings = result.rows.map(row => ({
      date: new Date(row.date).toISOString(),
      hours: parseFloat(row.hours)
    }));

    // 5. Call AI service
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/analyze`, {
      readings
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.json(aiResponse.data);

  } catch (err) {
    console.error("Full error:", {
      message: err.message,
      stack: err.stack,
      response: err.response?.data
    });
    res.status(500).json({
      error: "Analysis failed",
      details: err.message
    });
  }
});







app.post('/ai/predict-goal', async (req, res) => {
  try {
    const { target_hours, month_data } = req.body;

    // Validate and transform data
    const requestData = {
      target_hours: parseFloat(target_hours),
      month_data: month_data.map(item => ({
        date: item.date,
        hours: parseFloat(item.hours)
      }))
    };

    // Call AI service
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/predict-goal`, requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.json(aiResponse.data);
  } catch (err) {
    handleAIServiceError(err, res);
  }
});
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));