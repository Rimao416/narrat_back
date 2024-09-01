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
}).or("phoneNumber", "email"); // Ensures that at least one of the fields is present

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
    // Save the user in the database

    const { type } = req.body;
    // Vérifier si l'utilisateur existe
    const user = await customerModel.findOne({
      $or: [{ phoneNumber: req.body.phoneNumber }, { email: req.body.email }],
    });
    if (user) {
      // Si l'utilisateur existe et a un compte actif
      if (user.status === "active") {
        // Rediriger vers la page d'accès
        const errorKey = user.type === "phone" ? "phoneNumber" : "email";

        res.status(400).json({
          status: "error",
          message: "Ce compte existe déjà. Veuillez vous connecter.",
          errors: {
            [errorKey]: "Ce compte existe déjà. Veuillez vous connecter.",
          },
        });
      } else if (user.status === "pending") {
        if (user.otpExpires.getTime() < Date.now()) {
          // Dans ce cas, l'utilisateur existe mais son token a expiré
          if (type === "phone") {
            // Send otp code to phone number using twilio`
            const client = twilio(
              process.env.TWILIO_SID,
              process.env.TWILIO_AUTH_TOKEN
            );

            const otp = Math.floor(100000 + Math.random() * 900000);

            user.otp = otp.toString();
            user.otpExpires = new Date(Date.now() + 3 * 60 * 60 * 1000);

            await user.save({ validateBeforeSave: false });
            client.messages
              .create({
                from: process.env.FROM_TWILLIO_NUMBER,
                // to:req.body.countryCode+req.body.phoneNumber
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
        }
      }
    } else {
      // const otp = Math.floor(100000 + Math.random() * 900000);
      const otp = Math.floor(100000 + Math.random() * 900000);
      const customer = new customerModel({
        ...req.body,
        // otpExpires: new Date(Date.now() + 1 * 60 * 1000),
        otpExpires: new Date(Date.now() + 3 * 60 * 60 * 1000),
        otp,
      });
      if (type === "phone") {
        // Send otp code to phone number using twilio`
        const client = twilio(
          process.env.TWILIO_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        client.messages
          .create({
            from: process.env.FROM_TWILLIO_NUMBER,
            // to:req.body.countryCode+req.body.phoneNumber
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

      // Sauvegarde l'instance dans la base de données
      await customer.save({
        validateBeforeSave: false,
      });
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
