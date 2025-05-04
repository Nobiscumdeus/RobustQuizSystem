import  { useState, useEffect,useCallback } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function AIInsights({ month }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [targetHours, setTargetHours] = useState('');
  const [goalPrediction, setGoalPrediction] = useState(null);
  const [isPredictionLoading, setIsPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState('');
  const [chartData, setChartData] = useState([]);
  
  // Store the original data for recalculations
  const [monthData, setMonthData] = useState([]);

  // Function to fetch data - separated so it can be reused
  /*
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching data for month: ${month}`);
      const dataResponse = await axios.get(`http://localhost:5000/api/data/${month}`);
      console.log("Data received:", dataResponse.data);
      
      // Save the month data for prediction recalculations
      setMonthData(dataResponse.data);

      if (dataResponse.data.length < 3) {
        setInsights([{
          type: "error",
          title: "Insufficient Data",
          message: "Need at least 3 days of reading data for analysis",
          score: 0
        }]);
        setLoading(false);
        return;
      }

      const readings = dataResponse.data.map(item => ({
        date: new Date(item.date).toISOString(),
        hours: parseFloat(item.hours)
      }));

      const analysisResponse = await axios.post(
        'http://localhost:5000/ai/analyze',
        {
          month: month,
          readings: readings
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log("AI analysis:", analysisResponse.data);

      // Add this normalization function
        const normalizeScores = (insights) => {
        const maxScore = Math.max(...insights.map(i => i.score), 1);
        return insights.map(i => ({
        ...i,
        normalizedScore: (i.score / maxScore) * 100
        }));
    };
  
    //  setInsights(analysisResponse.data.insights || []);
    // Use in your fetchData function:
        setInsights(normalizeScores(analysisResponse.data.insights || []));
      
      // Prepare data for chart
      prepareChartData(dataResponse.data);
      
      // If we already have a target, update the prediction with new data
      if (targetHours && !isNaN(targetHours) && targetHours > 0) {
        handlePrediction(readings);
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.error || err.message);
      setInsights([{
        type: "error",
        title: "Data Fetch Failed",
        message: "Could not generate insights",
        score: 0
      }]);
    } finally {
      setLoading(false);
    }
  };
  */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
  
    try {
      console.log(`Fetching data for month: ${month}`);
      const dataResponse = await axios.get(`http://localhost:5000/api/data/${month}`);
      console.log("Data received:", dataResponse.data);
  
      // Save the month data for prediction recalculations
      setMonthData(dataResponse.data);
  
      if (dataResponse.data.length < 3) {
        setInsights([{
          type: "error",
          title: "Insufficient Data",
          message: "Need at least 3 days of reading data for analysis",
          score: 0
        }]);
        return;
      }
  
      const readings = dataResponse.data.map(item => ({
        date: new Date(item.date).toISOString(),
        hours: parseFloat(item.hours)
      }));
  
      const analysisResponse = await axios.post(
        'http://localhost:5000/ai/analyze',
        {
          month: month,
          readings: readings
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      console.log("AI analysis:", analysisResponse.data);
  
      // Normalization function
      const normalizeScores = (insights) => {
        const maxScore = Math.max(...insights.map(i => i.score), 1);
        return insights.map(i => ({
          ...i,
          normalizedScore: (i.score / maxScore) * 100
        }));
      };
  
      const normalizedInsights = normalizeScores(analysisResponse.data.insights || []);
      setInsights(normalizedInsights);
  
      prepareChartData(dataResponse.data);
  
      if (targetHours && !isNaN(targetHours) && targetHours > 0) {
        handlePrediction(readings);
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.error || err.message);
      setInsights([{
        type: "error",
        title: "Data Fetch Failed",
        message: "Could not generate insights",
        score: 0
      }]);
    } finally {
      setLoading(false);
    }
  }, [month, targetHours]); // Dependency array
  
  // Usage in useEffect
  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // Prepare chart data from readings
  /*
  const prepareChartData = (data) => {
    if (!data || data.length === 0) return;
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Prepare basic chart data with actual readings
    const chartDataArray = sortedData.map(item => {
      const day = new Date(item.date).getDate();
      return {
        day,
        date: new Date(item.date).toLocaleDateString(),
        actualHours: parseFloat(item.hours),
      };
    });
    
    setChartData(chartDataArray);
  };
*/
const prepareChartData = useCallback((data) => {
    if (!data || data.length === 0) return;
    
    // Create a clean copy to avoid mutating original data
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  
    const chartDataArray = sortedData.map(item => ({
      day: new Date(item.date).getDate(),
      date: new Date(item.date).toLocaleDateString(),
      actualHours: parseFloat(item.hours) || 0, // Ensure numerical value
    }));
  
    setChartData(prev => {
      // Only update if data actually changed
      const stringify = arr => JSON.stringify(arr.map(({ day, actualHours }) => ({ day, actualHours })));
      return stringify(prev) === stringify(chartDataArray) ? prev : chartDataArray;
    });
  }, []); // Empty dependency array = memoize permanently


 
// Update in the updateChartWithPrediction function:
/*
const updateChartWithPrediction = () => {
    if (!goalPrediction || !monthData || monthData.length === 0) return;
  
    const now = new Date();
    const currentDay = now.getDate();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
    let chartDataArray = [...monthData]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => {
        const day = new Date(item.date).getDate();
        return {
          day,
          date: new Date(item.date).toLocaleDateString(),
          actualHours: parseFloat(item.hours),
        };
      });
  
    // Calculate requiredDaily using improved regex
    const recommendedMatch = goalPrediction.recommendation?.match(/(\d+\.?\d*)\s*hours?/i);
    const requiredDaily = recommendedMatch ? parseFloat(recommendedMatch[1]) : 0;
  
    // Add or update predicted hours for future days
    for (let day = currentDay + 1; day <= lastDayOfMonth; day++) {
      const existingDay = chartDataArray.find(d => d.day === day);
      if (existingDay) {
        existingDay.predictedHours = Math.min(requiredDaily, 10);
      } else {
        chartDataArray.push({
          day,
          date: new Date(now.getFullYear(), now.getMonth(), day).toLocaleDateString(),
          predictedHours: Math.min(requiredDaily, 10),
        });
      }
    }
  
    // Sort the data by day
    chartDataArray.sort((a, b) => a.day - b.day);
  
    // Calculate cumulative values
    let cumulativeActual = 0;
    let cumulativePredicted = 0;
    const targetPerDay = parseFloat(targetHours) / lastDayOfMonth;
  
    chartDataArray = chartDataArray.map((item) => {
      // Update cumulative actual
      cumulativeActual += item.actualHours || 0;
      const newItem = {
        ...item,
        cumulativeActual,
        targetLine: targetPerDay * item.day,
      };
  
      // Calculate cumulative predicted
      if (item.day <= currentDay) {
        cumulativePredicted = cumulativeActual; // Use actual data up to current day
      } else {
        cumulativePredicted += item.predictedHours || 0;
      }
      newItem.cumulativePredicted = cumulativePredicted;
  
      return newItem;
    });
  
    setChartData(chartDataArray);
  };
  */
  const updateChartWithPrediction = useCallback(() => {
    if (!goalPrediction || !monthData?.length) return;
  
    // Get date references using the component's month prop
    const currentYear = new Date().getFullYear();
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const lastDayOfMonth = new Date(currentYear, month + 1, 0).getDate(); // month is 0-indexed
  
    // Create base chart data from sorted month data
    const sortedData = [...monthData].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  
    let chartDataArray = sortedData.map(item => ({
      day: new Date(item.date).getDate(),
      date: new Date(item.date).toLocaleDateString(),
      actualHours: parseFloat(item.hours) || 0,
    }));
  
    // Extract recommended hours from AI prediction
    const recommendedHours = goalPrediction.recommendation?.match(/(\d+\.?\d*)\s*hours?/i);
    const requiredDaily = recommendedHours ? 
      Math.min(parseFloat(recommendedHours[1]), 10) : 0;
  
    // Add/update predictions for future days
    for (let day = currentDay + 1; day <= lastDayOfMonth; day++) {
      const existingIndex = chartDataArray.findIndex(d => d.day === day);
      if (existingIndex > -1) {
        chartDataArray[existingIndex].predictedHours = requiredDaily;
      } else {
        chartDataArray.push({
          day,
          date: new Date(currentYear, month, day).toLocaleDateString(),
          predictedHours: requiredDaily,
        });
      }
    }
  
    // Sort final array by day
    chartDataArray.sort((a, b) => a.day - b.day);
  
    // Calculate cumulative values
    let cumulativeActual = 0;
    let cumulativePredicted = 0;
    const targetPerDay = targetHours / lastDayOfMonth;
  
    const processedData = chartDataArray.map(item => {
      cumulativeActual += item.actualHours || 0;
      
      // Calculate predicted cumulative based on current day
      cumulativePredicted = item.day <= currentDay 
        ? cumulativeActual 
        : cumulativePredicted + (item.predictedHours || 0);
  
      return {
        ...item,
        cumulativeActual,
        cumulativePredicted: Math.min(cumulativePredicted, targetHours),
        targetLine: targetPerDay * item.day
      };
    });
  
    setChartData(processedData);
  }, [goalPrediction, monthData, targetHours, month]); // Key dependencies
  
  // Usage in useEffect
  useEffect(() => {
    if (goalPrediction) {
      updateChartWithPrediction();
    }
  }, [goalPrediction, updateChartWithPrediction]);




  // Fetch insights when the month changes
  useEffect(() => {
    fetchData();
  }, [month,fetchData]); 

  // Update chart when prediction changes
  useEffect(() => {
    if (goalPrediction) {
      updateChartWithPrediction();
    }
  }, [goalPrediction,updateChartWithPrediction]);

  // Set up a polling mechanism to refresh data
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Only refresh if we're not already loading
      if (!loading) {
        fetchData();
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId);
  }, [month, loading, targetHours,fetchData]); 

  // Handle prediction logic
  /*
  const handlePrediction = async (readingsData = null) => {
    if (!targetHours || isNaN(targetHours) || targetHours <= 0) {
      setPredictionError("Please enter a valid target goal (positive number).");
      setGoalPrediction(null); // Reset previous prediction
      return;
    }

    setPredictionError('');  // Clear previous error
    setIsPredictionLoading(true);

    try {
      // Use provided readings or fetch new ones
      let readings;
      if (readingsData) {
        readings = readingsData;
      } else {
        // Transform the existing month data
        readings = monthData.map(item => ({
          date: new Date(item.date).toISOString(),
          hours: parseFloat(item.hours)
        }));
      }

      // Send the request for goal prediction
      const predictionResponse = await axios.post(
        'http://localhost:5000/ai/predict-goal',
        {
          target_hours: targetHours,
          month_data: readings
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log("Prediction result:", predictionResponse.data);
      setGoalPrediction(predictionResponse.data);
    } catch (err) {
      console.error("Prediction Error:", err);
      setPredictionError(err.response?.data?.error || "Prediction failed. Please try again.");
    } finally {
      setIsPredictionLoading(false);
    }
  };
  */
  const handlePrediction = useCallback(async (readingsData = null) => {
    // Validate target hours first
    if (!targetHours || isNaN(targetHours) || targetHours <= 0) {
      setPredictionError("Please enter a valid target goal (positive number).");
      setGoalPrediction(null);
      return;
    }
  
    // Reset error state
    setPredictionError('');
    setIsPredictionLoading(true);
  
    try {
      // Prepare readings data
      const readings = readingsData || monthData.map(item => ({
        date: new Date(item.date).toISOString(),
        hours: parseFloat(item.hours) || 0 // Ensure numerical value
      }));
  
      // Make API call
      const predictionResponse = await axios.post(
        'http://localhost:5000/ai/predict-goal',
        {
          target_hours: Number(targetHours),
          month_data: readings.filter(r => !isNaN(r.hours)) // Clean data
        },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000 // Add timeout
        }
      );
  
      // Handle response
      if (predictionResponse.data?.projected_total) {
        setGoalPrediction({
          ...predictionResponse.data,
          timestamp: Date.now() // Add freshness marker
        });
      } else {
        throw new Error('Invalid prediction response format');
      }
    } catch (err) {
      console.error("Prediction Error:", err);
      const errorMessage = err.response?.data?.error || 
                          err.message || 
                          "Prediction failed. Please try again.";
      setPredictionError(errorMessage);
      setGoalPrediction(null);
    } finally {
      setIsPredictionLoading(false);
    }
  }, [targetHours, monthData]); // Dependencies
  
  // Usage in useEffect (if needed)
  useEffect(() => {
    // Example: Auto-run prediction when monthData changes
    if (targetHours > 0 && monthData.length > 0) {
      handlePrediction();
    }
  }, [monthData, targetHours,handlePrediction]);



  const getInsightIcon = (type) => {
    const icons = {
      consistency: '📊',
      trend: '📈',
      pattern: '📆',
      streak: '🔥',
      recommendation: '💡',
      error: '⚠️'
    };
    return icons[type] || '✨';
  };

  // Calculate prediction percentage
  const calculatePredictionPercentage = () => {
    if (!goalPrediction || !targetHours || targetHours <= 0) {
      return 0;
    }
    return Math.min(100, Math.max(0, (goalPrediction.projected_total / targetHours) * 100));
  };

  // Calculate current progress percentage
  const calculateCurrentPercentage = () => {
    if (!goalPrediction || !targetHours || targetHours <= 0) {
      return 0;
    }
    return Math.min(100, Math.max(0, (goalPrediction.current_hours / targetHours) * 100));
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow text-sm">
          <p className="font-semibold">{`Day ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value?.toFixed(1) || 0}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-8 border rounded-lg p-4 bg-white shadow">
      <h2 className="text-xl font-semibold mb-4">AI Insights and Goal Prediction</h2>

      {/* Display Error if any */}
      {error && <div className="text-red-500 py-2">{error}</div>}

      {/* Loading message */}
      {loading && <div className="text-center py-4">Analyzing your data...</div>}

      {/* Reading Insights Section
      
      */}
      
      
      
    
      {/*
  <div className="space-y-4 mt-4">
        <h3 className="font-semibold text-lg">AI Reading Insights</h3>
        {insights.map((insight, idx) => (
          <div key={idx} className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <span className="text-2xl mr-3">{getInsightIcon(insight.type)}</span>
              <div className="w-full">
                <h3 className="font-medium text-lg">{insight.title || 'Insight'}</h3>
                <p className="text-gray-700">{insight.message}</p>
                {typeof insight.score === 'number' && (
                  <div className="mt-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Confidence</span>
                      <span>{Math.min(100, Math.max(0, insight.score))}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                 
                      <div className="h-2 bg-blue-500 rounded-full"
     style={{ 
       width: `${Math.min(100, Math.max(5, insight.normalizedScore))}%`,
       transition: 'width 0.5s ease-in-out' 
     }}>
</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      */}





{/* Reading Insights Section */}
<div className="space-y-4 mt-4">
  <h3 className="font-semibold text-lg">AI Reading Insights</h3>
  {insights.map((insight, idx) => (
    <div key={idx} className="p-3 bg-blue-50 rounded-lg">
      <div className="flex items-start">
        <span className="text-2xl mr-3">{getInsightIcon(insight.type)}</span>
        <div className="w-full">
          <h3 className="font-medium text-lg">{insight.title || 'Insight'}</h3>
          <p className="text-gray-700">{insight.message}</p>
          {/* Optional: If you want to keep a subtle indication of confidence */}
          {typeof insight.score === 'number' && (
            <div className="mt-1 text-xs text-gray-600">
              Confidence: {Math.min(100, Math.max(0, insight.score))}%
            </div>
          )}
        </div>
      </div>
    </div>
  ))}
</div>















      {/* Prediction Section */}
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-2">Set Your Target Hours and Get AI Prediction</h3>

        <div className="mb-4">
          <input
            id="targetHours"
            type="number"
            className="mt-1 p-2 w-full border rounded-md"
            value={targetHours}
            onChange={(e) => {
              setTargetHours(e.target.value);
              // Clear prediction if target changes
              if (e.target.value !== targetHours) {
                setGoalPrediction(null);
              }
            }}
            placeholder="Enter your target hours"
          />
        </div>

        {/* Show error message if prediction fails */}
        {predictionError && <div className="text-red-500 py-2">{predictionError}</div>}

        <button
          onClick={() => handlePrediction()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          disabled={isPredictionLoading}
        >
          {isPredictionLoading ? "Loading Prediction..." : "Get Prediction"}
        </button>

        {/* Display prediction result */}
        {goalPrediction && goalPrediction.projected_total && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <h4 className="text-lg font-semibold">Prediction Result</h4>
            
            {/* Visualization Chart */}
            <div className="mt-4 border rounded bg-white p-2">
              <h5 className="text-sm font-medium mb-2">Reading Progress Visualization</h5>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="targetLine" 
                      stroke="#ff7300" 
                      name="Target Line" 
                      dot={false} 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cumulativeActual" 
                      stroke="#3b82f6" 
                      name="Actual Progress" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cumulativePredicted" 
                      stroke="#10b981" 
                      name="Projected Progress" 
                      strokeDasharray="5 5" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2">Daily Reading Hours</h5>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis allowDecimals={false} domain={[0, 10]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="actualHours" name="Actual Hours" fill="#3b82f6" />
                      <Bar dataKey="predictedHours" name="Recommended Hours" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Current Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Current Progress</span>
                <span>{calculateCurrentPercentage().toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${calculateCurrentPercentage()}%` }}
                ></div>
              </div>
              <p className="text-sm mt-1">
                Current Hours: <strong>{goalPrediction.current_hours}</strong> of {targetHours} target hours
              </p>
            </div>
            
            {/* Projection Progress */}
            <div className="mt-3">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Projected Completion</span>
                <span>{calculatePredictionPercentage().toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: `${calculatePredictionPercentage()}%` }}
                ></div>
              </div>
              <p className="text-sm mt-1">
                Projected Total Hours: <strong>{goalPrediction.projected_total}</strong> of {targetHours} target hours
              </p>
            </div>

            <div className="mt-3 p-2 bg-white rounded border border-green-200">
              <h5 className="text-sm font-medium">AI Recommendation</h5>
              <p className="text-sm mt-1">{goalPrediction.recommendation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

AIInsights.propTypes = {
  month: PropTypes.number.isRequired,
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default AIInsights;