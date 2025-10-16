import * as yup from 'yup';

export const emailSchema = yup
  .string()
  .email('Email inválido')
  .required('Email é obrigatório');

export const passwordSchema = yup
  .string()
  .min(6, 'Senha deve ter no mínimo 6 caracteres')
  .required('Senha é obrigatória');

export const nameSchema = yup
  .string()
  .min(3, 'Nome deve ter no mínimo 3 caracteres')
  .required('Nome é obrigatório');

export const confirmPasswordSchema = (passwordField: string = 'password') =>
  yup
    .string()
    .oneOf([yup.ref(passwordField)], 'As senhas devem ser iguais')
    .required('Confirme sua senha');

export const loginValidationSchema = yup.object().shape({
  email: emailSchema,
  password: passwordSchema,
});

export const registerValidationSchema = yup.object().shape({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema(),
});

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password: string): boolean => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongPasswordRegex.test(password);
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 6) return 'weak';
  if (password.length < 8) return 'medium';
  if (isStrongPassword(password)) return 'strong';
  return 'medium';
};
