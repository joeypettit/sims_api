import bcryptjs from "bcryptjs";

export function validatePassword(password: string, passwordHash: string): Promise<boolean> {
  return bcryptjs.compare(password, passwordHash);
}


export function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10);
}