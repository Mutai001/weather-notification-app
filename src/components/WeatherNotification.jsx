import { useState, useEffect } from 'react';

const WeatherNotification = () => {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('default');
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSearches, setShowSearches] = useState(false);
  const [unit, setUnit] = useState('celsius');
  const [time, setTime] = useState(new Date());
  
  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        console.error('Failed to parse saved searches');
      }
    }
  }, []);
  
  // Save recent searches to localStorage
  const saveSearch = (locationName) => {
    if (!locationName) return;
    
    const updatedSearches = [locationName, ...recentSearches.filter(s => s !== locationName)].slice(0, 5);
    setRecentSearches(updatedSearches);
    
    try {
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      console.error('Failed to save searches');
    }
  };

  const fetchWeather = async (searchLocation = location) => {
    setLoading(true);
    setError(null);
    setShowSearches(false);
    
    try {
      // First, get coordinates from location name using OpenCage Geocoding API
      const geocodeResponse = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(searchLocation)}&key=56049af666504f4cbd61f5fe2d1a26f1`
      );
      
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData.results.length === 0) {
        throw new Error('Location not found');
      }
      
      const { lat, lng } = geocodeData.results[0].geometry;
      
      // Fetch weather data using Open-Meteo API
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation,cloud_cover&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&timezone=auto`
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
      
      // Process daily data
      const dailyForecast = weatherData.daily.weather_code.map((code, index) => {
        let dailyIcon = '☀️';
        
        if (code >= 0 && code <= 3) {
          dailyIcon = '☀️';
        } else if (code >= 45 && code <= 48) {
          dailyIcon = '🌫️';
        } else if (code >= 51 && code <= 67) {
          dailyIcon = '🌧️';
        } else if (code >= 71 && code <= 77) {
          dailyIcon = '❄️';
        } else if (code >= 80 && code <= 99) {
          dailyIcon = '⛈️';
        }
        
        const date = new Date(weatherData.daily.time[index]);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        return {
          day,
          icon: dailyIcon,
          maxTemp: weatherData.daily.temperature_2m_max[index],
          minTemp: weatherData.daily.temperature_2m_min[index],
          precipitation: weatherData.daily.precipitation_sum[index]
        };
      });
      
      setTheme(newTheme);
      saveSearch(geocodeData.results[0].formatted);
      
      const sunriseTime = new Date(weatherData.daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const sunsetTime = new Date(weatherData.daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setWeatherData({
        temperature: weatherData.current.temperature_2m,
        feelsLike: weatherData.current.apparent_temperature,
        humidity: weatherData.current.relative_humidity_2m,
        precipitation: weatherData.current.precipitation,
        cloudCover: weatherData.current.cloud_cover,
        condition,
        icon,
        windSpeed: weatherData.current.wind_speed_10m,
        locationName: geocodeData.results[0].formatted,
        daily: dailyForecast,
        sunrise: sunriseTime,
        sunset: sunsetTime
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
  
  const toggleUnit = () => {
    setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius');
  };
  
  const convertTemp = (celsiusTemp) => {
    if (unit === 'fahrenheit') {
      return ((celsiusTemp * 9/5) + 32).toFixed(1);
    }
    return celsiusTemp.toFixed(1);
  };
  
  const unitSymbol = unit === 'celsius' ? '°C' : '°F';

  // Theme-based styles with fixed button colors
  const getThemeStyles = () => {
    const themes = {
      sunny: {
        gradientFrom: 'from-yellow-50',
        gradientTo: 'to-amber-200',
        accent: 'bg-amber-500',
        accentHover: 'hover:bg-amber-600',
        accentBorder: 'border-amber-600',
        text: 'text-amber-800',
        textAccent: 'text-amber-600',
        container: 'bg-white',
        weatherBox: 'bg-amber-50',
        shadow: 'shadow-amber-200',
        ring: 'ring-amber-400',
        borderAccent: 'border-amber-300'
      },
      rainy: {
        gradientFrom: 'from-cyan-50',
        gradientTo: 'to-teal-200',
        accent: 'bg-teal-500',
        accentHover: 'hover:bg-teal-600',
        accentBorder: 'border-teal-600',
        text: 'text-teal-800',
        textAccent: 'text-teal-600',
        container: 'bg-white',
        weatherBox: 'bg-teal-50',
        shadow: 'shadow-teal-200',
        ring: 'ring-teal-400',
        borderAccent: 'border-teal-300'
      },
      snowy: {
        gradientFrom: 'from-slate-50',
        gradientTo: 'to-indigo-200',
        accent: 'bg-indigo-500',
        accentHover: 'hover:bg-indigo-600',
        accentBorder: 'border-indigo-600',
        text: 'text-indigo-800',
        textAccent: 'text-indigo-600',
        container: 'bg-white',
        weatherBox: 'bg-indigo-50',
        shadow: 'shadow-indigo-200',
        ring: 'ring-indigo-400',
        borderAccent: 'border-indigo-300'
      },
      foggy: {
        gradientFrom: 'from-gray-50',
        gradientTo: 'to-slate-200',
        accent: 'bg-slate-500',
        accentHover: 'hover:bg-slate-600',
        accentBorder: 'border-slate-600',
        text: 'text-slate-800',
        textAccent: 'text-slate-600',
        container: 'bg-white',
        weatherBox: 'bg-slate-50',
        shadow: 'shadow-slate-200',
        ring: 'ring-slate-400',
        borderAccent: 'border-slate-300'
      },
      stormy: {
        gradientFrom: 'from-purple-50',
        gradientTo: 'to-violet-200',
        accent: 'bg-violet-500',
        accentHover: 'hover:bg-violet-600',
        accentBorder: 'border-violet-600',
        text: 'text-violet-800',
        textAccent: 'text-violet-600',
        container: 'bg-white',
        weatherBox: 'bg-violet-50',
        shadow: 'shadow-violet-200',
        ring: 'ring-violet-400',
        borderAccent: 'border-violet-300'
      },
      default: {
        gradientFrom: 'from-emerald-50',
        gradientTo: 'to-emerald-200',
        accent: 'bg-emerald-500',
        accentHover: 'hover:bg-emerald-600',
        accentBorder: 'border-emerald-600',
        text: 'text-emerald-800',
        textAccent: 'text-emerald-600',
        container: 'bg-white',
        weatherBox: 'bg-emerald-50',
        shadow: 'shadow-emerald-200',
        ring: 'ring-emerald-400',
        borderAccent: 'border-emerald-300'
      }
    };
    
    return themes[theme] || themes.default;
  };

  const styles = getThemeStyles();

  const getWeatherTip = () => {
    if (!weatherData) return null;
    
    const condition = weatherData.condition.toLowerCase();
    const temp = parseFloat(weatherData.temperature);
    
    if (condition.includes('rain') || condition.includes('storm')) {
      if (weatherData.precipitation > 5) {
        return {
          icon: '🌧️',
          text: 'Heavy rain expected! Take an umbrella and waterproof clothing.',
          color: styles.textAccent
        };
      } else {
        return {
          icon: '🌦️',
          text: 'Light rain expected. An umbrella might come in handy.',
          color: styles.textAccent
        };
      }
    } else if (condition.includes('snow')) {
      return {
        icon: '❄️',
        text: 'Snowy conditions! Bundle up, wear boots and drive carefully.',
        color: styles.textAccent
      };
    } else if (condition.includes('fog')) {
      return {
        icon: '🌫️',
        text: 'Foggy conditions! Turn on fog lights and drive slowly.',
        color: styles.textAccent
      };
    } else if (condition.includes('clear') && temp > 28) {
      return {
        icon: '🥵',
        text: 'Very hot outside! Stay hydrated and avoid prolonged sun exposure.',
        color: styles.textAccent
      };
    } else if (condition.includes('clear') && temp > 22) {
      return {
        icon: '😎',
        text: 'Perfect warm weather! Great time to enjoy outdoor activities.',
        color: styles.textAccent
      };
    } else if (condition.includes('clear') && temp < 10) {
      return {
        icon: '🧣',
        text: 'Chilly conditions! Bundle up with warm layers.',
        color: styles.textAccent
      };
    } else if (condition.includes('clear') && temp < 0) {
      return {
        icon: '🥶',
        text: 'Freezing outside! Wear proper winter clothing and limit exposure.',
        color: styles.textAccent
      };
    } else if (weatherData.windSpeed > 20) {
      return {
        icon: '💨',
        text: 'Windy conditions! Secure loose objects outdoors.',
        color: styles.textAccent
      };
    } else {
      return {
        icon: '✨',
        text: 'Pleasant weather conditions! Enjoy your day.',
        color: styles.textAccent
      };
    }
  };

  const tip = getWeatherTip();
  
  const isDaytime = () => {
    if (!weatherData) return true;
    
    const now = time;
    const sunrise = new Date();
    const sunset = new Date();
    
    const [sunriseHours, sunriseMinutes] = weatherData.sunrise.split(':').map(Number);
    const [sunsetHours, sunsetMinutes] = weatherData.sunset.split(':').map(Number);
    
    sunrise.setHours(sunriseHours, sunriseMinutes);
    sunset.setHours(sunsetHours, sunsetMinutes);
    
    return now >= sunrise && now <= sunset;
  };
  
  const timeDisplay = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateDisplay = time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b ${styles.gradientFrom} ${styles.gradientTo} transition-all duration-500`}>
      <div className={`w-full max-w-md p-6 ${styles.container} rounded-3xl shadow-xl transform transition-all duration-300 hover:scale-102 ${styles.shadow} border ${styles.borderAccent}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${styles.text}`}>
            Weatherly
            <span className="hidden sm:inline text-lg ml-2 opacity-75">| Forecast</span>
          </h1>
          <div className={`px-3 py-1 rounded-full ${styles.weatherBox} ${styles.text} text-sm font-medium`}>
            {timeDisplay}
          </div>
        </div>
        
        <div className="text-sm text-gray-500 mb-4">{dateDisplay}</div>
        
        <form onSubmit={handleSubmit} className="mb-6 relative">
          <div className="flex flex-col mb-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => setShowSearches(true)}
                className={`px-4 py-3 border ${styles.borderAccent} rounded-xl w-full focus:outline-none focus:ring-2 ${styles.ring} shadow-sm pl-10`}
                required
              />
              <span className="absolute left-3 top-3 text-gray-400">📍</span>
            </div>
          </div>
          
          {showSearches && recentSearches.length > 0 && (
            <div className={`absolute w-full z-10 mt-1 bg-white rounded-xl shadow-md border ${styles.borderAccent} overflow-hidden`}>
              <div className="p-2 text-xs text-gray-500 border-b">Recent searches</div>
              {recentSearches.map((search, idx) => (
                <div 
                  key={idx} 
                  className="p-3 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => {
                    setLocation(search);
                    setShowSearches(false);
                    fetchWeather(search);
                  }}
                >
                  <span className="text-gray-400 mr-2">🔍</span>
                  {search}
                </div>
              ))}
            </div>
          )}
          
          <button 
            type="submit"
            className={`w-full px-4 py-3 text-white ${styles.accent} ${styles.accentHover} rounded-xl focus:outline-none focus:ring-2 ${styles.ring} transition duration-300 font-medium shadow-md border ${styles.accentBorder}`}
            disabled={loading}
          >
            {loading ? 'Finding Weather...' : 'Get Weather'}
          </button>
        </form>
        
        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-50 rounded-xl border border-red-200 shadow-sm">
            <div className="flex items-center">
              <span className="text-2xl mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {weatherData && (
          <div className={`flex flex-col items-center p-6 ${styles.weatherBox} rounded-xl transition-all duration-500 ease-in-out transform border ${styles.borderAccent}`}>
            <div className="w-full flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-800 truncate">{weatherData.locationName}</h2>
              <button 
                onClick={toggleUnit}
                className={`text-xs font-medium ${styles.textAccent} px-2 py-1 rounded-full bg-white shadow-sm border ${styles.borderAccent}`}
              >
                {unit === 'celsius' ? 'Switch to °F' : 'Switch to °C'}
              </button>
            </div>
            
            <div className="w-full flex justify-between items-start mt-2">
              <div className="flex flex-col items-start">
                <span className="text-7xl">{weatherData.icon}</span>
                <span className="text-lg font-medium mt-2">{weatherData.condition}</span>
              </div>
              
              <div className="flex flex-col items-end">
                <span className="text-5xl font-bold">{convertTemp(weatherData.temperature)}{unitSymbol}</span>
                <span className="text-sm mt-1 text-gray-500">
                  Feels like: {convertTemp(weatherData.feelsLike)}{unitSymbol}
                </span>
              </div>
            </div>
            
            <div className="w-full grid grid-cols-3 gap-3 mt-6">
              <div className={`p-3 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center border ${styles.borderAccent}`}>
                <span className="text-lg mb-1">💧</span>
                <span className="text-xs text-gray-500">Humidity</span>
                <span className="font-medium">{weatherData.humidity}%</span>
              </div>
              <div className={`p-3 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center border ${styles.borderAccent}`}>
                <span className="text-lg mb-1">💨</span>
                <span className="text-xs text-gray-500">Wind</span>
                <span className="font-medium">{weatherData.windSpeed} km/h</span>
              </div>
              <div className={`p-3 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center border ${styles.borderAccent}`}>
                <span className="text-lg mb-1">☁️</span>
                <span className="text-xs text-gray-500">Clouds</span>
                <span className="font-medium">{weatherData.cloudCover}%</span>
              </div>
            </div>
            
            <div className="w-full flex justify-between items-center mt-6 mb-4">
              <div className={`flex items-center px-3 py-2 bg-white rounded-lg shadow-sm border ${styles.borderAccent}`}>
                <span className="text-amber-500 mr-1">🌅</span>
                <span className="text-sm">{weatherData.sunrise}</span>
              </div>
              <div className="h-px w-16 bg-gray-200"></div>
              <div className={`flex items-center px-3 py-2 bg-white rounded-lg shadow-sm border ${styles.borderAccent}`}>
                <span className="text-indigo-500 mr-1">🌇</span>
                <span className="text-sm">{weatherData.sunset}</span>
              </div>
            </div>
            
            <div className={`mt-4 p-4 bg-white rounded-xl shadow-sm w-full border ${styles.borderAccent}`}>
              <div className={`flex items-center ${tip.color}`}>
                <span className="text-2xl mr-3">{tip.icon}</span>
                <p className="font-medium text-sm">{tip.text}</p>
              </div>
            </div>
            
            <div className="w-full mt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className={`font-medium ${styles.text}`}>5-Day Forecast</h3>
                <span className="text-xs text-gray-500">{isDaytime() ? 'Day' : 'Night'}</span>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {weatherData.daily.map((day, index) => (
                  <div key={index} className={`p-2 bg-white rounded-lg shadow-sm flex flex-col items-center border ${styles.borderAccent}`}>
                    <span className="text-xs font-medium">{day.day}</span>
                    <span className="text-xl my-1">{day.icon}</span>
                    <div className="flex justify-between w-full text-xs">
                      <span className="text-gray-500">{convertTemp(day.minTemp)}°</span>
                      <span className="font-medium">{convertTemp(day.maxTemp)}°</span>
                    </div>
                    {day.precipitation > 0 && (
                      <div className="mt-1 flex items-center text-xs text-blue-500">
                        <span className="mr-1">💧</span>
                        <span>{day.precipitation}mm</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {!weatherData && !loading && !error && (
          <div className={`flex flex-col items-center justify-center p-8 ${styles.weatherBox} rounded-xl border ${styles.borderAccent}`}>
            <div className="relative w-32 h-32 mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl animate-pulse">🌤️</span>
              </div>
              <div className="absolute inset-0 animate-spin opacity-10">
                <div className="h-full w-full rounded-full border-t-4 border-b-4 border-gray-300"></div>
              </div>
            </div>
            <p className="text-center text-gray-600">Enter a location to get the latest weather updates</p>
            <p className="text-center text-gray-400 text-sm mt-2">Real-time data with advanced forecasting</p>
          </div>
        )}
        
        <div className="mt-6 flex justify-between items-center text-xs text-gray-400">
          <p>Weather data: Open-Meteo</p>
          <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full ${loading ? 'bg-green-500 animate-pulse' : 'bg-gray-300'} mr-1`}></span>
            <p>{loading ? 'Updating...' : 'Updated'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherNotification;