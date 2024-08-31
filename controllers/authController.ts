import { NextFunction, Request, Response } from "express";
import twilio from "twilio";
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

// Schema de validation avec Joi, incluant une validation personnalisée pour le numéro de téléphone
const userSchema = Joi.object({
  type: Joi.string().default("phone"),
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
    .messages({
      "string.pattern.base":
        "Le numéro de téléphone doit être composé de 9 chiffres et ne doit pas commencer par 0.",
      "string.length":
        "Le numéro de téléphone doit contenir exactement 9 chiffres.",
      "string.empty": "Le numéro de téléphone ne peut pas être vide.",
      "any.required": "Le numéro de téléphone est requis.",
    }),

  email: Joi.string().email().lowercase().messages({
    "string.email": "L'email doit être une adresse email valide.",
    "string.empty": "L'email ne peut pas être vide.",
    "any.required": "L'email est requis.",
  }),
})
  .or("phoneNumber", "email") // Ensures that at least one of the fields is present
  .external(async (value: any) => {
    if (value.phoneNumber) {
      const phoneNumberExists = await customerModel.findOne({
        phoneNumber: value.phoneNumber,
      });

      if (phoneNumberExists) {
        throw new Error("Le numéro de téléphone est déjà utilisé.");
      }
    }

    if (value.email) {
      const emailExists = await customerModel.findOne({
        email: value.email,
      });

      if (emailExists) {
        throw new Error("L'email est déjà utilisé.");
      }
    }

    return value;
  });
// SCREEN 1: Fullname and phone number or email
export const validateUserInput = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const value = await userSchema.validateAsync(req.body, {
      abortEarly: false,
    });

    req.body = value;
    const { type } = req.body;
    if (type === "phone") {
      console.log("Je commence le parcours");
      // Send otp code to phone number using twilio`
      const client = twilio(
        process.env.TWILIO_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const otp = Math.floor(1000 + Math.random() * 9000);
      client.messages
        .create({
          from: process.env.FROM_TWILLIO_NUMBER,
          to: "+21656609671",
          body: `Votre code d'activation est : ${otp}`,
        })
        .then((res) => {
          console.log("Message sent:", res.sid);
        })
        .catch((e: Error) => {
          console.error("Failed to send message:", e.message);
        });
    } else if (type === "email") {
      // Send otp code to email
    }
    next();
  } catch (error: any) {
    const validationErrors: { [key: string]: string } = {};

    if (error.details) {
      error.details.forEach((detail: any) => {
        const path = detail.path.join(".");
        validationErrors[path] = detail.message;
      });
    } else {
      const message = error.message.replace(/\s*\(value\)$/, "");
      error.message.includes("numéro")
        ? (validationErrors.phoneNumber = message)
        : (validationErrors.email = message);
    }

    return res.status(400).json({
      status: "error",
      message: "La validation a échoué",
      errors: validationErrors,
    });
  }
};
// SCREEN 2: Send otp code to phone number or email

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
