import bcryptjs from 'bcryptjs';

export function validatePassword(password: string, passwordHash: string): Promise<boolean> {
  return bcryptjs.compare(password, passwordHash);
}

export function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10);
}

export function generateSimplePassword(length: number = 8): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
} 