import React from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink } from "react-router-dom";
import { Box, Container, FormControl, InputLabel, OutlinedInput, InputAdornment, FormHelperText, Button, Typography } from "@mui/material";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import useAuth from "../hooks/useAuth";
import Logo from "../assets/logo.png";
import { emailPattern, passwordRules, confirmPasswordRules } from "../utils";

/**
 * This signup component renders a user registration form allowing new users to create an account.
 * It uses React Hook Form for form management and validation, Chakra UI for layout and styling,
 * and a custom authentication hook for handling the sign-up process.
 * 
 * Form fields:
 * - name: required, minimum length 3.
 * - lastname: required, minimum length 3.
 * - email: required, must match a valid email pattern.
 * - password: required, must satisfy password rules defined in `passwordRules`.
 * - password confirmation: required, must match the password field using `confirmPasswordRules`.
 * 
 * The component handles form submission asynchronously and displays any authentication errors.
 * It also provides a link to the login page for existing users.
 * 
 * @returns JSX.Element representing the signup form.
 */
export default function Signup() {
  const { signUp, error, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    const { passwordConfirmation, ...requestData } = data;
    try {
      console.log(requestData)
      await signUp(requestData);
    } catch (_) {
      // useAuth hook maneja errores
    }
  };

  return (
    <Container
      maxWidth="sm"
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 2,
        alignItems: "stretch",
      }}
    >
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <img src={Logo} alt="Logo" style={{ maxWidth: 120 }} />
      </Box>

      {/* Nombre */}
      <FormControl fullWidth variant="outlined" error={!!errors.name}>
        <InputLabel htmlFor="name">Nombre</InputLabel>
        <OutlinedInput
          id="name"
          type="text"
          {...register("name", { required: "El nombre es requerido", minLength: { value: 3, message: "Mínimo 3 caracteres" } })}
          startAdornment={
            <InputAdornment position="start">
              <FiUser />
            </InputAdornment>
          }
          label="Nombre"
        />
        <FormHelperText>{errors.name?.message}</FormHelperText>
      </FormControl>

      {/* Apellidos */}
      <FormControl fullWidth variant="outlined" error={!!errors.lastname}>
        <InputLabel htmlFor="lastname">Apellidos</InputLabel>
        <OutlinedInput
          id="lastname"
          type="text"
          {...register("lastname", { required: "Campo apellidos requerido", minLength: { value: 3, message: "Mínimo 3 caracteres" } })}
          startAdornment={
            <InputAdornment position="start">
              <FiUser />
            </InputAdornment>
          }
          label="Apellidos"
        />
        <FormHelperText>{errors.lastname?.message}</FormHelperText>
      </FormControl>

      {/* Email */}
      <FormControl fullWidth variant="outlined" error={!!errors.email}>
        <InputLabel htmlFor="email">Correo</InputLabel>
        <OutlinedInput
          id="email"
          type="email"
          {...register("email", {
            required: "El correo es requerido",
            pattern: emailPattern,
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

      {/* Contraseña */}
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

      {/* Confirmación de contraseña */}
      <FormControl fullWidth variant="outlined" error={!!errors.passwordConfirmation}>
        <InputLabel htmlFor="passwordConfirmation">Confirmar Contraseña</InputLabel>
        <OutlinedInput
          id="passwordConfirmation"
          type="password"
          {...register("passwordConfirmation", confirmPasswordRules(getValues))}
          startAdornment={
            <InputAdornment position="start">
              <FiLock />
            </InputAdornment>
          }
          label="Confirmar Contraseña"
        />
        <FormHelperText>{errors.passwordConfirmation?.message}</FormHelperText>
      </FormControl>

      {/* Botón de registro */}
      <Button
        variant="contained"
        color="primary"
        type="submit"
        disabled={isSubmitting || isLoading}
        fullWidth
      >
        {isSubmitting || isLoading ? "Cargando..." : "Registrarme"}
      </Button>

      {/* Error global */}
      {error && (
        <Typography color="error" variant="body2" textAlign="center">
          {error}
        </Typography>
      )}

      {/* Link a login */}
      <Typography textAlign="center">
        ¿Tiene cuenta?{" "}
        <RouterLink to="/login" style={{ textDecoration: "none", color: "#1976d2" }}>
          Inicie Sesión
        </RouterLink>
      </Typography>
    </Container>
  );
}
