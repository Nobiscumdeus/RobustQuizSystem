






import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [monthData, setMonthData] = useState([]);

  // Memoize transformation of month data
  const transformedReadings = useMemo(() => 
    monthData.map(item => ({
      date: new Date(item.date).toISOString(),
      hours: parseFloat(item.hours)
    })), 
    [monthData]
  );

  // Prepare Chart Data
  const prepareChartData = useCallback((data) => {
    if (!data || data.length === 0) return;
    
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const chartDataArray = sortedData.map(item => {
      const day = new Date(item.date).getDate();
      return {
        day,
        date: new Date(item.date).toLocaleDateString(),
        actualHours: parseFloat(item.hours),
        predictedHours: 0
      };
    });
    
    setChartData(chartDataArray);
  }, []);

  // Update Chart with Prediction
  const updateChartWithPrediction = useCallback(() => {
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
  }, [goalPrediction, monthData, targetHours]);

  // Consolidated prediction handler with stable dependencies
  const handlePrediction = useCallback(async () => {
    if (!targetHours || isNaN(targetHours) || targetHours <= 0) {
      setPredictionError("Please enter a valid target goal (positive number).");
      setGoalPrediction(null);
      return;
    }

    setPredictionError('');
    setIsPredictionLoading(true);

    try {
      const predictionResponse = await axios.post(
        'http://localhost:5000/ai/predict-goal',
        {
          target_hours: targetHours,
          month_data: transformedReadings
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setGoalPrediction(predictionResponse.data);
    } catch (err) {
      setPredictionError(err.response?.data?.error || "Prediction failed. Please try again.");
    } finally {
      setIsPredictionLoading(false);
    }
  }, [targetHours, transformedReadings]);

  // Memoized data fetching
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dataResponse = await axios.get(`http://localhost:5000/api/data/${month}`);
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

      const analysisResponse = await axios.post(
        'http://localhost:5000/ai/analyze',
        {
          month: month,
          readings: transformedReadings
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setInsights(analysisResponse.data.insights || []);
      prepareChartData(dataResponse.data);
      
      if (targetHours && !isNaN(targetHours) && targetHours > 0) {
        handlePrediction();
      }
    } catch (err) {
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
  }, [month, targetHours, handlePrediction, transformedReadings, prepareChartData]);

  // Insight Icon Helper
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

  // Memoized calculation methods to prevent unnecessary re-renders
  const calculatePredictionPercentage = useMemo(() => {
    if (!goalPrediction || !targetHours || targetHours <= 0) return 0;
    return Math.min(100, Math.max(0, (goalPrediction.projected_total / targetHours) * 100));
  }, [goalPrediction, targetHours]);

  const calculateCurrentPercentage = useMemo(() => {
    if (!goalPrediction || !targetHours || targetHours <= 0) return 0;
    return Math.min(100, Math.max(0, (goalPrediction.current_hours / targetHours) * 100));
  }, [goalPrediction, targetHours]);

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

  // UseEffects
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (goalPrediction) {
      updateChartWithPrediction();
    }
  }, [goalPrediction, updateChartWithPrediction]);

 
  // Return part to be added by you
  // (......you can leave....)
  
    return (
      // Existing return statement remains unchanged
         <div className="mt-8 border rounded-lg p-4 bg-white shadow">
            <h2 className="text-xl font-semibold mb-4">AI Insights and Goal Prediction</h2>
      
            {/* Display Error if any */}
            {error && <div className="text-red-500 py-2">{error}</div>}
      
            {/* Loading message */}
            {loading && <div className="text-center py-4">Analyzing your data...</div>}
      
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
                      {typeof insight.score === 'number' && (
                        <div className="mt-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Confidence</span>
                            <span>{Math.min(100, Math.max(0, insight.score))}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full">
                           {/*}
                            <div
                              className="h-2 bg-blue-500 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(5, insight.normalizedScore))}%` }}
                              
                                  // style={{ width: `${Math.min(100, Math.max(5, insight.score))}%` }}
                                  
                             
                            ></div> */}
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