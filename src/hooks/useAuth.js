import { useNavigate } from "react-router-dom"
import { useState } from "react"
import * as authService from "../utils/authService"

/**
 * This file useAuth is a Custom React hook to manage user authentication state and actions.
 * This hook relies on an `auth` API module to perform authentication requests:
 * - `auth.login(email, password)` to authenticate users and receive an access token.
 * - `auth.register(name, lastname, email, password)` to register new users.
 * 
 * Provides:
 * - login: authenticate user with email and password, stores token, navigates on success.
 * - signUp: register new user and automatically logs them in.
 * - logout: clears authentication data and redirects to login page.
 * - error: contains authentication error messages if any.
 * - isLoading: indicates if an authentication request is in progress.
 * - user: stores user info (currently placeholder).
 * - resetError: clears any existing error.
 */
const useAuth = () => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const login = async (loginData) => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.login(loginData.email, loginData.password)
      navigate("/")
    } catch (err) {
        if (typeof err === "string") {
          console.log("#")
          setError(err);
        } else {
          setError("Fallo iniciando sesión");
        }
      } finally {
        setIsLoading(false)
      }
  }

  const signUp = async (signUpData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authService.register(
        signUpData.name,
        signUpData.lastname, 
        signUpData.email,
        signUpData.password,
      )
      if (response.email) {
        // autologin after successful registration
        await login({ email: signUpData.email, password: signUpData.password })
        return response
      }
    } catch (err) {
      setError(err.message || "Error durante el registro de usuario")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      authService.logout();
      navigate("/login")
    } catch (err) {
      console.log(err)
    }
    setIsLoading(false)
  }

  return {
    login,
    signUp,
    logout,
    error,
    isLoading,
    resetError: () => setError(null),
  }
}

export default useAuth
