import Joi from "joi";

// Schémas de validation réutilisables
const phoneNumberSchema = Joi.string()
  .length(9)
  .pattern(/^[1-9][0-9]{8}$/)
  .messages({
    "string.pattern.base":
      "Le numéro de téléphone doit être composé de 9 chiffres et ne doit pas commencer par 0.",
    "string.length":
      "Le numéro de téléphone doit contenir exactement 9 chiffres.",
    "string.empty": "Le numéro de téléphone ne peut pas être vide.",
    "any.required": "Le numéro de téléphone est requis.",
  });

const emailSchema = Joi.string().email().lowercase().messages({
  "string.email": "L'email doit être une adresse email valide.",
  "string.empty": "L'email ne peut pas être vide.",
  "any.required": "L'email est requis.",
});

// Schéma pour les utilisateurs
export const userSchema = Joi.object({
  type: Joi.string().default("phone"),
  countryCode: Joi.string().default("+243"),
  fullName: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/)
    .not()
    .empty()
    .required()
    .messages({
      "string.base": "Le nom complet doit être une chaîne de caractères.",
      "string.pattern.base":
        "Le nom complet ne doit contenir que des lettres et des espaces.",
      "string.empty": "Le nom complet ne peut pas être vide.",
      "any.required": "Le nom complet est requis.",
    }),
  phoneNumber: phoneNumberSchema,
  email: emailSchema,
}).or("phoneNumber", "email");

// Schéma pour les OTPs
export const otpSchema = Joi.object({
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      "string.pattern.base": "Le code OTP doit être composé de 6 chiffres.",
      "string.length": "Le code OTP doit contenir exactement 6 chiffres.",
      "any.required": "Le code OTP est requis.",
      "string.empty": "Le code OTP ne peut pas être vide.",
    }),
  phoneNumber: phoneNumberSchema,
  email: emailSchema,
}).or("phoneNumber", "email");

// Schéma pour les mots de passe
export const passwordSchema = Joi.object({
  password: Joi.string()
    .pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-_]).{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.",
      "any.required": "Le mot de passe est requis.",
      "string.empty": "Le mot de passe ne peut pas être vide.",
    }),
  phoneNumber: phoneNumberSchema,
  email: emailSchema,
}).or("phoneNumber", "email");

export const imageSchema = Joi.object({
  avatar: Joi.object({
    type: Joi.string()
      .valid("image/jpeg", "image/png", "image/gif")
      .required()
      .messages({
        "any.required": "L'image est requise.",
        "string.valid": "Le type de fichier doit être jpeg, png ou gif.",
      }),
    size: Joi.number()
      .max(5 * 1024 * 1024) // Limite de 5MB
      .required()
      .messages({
        "number.max": "La taille de l'image ne doit pas dépasser 5MB.",
        "any.required": "La taille de l'image est requise.",
      }),
  }).required(),
});
