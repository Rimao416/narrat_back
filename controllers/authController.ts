import { NextFunction, Request, Response } from "express";
// import AppError from "../utils/appError";
import jwt from "jsonwebtoken";
import customerModel from "../models/customerModel";
import catchAsync from "../utils/catchAsync";
import Joi from "joi";

// Fonction pour vérifier si le numéro de téléphone existe déjà
// const checkPhoneNumberExists = async (numberPhone: string) => {
//   const user = await customerModel.findOne({ phoneNumber: numberPhone });
//   console.log(user);
//   return !!user;
// };
const checkPhoneNumberExists = async (phoneNumber: string): Promise<boolean> => {
  // Utilisation de `exists` pour vérifier l'existence du numéro de téléphone
  const exists = await customerModel.exists({ phoneNumber });
  return !!exists;
};

// Schema de validation avec Joi, incluant une validation personnalisée pour le numéro de téléphone
const userSchema = Joi.object({
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
  phoneNumber: Joi.string()
    .length(9)
    .pattern(/^[1-9][0-9]{8}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Le numéro de téléphone doit être composé de 9 chiffres et ne doit pas commencer par 0.",
      "string.length":
        "Le numéro de téléphone doit contenir exactement 9 chiffres.",
      "string.empty": "Le numéro de téléphone ne peut pas être vide.",
      "any.required": "Le numéro de téléphone est requis.",
    })
    .custom(async (value, helpers) => {
      // Vérifier si le numéro de téléphone existe déjà
      const phoneNumberExists = await checkPhoneNumberExists(value);
      if (phoneNumberExists) {
        // Utiliser helpers.error pour renvoyer le message d'erreur personnalisé
        return helpers.error("any.custom", {
          message: "Le numéro de téléphone est déjà utilisé.",
        });
      }
      return value;
    }, "Phone number check"),
});

export const validateUserInput = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = userSchema.validate(req.body, {
      abortEarly: false, // Capture toutes les erreurs
    });
    console.log(error);
    // console.log(value);
    if (error) {
      const validationErrors: { [key: string]: string } = {};

      error.details.forEach((detail) => {
        const path = detail.path.join(".");
        validationErrors[path] = detail.message;
      });

      return res.status(400).json({
        status: "error",
        message: "La validation a échoué",
        errors: validationErrors,
      });
    }

    req.body = value;
    next();
  }
);

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user: any, statusCode: number, res: Response) => {
  const token = signToken(user._id);
  const cookieOptions: {
    expires: Date;
    httpOnly: boolean;
    secure?: boolean;
  } = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const signup = catchAsync(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await customerModel.create(req.body);
    createSendToken(newUser, 201, res);
  }
);
