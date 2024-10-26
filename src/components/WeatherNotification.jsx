import React, { useState, useEffect } from 'react';
// import 'font-awesome/css/font-awesome.min.css'; // Import Font Awesome
import './WeatherNotification.css'; // Import custom styles

const WeatherNotification = () => {
  const [weatherData, setWeatherData] = useState({
    name: 'London',
    main: { temp: 280 }, // Example temperature in Kelvin
    weather: [{ description: 'light rain', main: 'Rain' }],
  });
  const [notificationSent, setNotificationSent] = useState(false);

  // Simulate fetching weather data
  const fetchWeather = () => {
    setWeatherData({
      name: 'London',
      main: { temp: 280 }, // Example temperature in Kelvin
      weather: [{ description: 'light rain', main: 'Rain' }],
    });
    checkWeatherConditions({
      name: 'London',
      main: { temp: 280 },
      weather: [{ description: 'light rain', main: 'Rain' }],
    });
  };

  // Check weather conditions
  const checkWeatherConditions = (data) => {
    const isRaining = data.weather.some((condition) => condition.main.toLowerCase() === 'rain');
    if (isRaining && !notificationSent) {
      setNotificationSent(true); // Simulate notification sending
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <div className="weather-app">
      <h1 className="app-title">Weather Notification App</h1>
      <div className="weather-card">
        <p className="location">{weatherData.name}</p>
        <p className="temperature">{(weatherData.main.temp - 273.15).toFixed(1)}°C</p>
        <div className="weather-icon">
          {weatherData.weather[0].main.toLowerCase() === 'rain' ? (
            <i className="fa fa-cloud-rain" aria-hidden="true"></i>
          ) : (
            <i className="fa fa-sun" aria-hidden="true"></i>
          )}
        </div>
        <p className="description">{weatherData.weather[0].description}</p>
        {notificationSent ? (
          <p className="notification">🌧️ Notification sent!</p>
        ) : (
          <p className="notification">No rain expected today. ☀️</p>
        )}
      </div>
    </div>
  );
};

export default WeatherNotification;
