import { NextFunction, Request, Response } from "express";
import twilio from "twilio";
// import AppError from "../utils/appError";
import jwt from "jsonwebtoken";
import customerModel from "../models/customerModel";
import catchAsync from "../utils/catchAsync";

import sendEmail from "../utils/email";
import { generateEmailTemplate } from "../utils/mailTemplate";
import { otpSchema, passwordSchema, userSchema } from "./validate";

// SCREEN 1: Fullname and phone number or email
interface CustomRequest extends Request {
  user?: typeof customerModel.prototype; // Utilisation du type de l'instance de modèle // Remplacez `CustomerModel` par le type correct de votre modèle utilisateur
}
export const validateUserInput = async (req: CustomRequest, res: Response) => {
  try {
    // Validation des données d'entrée
    const validatedData = await userSchema.validateAsync(req.body, {
      abortEarly: false,
    });
    req.body = validatedData;

    const { type, phoneNumber, email } = req.body;
    // Vérification de l'existence de l'utilisateur
    type queryProps = {
      phoneNumber?: string;
      email?: string;
    };
    const query: queryProps = {};

    if (phoneNumber) {
      query.phoneNumber = phoneNumber;
    } else if (email) {
      query.email = email.toLowerCase();
    }

    const user = await customerModel.findOne(query);
    // console.log(user)
    if (user) {
      if (user.status === "active") {
        const errorKey = user.type === "phone" ? "phoneNumber" : "email";
        return res.status(400).json({
          status: "error",
          message: "Ce compte existe déjà. Veuillez vous connecter.",
          errors: {
            [errorKey]: "Ce compte existe déjà. Veuillez vous connecter.",
          },
        });
      }
      // Si true, cela veut dire que l'Otp a expiré
      if (user.status === "pending") {
        if (user.otpExpires && user.otpExpires.getTime() < Date.now()) {
          console.log("ici");
          const otp = generateOtp();
          await sendOtp(user, otp, type);
          user.otp = otp.toString();
          user.otpExpires = new Date(Date.now() + 3 * 60 * 60 * 1000);

          await user.save({ validateBeforeSave: false });
        }
      }
      req.user = user;
    } else {
      // Si l'utilisateur n'est pas encore dans la base de donnée
      console.log("là");
      const otp = generateOtp();
      await sendOtp(user, otp, type);

      const newUser = new customerModel({
        ...req.body,
        otpExpires: new Date(Date.now() + 3 * 60 * 60 * 1000),
        otp,
      });

      await sendOtp(newUser, otp, type);
      await newUser.save({ validateBeforeSave: false });
      req.user = newUser;
    }

    return res.status(200).json({
      status: "success",
      message: "Validation reussie",
    });
  } catch (error: any) {
    const validationErrors = handleValidationError(error);
    return res.status(400).json({
      status: "error",
      message: "La validation a échoué",
      errors: validationErrors,
    });
  }
};
// export const validateOtp = async (req: CustomRequest, res: Response) => {
//     if (req.user.otp !== otp) {
//       return res.status(400).json({
//         status: "error",
//         message: "La validation a échoué",
//         errors: { otp: "Code OTP invalide" },
//       });
//     }

//     // Vérifiez si l'OTP a expiré
//     if (req.user.otpExpires.getTime() < Date.now()) {
//       return res.status(400).json({
//         status: "error",
//         message: "La validation a échoué",
//         errors: { otp: "Code OTP expiré" },
//       });
//     }

//     // Si l'OTP est valide, continuez le processus d'authentification

//     req.user.otp = undefined; // Supprimez l'OTP après vérification réussie
//     req.user.otpExpires = undefined; // Supprimez la date d'expiration de l'OTP
//     await req.user.save({ validateBeforeSave: false }); // Sauvegardez les modifications

