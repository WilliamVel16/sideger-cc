import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FormControl, FormHelperText, InputLabel, OutlinedInput, InputAdornment, Button, Container, Typography, Box } from "@mui/material";
import { FiMail, FiLock } from "react-icons/fi";
import useAuth from "../hooks/useAuth";
import Logo from "../assets/logo-secondary.png"
import { emailPattern, passwordRules } from "../utils";


/**
 * This login component renders a login form that allows users to authenticate using their email and password.
 * It leverages React Hook Form for form state management and validation, Chakra UI for styling,
 * and a custom authentication hook for handling the login process.
 * 
 * Features:
 * - email and password input fields with validation rules:
 *   - email must be in valid email format.
 *   - password must satisfy the rules defined in `passwordRules`.
 * - displays error messages for validation errors and authentication failures.
 * - shows a loading state while submitting.
 * - provides links to password recovery and signup pages.
 * 
 * Usage:
 * The form calls the `login` method from the `useAuth` hook upon submission.
 * Handles various error scenarios and displays appropriate messages.
 * 
 * Dependencies:
 * - react Hook Form for form handling.
 * - chakra UI components for UI elements.
 * - react Router for navigation links.
 * - react Icons for input adornments.
 * 
 * @returns JSX.Element representing the login form.
 */
export default function Login() {
  const { login, error: authError, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data);
    } catch (_) {
      // useAuth manages errors
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: "url('/tauri.svg')",  
        backgroundSize: "cover",               
        backgroundPosition: "center",          
        backgroundRepeat: "no-repeat",
      }}
    >
      <Container
        maxWidth="sm" 
        sx={{
          height: '80vh',
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'stretch', 
          gap: 2, 
          bgcolor: "rgba(255,255,255,0.95)", 
          p:4, 
          borderRadius: 30, 
          boxShadow: 3,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <img src={Logo} alt="Logo" style={{ maxWidth: 120, borderRadius: "12px", }} />
        </Box>

        {authError && (
          <Typography color="error" variant="body2" textAlign="center">
            {authError}
          </Typography>
        )}

        {/** email */}
        <FormControl fullWidth variant="outlined" error={!!errors.email}>
          <InputLabel htmlFor="email">Correo</InputLabel>
          <OutlinedInput
            id="email"
            type="email"
            {...register("email", {
              required: "El correo es requerido",
              pattern: { value: emailPattern.value, message: "Ingrese un correo válido" }
            })}
            startAdornment={
              <InputAdornment position="start">
                <FiMail />
              </InputAdornment>
            }
            label="Correo"
          />
          <FormHelperText>{errors.email?.message}</FormHelperText>
        </FormControl>
        
        {/** pass */}
        <FormControl fullWidth variant="outlined" error={!!errors.password}>
          <InputLabel htmlFor="password">Contraseña</InputLabel>
          <OutlinedInput
            id="password"
            type="password"
            {...register("password", passwordRules())}
            startAdornment={
              <InputAdornment position="start">
                <FiLock />
              </InputAdornment>
            }
            label="Contraseña"
          />
          <FormHelperText>{errors.password?.message}</FormHelperText>
        </FormControl>

        <RouterLink to="/recover-password" style={{ textDecoration: 'none', marginBottom: 8 }}>
          <Typography variant="body2" color="primary">¿Olvidó su contraseña?</Typography>
        </RouterLink>

        <Button
          variant="contained"
          color="error"
          type="submit"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || isLoading}
          sx={{ alignSelf: "center", width: "50%" }}
        >
          {isSubmitting || isLoading ? "Cargando..." : "Iniciar Sesión"}
        </Button>

        {/** navigate to signup */}
        <Typography textAlign="center">
          ¿No tiene cuenta?{" "}
          <RouterLink to="/signup" style={{ textDecoration: 'none', color: '#1976d2' }}>
            Regístrese
          </RouterLink>
        </Typography>
      </Container>
    </Box>
      
  );
}