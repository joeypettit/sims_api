import { PrismaClient } from "@prisma/client";
import { Store } from "express-session";

export class PrismaSessionStore extends Store {
  constructor(private prisma: PrismaClient) {
    super();
  }
  // get is used to get the session
  async get(sessionId: string, callback: (err: any, session?: any) => void): Promise<void> {
    try {
      const session = await this.prisma.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return callback(null);
      }

      if (session.expiresAt < new Date()) {
        await this.destroy(sessionId);
        return callback(null);
      }

      const sessionData = JSON.parse(session.data);
      callback(null, sessionData);
    } catch (err) {
      callback(err);
    }
  }

  // set is used to create a new session
  async set(sessionId: string, session: any, callback?: (err?: any) => void): Promise<void> {
    try {
      // 30 days = 24 hours * 60 minutes * 60 seconds * 1000 milliseconds * 30 days
      const expiresAt = new Date(session.cookie.expires || Date.now() + (24 * 60 * 60 * 1000 * 30));
      
      await this.prisma.session.upsert({
        where: { id: sessionId },
        create: {
          id: sessionId,
          data: JSON.stringify(session),
          expiresAt,
        },
        update: {
          data: JSON.stringify(session),
          expiresAt,
        },
      });

      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  // destroy is used to delete the session
  async destroy(sessionId: string, callback?: (err?: any) => void): Promise<void> {
    try {
      await this.prisma.session.deleteMany({
        where: { id: sessionId }
      });
      callback?.();
    } catch (err) {
      console.error('Error destroying session:', err);
      callback?.(err);
    }
  }
  // touch is used to update the session expiration time
  async touch(sessionId: string, session: any, callback?: (err?: any) => void): Promise<void> {
    try {
      // 30 days = 24 hours * 60 minutes * 60 seconds * 1000 milliseconds * 30 days
      const expiresAt = new Date(session.cookie.expires || Date.now() + (24 * 60 * 60 * 1000 * 30));
      
      await this.prisma.session.update({
        where: { id: sessionId },
        data: {
          expiresAt,
        },
      });

      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }
} 