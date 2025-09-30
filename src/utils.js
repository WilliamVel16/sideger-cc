// Validation patterns and rules for forms
export const emailPattern = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: "Dirección de correo electrónico inválido",
};

export const namePattern = {
  value: /^[A-Za-z\s\u00C0-\u017F]{1,30}$/,
  message: "Nombre inválido",
};

export const passwordRules = (isRequired = true) => {
  const rules = {
    minLength: {
      value: 6, 
      message: "Debe tener al menos 6 caracteres",
    },
  };

  if (isRequired) {
    rules.required = "La contraseña es requerida";
  }

  return rules;
};

// rules to confirm password
export const confirmPasswordRules = (getValues, isRequired = true) => {
  const rules = {
    validate: (value) => {
      const password = getValues().password || getValues().new_password;
      return value === password ? true : "Las contraseñas no coinciden";
    },
  };

  if (isRequired) {
    rules.required = "Confirmación de contraseña requerida";
  }

  return rules;
};

// generic error handler
export const handleError = (err) => {
  const errDetail = err?.detail || err?.message;
  let errorMessage = errDetail || "Algo salió mal";
  
  if (Array.isArray(errDetail) && errDetail.length > 0) {
    errorMessage = errDetail[0].msg || errDetail[0];
  }
  
  console.error('Error:', errorMessage);
  return errorMessage;
};