//     return res.status(200).json({
//       status: "success",
//       message: "Validation reussie",
//     });
//   }
// Fonction pour générer un OTP
export const validateOtp = async (req: CustomRequest, res: Response) => {
  const { error } = otpSchema.validate(req.body);
  if (error)
    return res.status(400).json({ errors: { otp: error.details[0].message } });

  const { phoneNumber, email, otp } = req.body;
  console.log("Tu as envoyé "+otp)
  type queryProps = {
    phoneNumber?: string;
    email?: string;
    status?: string; 
  };
  const query: queryProps = { status: "pending" }; // Ajout de la condition pour le statut "pending"


  if (phoneNumber) {
    query.phoneNumber = phoneNumber;
  } else if (email) {
    query.email = email.toLowerCase();
  }

  const user = await customerModel.findOne(query);

  if (!user) {
    return res.status(400).json({
      status: "error",
      message: "Ce compte n'existe pas. Veuillez vous inscrire.",
      errors: {
        otp: "Ce compte n'existe pas. Veuillez vous inscrire.",
      },
    });
  } else {
    if (user.otp !== otp) {
      return res.status(400).json({
        status: "error",
        message: "La validation a échoué",
        errors: { otp: "Code OTP invalide" },
      });
    }

    // Vérifiez si l'OTP a expiré
    if (user.otpExpires && user.otpExpires.getTime() < Date.now()) {
      return res.status(400).json({
        status: "error",
        message: "La validation a échoué",
        errors: { otp: "Code OTP expiré" },
      });
    }

    // Si l'OTP est valide, continuez le processus d'authentification
    res.status(200).json({
      status: "success",
      message: "Validation reussie",
    });
  }
  // Votre logique pour vérifier l'OTP dans la base de données ici...


};
export const validatePassword = async (req: CustomRequest, res: Response) => {
  const { error } = passwordSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ errors: { password: error.details[0].message } });

  const { phoneNumber, email, password } = req.body;
  type queryProps = {
    phoneNumber?: string;
    email?: string;
  
  };
  const query: queryProps = {};

  if (phoneNumber) {
    query.phoneNumber = phoneNumber;
  } else if (email) {
    query.email = email.toLowerCase();
  }

  const user = await customerModel.findOne(query);

  if (!user) {
    return res.status(400).json({
      status: "error",
      message: "Ce compte n'existe pas. Veuillez vous inscrire.",
      errors: {
        password: "Ce compte n'existe pas. Veuillez vous inscrire.",
      },
    });
  } else if(user.status === "active" && user.otp==undefined){ 
    // Vérifiez si le mot de passe est valide
    res.status(400).json({
      status: "error",
      message:"Erreur",
      errors: { password: "Ce compte existe déjà. Veuillez vous inscrire avec une autre adresse email ou un autre numéro de téléphone." },
    });

  }else{
    user.password = password;
    await user.save({validateBeforeSave:false});
    res.status(200).json({
      status: "success",
      message: "Mot de passe mis à jour avec succès.",
    });
  }
};
const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

// Fonction pour envoyer un OTP par téléphone ou email
const sendOtp = async (user: any, otp: number, type: string) => {
  if (type === "phone") {
    const client = twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    await client.messages.create({
      from: process.env.FROM_TWILLIO_NUMBER,
      to: "+21656609671",
      body: `Votre code d'activation est : ${otp}`,
    });
  } else if (type === "email") {
    const message = generateEmailTemplate(user.fullName, otp.toString());
    await sendEmail(user.email, "Code d'activation", message);
  }
};

// Fonction pour gérer les erreurs de validation
const handleValidationError = (error: any) => {
  const validationErrors: { [key: string]: string } = {};

  if (error.details) {
    error.details.forEach((detail: any) => {
      const path = detail.path.join(".");
      validationErrors[path] = detail.message;
    });
  } else {
    const message = error.message.replace(/\s*\(value\)$/, "");
    if (
      error.message.includes("numéro") ||
      error.message.includes("Phone") ||
      error.message.includes("Number")
    ) {
      validationErrors.phoneNumber = message;
    } else {
      validationErrors.email = message;
    }
  }

  return validationErrors;
};

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
