/**
 * Flask Proxy Middleware
 * Centraliza todas as chamadas para o serviço Python Flask
 */

const axios = require('axios');

const flaskAPI = axios.create({
  baseURL: `http://${process.env.FLASK_HOST || 'localhost'}:${process.env.FLASK_PORT || 4000}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logging
flaskAPI.interceptors.request.use((config) => {
  console.log(`📤 [Flask Request] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

flaskAPI.interceptors.response.use(
  (response) => {
    console.log(`📥 [Flask Response] ${response.status} ${response.statusText}`);
    return response;
  },
  (error) => {
    console.error(`❌ [Flask Error] ${error.message}`);
    return Promise.reject(error);
  }
);

module.exports = { flaskAPI };
