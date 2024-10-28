// WeatherNotification.js
import React, { useState } from 'react';
import axios from 'axios';
import './WeatherNotification.css';

const WeatherNotification = () => {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [email, setEmail] = useState('');
  const [notificationSent, setNotificationSent] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    try {
      // Fetch weather data using Open-Meteo API
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&current_weather=true`
      );
      const data = response.data;

      // Extract the relevant data
      setWeatherData({
        temperature: data.current_weather.temperature.toFixed(1),
        condition: data.current_weather.weathercode >= 80 ? 'Rainy' : 'Clear',
      });

      // Check weather conditions for notifications
      checkWeatherConditions(data.current_weather.weathercode);

      // If it's rainy, send weather email notification
      if (data.current_weather.weathercode >= 80 && email) {
        sendWeatherEmail(data.current_weather.temperature);
      }
    } catch (error) {
      setError('Error fetching weather data.');
      console.error('Error fetching weather data:', error);
    }
  };

  const checkWeatherConditions = (weatherCode) => {
    const isRaining = weatherCode >= 80;
    if (isRaining && !notificationSent) {
      sendNotification();
      setNotificationSent(true);
    }
  };

  const sendWeatherEmail = async (temperature) => {
    try {
      await axios.post('http://localhost:8000/send-email', {
        email,
        location,
        temperature,
        condition: 'Rainy',
      });
      alert('Weather information sent to your email!');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const sendNotification = async () => {
    try {
      await axios.post('http://localhost:8000/send-email', {
        email,
        location,
      });
      setNotificationSent(true);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather();
  };

  return (
    <div className="weather-app">
      <h1 className="app-title">Weather Notification App</h1>
      <form onSubmit={handleSubmit} className="input-container">
        <input
          type="text"
          name="location"
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="input"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          required
        />
        <button type="submit" className="button">Check Weather & Get Notification</button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="weather-card">
        {weatherData ? (
          <>
            <p className="location">{location}</p>
            <p className="temperature">{weatherData.temperature}°C</p>
            <div className="weather-icon">
              {weatherData.condition === 'Rainy' ? (
                <i className="fa fa-cloud-rain" aria-hidden="true"></i>
              ) : (
                <i className="fa fa-sun" aria-hidden="true"></i>
              )}
            </div>
            <p className="description">{weatherData.condition}</p>
            {notificationSent ? (
              <p className="notification">🌧️ Notification sent!</p>
            ) : (
              <p className="notification">No rain expected today. ☀️</p>
            )}
          </>
        ) : (
          <p>Loading weather data...</p>
        )}
      </div>
    </div>
  );
};

export default WeatherNotification;
