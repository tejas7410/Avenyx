// -> Created for generate token as helper

import jwt from "jsonwebtoken";

export function generateToken(
  payload: object,
  secret: string,
  expiresIn: string
): string {
  return jwt.sign(payload, secret, { expiresIn });
}