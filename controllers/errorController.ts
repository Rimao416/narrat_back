import { Request, Response, NextFunction } from "express";
// import { Request, Response, NextFunction } from "express";
import AppError from "./../utils/appError";

interface CastError extends Error {
  path: string;
  value: string;
}
interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  code?: number;
  errmsg?: string;
  errors?: { [key: string]: { message: string } };
  isOperational?: boolean;
}

interface CastError extends CustomError {
  path: string;
  value: string;
}

interface DuplicateError extends CustomError {
  errmsg: string;
}

interface ValidationError extends CustomError {
  errors: { [key: string]: { message: string } };
}

const handleJWTExpiredError = (): AppError =>
  new AppError("Le token a expiré, connectez-vous à nouveau", 401);

const handleJWTError = (): AppError =>
  new AppError("Invalid Token, connectez-vous encore", 401);

const handleCastErrorDB = (err: CastError): AppError => {
  const message = `Invalid Id ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicatesDB = (err: DuplicateError): AppError => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)?.[0] || "";
  const message = `Duplicate field value ${value}, choisissez un autre.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: ValidationError): AppError => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err: CustomError, res: Response): void => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: CustomError, res: Response): void => {
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status || "error",
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Erreur inattendue",
    });
  }
};

const globalErrorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (
    process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "test"
  ) {
    let error = err;
    console.log(error);
    if (error.name === "CastError")
      error = handleCastErrorDB(error as CastError);
    if (error.code === 11000)
      error = handleDuplicatesDB(error as DuplicateError);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error as ValidationError);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
//   const globalErrorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
//     err.statusCode = err.statusCode || 500;
//     err.status = err.status || 'error';

//     if (process.env.NODE_ENV === 'development') {
//       sendErrorDev(err, res);
//     } else if (process.env.NODE_ENV === 'production') {
//       let error = { ...err };

//       if (error.name === 'CastError') error = handleCastErrorDB(error as CastError);
//       if (error.code === 11000) error = handleDuplicatesDB(error as DuplicateError);
//       if (error.name === 'ValidationError') error = handleValidationErrorDB(error as ValidationError);
//       if (error.name === 'JsonWebTokenError') error = handleJWTError();
//       if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

//       sendErrorProd(error, res);
//     }
//   };

export default globalErrorHandler;
