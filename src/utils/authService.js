import { getToken, setToken, removeToken } from './tokenService';

const BASE_URL =  import.meta.env.VITE_API_URL;

/**
 * Logs in a user by sending email and password to the API.
 * Handles server responses including errors (500, 400) and 
 * decodes the JWT access token on success.
 * @param email - user's email.
 * @param password - user's password.
 * @returns the server response data.
 * @throws error if there is a 500 or 400 error with specific details.
 */
export const login = async (email, password) => {
  const request = new Request(`${BASE_URL}/user/login`, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const response = await fetch(request);

  if (response.status === 500) {
    throw new Error('Internal server error');
  }

  const data = await response.json();

  if (response.status >= 400 && response.status < 500) {
    if (data.detail) {
      throw data.detail;
    }
    throw data;
  }

  if ('access_token' in data) {
    localStorage.setItem('access_token', data['access_token']);
    localStorage.setItem('user', JSON.stringify({
      id: data.id,
      full_name: data.full_name,
      role_id: data.role_id,
      is_disabled: data.is_disabled
    }));
  }
  return data
};


/**
 * Registers a new user with provided personal info and passwords.
 * Sends data to the signup endpoint and handles server responses,
 * including error handling for 500 and 400 status codes.
 * On success, decodes and stores JWT token and user permissions.
 * @params 5: no details, the names are intuitives
 * @returns the parsed JSON response from the API.
 * @throws throws errors with detailed messages if applicable.
 */
export const register = async (name, lastname, email, password) => {
  const formData = {
    "name": name,
    "lastname": lastname,
    "email": email,
    "password": password,
  }

  const request = new Request(`${BASE_URL}/user/create-user`, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  const response = await fetch(request);
  
  if (response.status === 500) {
    throw new Error('Internal server error');
  }
  
  const data = await response.json();

  if (response.status >= 400 && response.status < 500) {
    if (data.detail) {
      throw data.detail;
    }
    throw data;
  }
  return data;
};

/**
 * Logs out the user by removing stored token and permissions.
 * Executes a callback function after cleanup (commonly for redirect).
 */
export const logout = () => {
  localStorage.clear();
};

/**
 * Retrieves the authenticated user's data by sending a GET request
 * with the stored access token in the authorization header.
 * @returns the user data as parsed JSON.
 */
export const getUser = async () => {
  const token = localStorage.getItem('access_token');
  
  const request = new Request(`${BASE_URL}/auth/users/me`, {
    method: 'GET',
    headers: {'Authorization': `Bearer ${token}`}
  });
  
  const response = await fetch(request);
  const data = await response.json();
  return data
};

/**
 * Checks if the user is currently authenticated by verifying
 * the presence of an access token in local storage.
 * @returns true if an access token is ok, false otherwise
 */
export const isAuthenticated = () => {
  return !!getToken();
};



