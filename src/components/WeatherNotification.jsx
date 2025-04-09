import  { useState } from 'react';

const WeatherNotification = () => {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, get coordinates from location name using OpenCage Geocoding API (free)
      const geocodeResponse = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=56049af666504f4cbd61f5fe2d1a26f1`
      );
      
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData.results.length === 0) {
        throw new Error('Location not found');
      }
      
      const { lat, lng } = geocodeData.results[0].geometry;
      
      // Fetch weather data using Open-Meteo API (free, no API key required)
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=auto`
      );
      
      const weatherData = await weatherResponse.json();
      
      // Map weather code to condition
      const weatherCode = weatherData.current.weather_code;
      let condition = 'Clear';
      let icon = '☀️';
      
      if (weatherCode >= 0 && weatherCode <= 3) {
        condition = 'Clear';
        icon = '☀️';
      } else if (weatherCode >= 45 && weatherCode <= 48) {
        condition = 'Foggy';
        icon = '🌫️';
      } else if (weatherCode >= 51 && weatherCode <= 67) {
        condition = 'Rainy';
        icon = '🌧️';
      } else if (weatherCode >= 71 && weatherCode <= 77) {
        condition = 'Snowy';
        icon = '❄️';
      } else if (weatherCode >= 80 && weatherCode <= 99) {
        condition = 'Stormy';
        icon = '⛈️';
      }
      
      setWeatherData({
        temperature: weatherData.current.temperature_2m.toFixed(1),
        condition,
        icon,
        locationName: geocodeData.results[0].formatted
      });
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Error fetching weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (location.trim()) {
      fetchWeather();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-blue-100 to-blue-200">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Weather App</h1>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex flex-col mb-4">
            <input
              type="text"
              placeholder="Enter location (city, address)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button 
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            disabled={loading}
          >
            {loading ? 'Checking Weather...' : 'Check Weather'}
          </button>
        </form>
        
        {error && (
          <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        {weatherData && (
          <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{weatherData.locationName}</h2>
            
            <div className="flex items-center justify-center mb-4">
              <span className="text-5xl mr-2">{weatherData.icon}</span>
              <span className="text-4xl font-bold">{weatherData.temperature}°C</span>
            </div>
            
            <p className="text-lg text-gray-700">{weatherData.condition}</p>
            
            <div className="mt-4 p-3 bg-white rounded-md shadow-sm w-full text-center">
              {weatherData.condition.toLowerCase().includes('rain') ? (
                <p className="text-blue-600">🌧️ Rainy weather alert! Don&apos;t forget your umbrella.</p>
              ) : (
                <p className="text-yellow-600">☀️ No rain expected. Enjoy your day!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherNotification;