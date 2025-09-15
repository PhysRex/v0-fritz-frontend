<script>
import axios from 'axios';

// Create axios instance with base URL and default headers
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  // Login user
  login(credentials) {
    return apiClient.post('/auth/login', credentials);
  },
  
  // Get current user
  getCurrentUser() {
    return apiClient.get('/auth/me');
  }
};

// Games API
export const gamesApi = {
  // Get all games for current user
  getGames() {
    return apiClient.get('/games');
  },
  
  // Get a specific game by ID
  getGame(gameId) {
    return apiClient.get(`/games/${gameId}`);
  },
  
  // Create a new game
  createGame(data) {
    return apiClient.post('/games', data);
  },
  
  // Submit a turn for a game
  submitTurn(gameId, tileSelections) {
    return apiClient.post(`/games/${gameId}/turns`, { tiles: tileSelections });
  },
  
  // Save notes for a game
  saveNotes(gameId, notes) {
    return apiClient.put(`/games/${gameId}/notes`, { notes });
  },
  
  // Get game history (turns)
  getGameHistory(gameId, page = 1, limit = 25) {
    return apiClient.get(`/games/${gameId}/turns`, {
      params: { page, limit }
    });
  }
};

// Boards API
export const boardsApi = {
  // Get all available boards
  getBoards() {
    return apiClient.get('/boards');
  },
  
  // Get a specific board by ID
  getBoard(boardId) {
    return apiClient.get(`/boards/${boardId}`);
  }
};

// Social API (feature flagged)
export const socialApi = {
  // Get friend activity
  getFriendActivity() {
    return apiClient.get('/social/activity');
  }
};
</script>
