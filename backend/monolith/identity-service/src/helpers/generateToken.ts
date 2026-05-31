// -> Created for generate token as helper

import jwt, { SignOptions } from "jsonwebtoken";

export function generateToken(
  payload: object,
  secret: string,
  expiresIn: string
): string {
  const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, secret, options);
}