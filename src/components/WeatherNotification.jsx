import { useState } from 'react';

const WeatherNotification = () => {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('default');

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, get coordinates from location name using OpenCage Geocoding API
      const geocodeResponse = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=56049af666504f4cbd61f5fe2d1a26f1`
      );
      
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData.results.length === 0) {
        throw new Error('Location not found');
      }
      
      const { lat, lng } = geocodeData.results[0].geometry;
      
      // Fetch weather data using Open-Meteo API
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
      );
      
      const weatherData = await weatherResponse.json();
      
      // Map weather code to condition
      const weatherCode = weatherData.current.weather_code;
      let condition = 'Clear';
      let icon = '☀️';
      let newTheme = 'sunny';
      
      if (weatherCode >= 0 && weatherCode <= 3) {
        condition = 'Clear';
        icon = '☀️';
        newTheme = 'sunny';
      } else if (weatherCode >= 45 && weatherCode <= 48) {
        condition = 'Foggy';
        icon = '🌫️';
        newTheme = 'foggy';
      } else if (weatherCode >= 51 && weatherCode <= 67) {
        condition = 'Rainy';
        icon = '🌧️';
        newTheme = 'rainy';
      } else if (weatherCode >= 71 && weatherCode <= 77) {
        condition = 'Snowy';
        icon = '❄️';
        newTheme = 'snowy';
      } else if (weatherCode >= 80 && weatherCode <= 99) {
        condition = 'Stormy';
        icon = '⛈️';
        newTheme = 'stormy';
      }
      
      setTheme(newTheme);
      setWeatherData({
        temperature: weatherData.current.temperature_2m.toFixed(1),
        condition,
        icon,
        windSpeed: weatherData.current.wind_speed_10m.toFixed(1),
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

  // Theme-based styles
  const getThemeStyles = () => {
    switch(theme) {
      case 'sunny':
        return {
          gradientFrom: 'from-amber-100',
          gradientTo: 'to-orange-200',
          accent: 'amber-500',
          accentHover: 'amber-600',
          text: 'text-amber-800',
          container: 'bg-white',
          weatherBox: 'bg-amber-50',
          shadow: 'shadow-amber-200'
        };
      case 'rainy':
        return {
          gradientFrom: 'from-teal-100',
          gradientTo: 'to-emerald-200',
          accent: 'teal-500',
          accentHover: 'teal-600',
          text: 'text-teal-800',
          container: 'bg-white',
          weatherBox: 'bg-teal-50',
          shadow: 'shadow-teal-200'
        };
      case 'snowy':
        return {
          gradientFrom: 'from-indigo-100',
          gradientTo: 'to-purple-200',
          accent: 'indigo-500',
          accentHover: 'indigo-600',
          text: 'text-indigo-800',
          container: 'bg-white',
          weatherBox: 'bg-indigo-50',
          shadow: 'shadow-indigo-200'
        };
      case 'foggy':
        return {
          gradientFrom: 'from-gray-100',
          gradientTo: 'to-slate-200',
          accent: 'slate-500',
          accentHover: 'slate-600',
          text: 'text-slate-800',
          container: 'bg-white',
          weatherBox: 'bg-slate-50',
          shadow: 'shadow-slate-200'
        };
      case 'stormy':
        return {
          gradientFrom: 'from-violet-100',
          gradientTo: 'to-slate-300',
          accent: 'violet-500',
          accentHover: 'violet-600',
          text: 'text-violet-800',
          container: 'bg-white',
          weatherBox: 'bg-violet-50',
          shadow: 'shadow-violet-200'
        };
      default:
        return {
          gradientFrom: 'from-emerald-100',
          gradientTo: 'to-teal-200',
          accent: 'emerald-500',
          accentHover: 'emerald-600',
          text: 'text-emerald-800',
          container: 'bg-white',
          weatherBox: 'bg-emerald-50',
          shadow: 'shadow-emerald-200'
        };
    }
  };

  const styles = getThemeStyles();

  const getWeatherTip = () => {
    if (!weatherData) return null;
    
    const condition = weatherData.condition.toLowerCase();
    
    if (condition.includes('rain') || condition.includes('storm')) {
      return {
        icon: '🌧️',
        text: 'Rainy weather alert! Don\'t forget your umbrella.',
        color: 'text-teal-600'
      };
    } else if (condition.includes('snow')) {
      return {
        icon: '❄️',
        text: 'Snowy conditions! Bundle up and drive carefully.',
        color: 'text-indigo-600'
      };
    } else if (condition.includes('fog')) {
      return {
        icon: '🌫️',
        text: 'Foggy conditions! Take care while driving.',
        color: 'text-slate-600'
      };
    } else if (condition.includes('clear') && parseFloat(weatherData.temperature) > 25) {
      return {
        icon: '🥵',
        text: 'It\'s hot out there! Stay hydrated and find shade.',
        color: 'text-amber-600'
      };
    } else if (condition.includes('clear') && parseFloat(weatherData.temperature) < 10) {
      return {
        icon: '🧣',
        text: 'It\'s chilly! Remember to dress warmly.',
        color: 'text-indigo-600'
      };
    } else {
      return {
        icon: '☀️',
        text: 'Pleasant weather! Enjoy your day outdoors.',
        color: 'text-amber-600'
      };
    }
  };

  const tip = getWeatherTip();

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b ${styles.gradientFrom} ${styles.gradientTo}`}>
      <div className={`w-full max-w-md p-6 ${styles.container} rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-102 ${styles.shadow}`}>
        <h1 className={`text-3xl font-bold text-center ${styles.text} mb-6`}>
          Weatherly
          <span className="text-lg ml-2 opacity-75">| Your Daily Forecast</span>
        </h1>
        
        <form onSubmit={handleSubmit} className="mb-6 relative">
          <div className="flex flex-col mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter location (city, address)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`px-4 py-3 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-${styles.accent} shadow-sm pl-10`}
                required
              />
              <span className="absolute left-3 top-3 text-gray-400">📍</span>
            </div>
          </div>
          
          <button 
            type="submit"
            className={`w-full px-4 py-3 text-white bg-${styles.accent} rounded-xl hover:bg-${styles.accentHover} focus:outline-none focus:ring-2 focus:ring-${styles.accent} transition duration-300 font-medium shadow-md`}
            disabled={loading}
          >
            {loading ? 'Finding Weather...' : 'Get Weather'}
          </button>
        </form>
        
        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-xl border border-red-200 shadow-sm">
            <div className="flex items-center">
              <span className="text-2xl mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {weatherData && (
          <div className={`flex flex-col items-center p-6 ${styles.weatherBox} rounded-xl transition-all duration-500 ease-in-out transform`}>
            <div className="w-full flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 truncate">{weatherData.locationName}</h2>
              <span className="text-sm text-gray-500">Now</span>
            </div>
            
            <div className="flex items-center justify-center w-full">
              <div className="flex flex-col items-center mr-6">
                <span className="text-7xl mb-2">{weatherData.icon}</span>
                <span className="text-lg font-medium">{weatherData.condition}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-5xl font-bold">{weatherData.temperature}°C</span>
                <span className="text-sm mt-2 text-gray-500">
                  Wind: {weatherData.windSpeed} km/h
                </span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white rounded-xl shadow-sm w-full">
              <div className={`flex items-center ${tip.color}`}>
                <span className="text-2xl mr-3">{tip.icon}</span>
                <p className="font-medium">{tip.text}</p>
              </div>
            </div>
            
            <div className="w-full mt-6 grid grid-cols-3 gap-2 text-center">
              {['Morning', 'Afternoon', 'Evening'].map((time, index) => (
                <div key={index} className="p-3 bg-white rounded-lg shadow-sm flex flex-col items-center">
                  <span className="text-sm text-gray-500">{time}</span>
                  <span className="text-lg mt-1">{weatherData.icon}</span>
                  <span className="font-medium mt-1">
                    {(parseFloat(weatherData.temperature) + (index - 1) * 2).toFixed(1)}°
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!weatherData && !loading && !error && (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <span className="text-6xl mb-4">🌤️</span>
            <p className="text-center">Enter a location to get the latest weather updates</p>
          </div>
        )}
        
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Powered by Open-Meteo & OpenCage APIs</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherNotification;