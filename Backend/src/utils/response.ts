import { Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const sendSuccess = <T>(res: Response, data: T, message?: string) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(200).json(response);
};

export const sendCreated = <T>(res: Response, data: T, message?: string) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(201).json(response);
};

export const sendError = (res: Response, error: string, code = 400) => {
  const response: ApiResponse<null> = {
    success: false,
    error,
  };
  return res.status(code).json(response);
};