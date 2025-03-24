export const GlobalComponent = {
  // API URL
  API_URL: 'http://localhost:3000/api/',
  
  // Otros valores globales
  headerToken: {'Authorization': `Bearer ${localStorage.getItem('token')}`},
}; 