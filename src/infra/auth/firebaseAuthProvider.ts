import admin from "firebase-admin";
import type { IContractAuthProvider, DecodedToken } from "./contractAuthProvider";

export class FirebaseAuthProvider implements IContractAuthProvider {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId:   process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
        }),
      });
    }
  }

  async verifyToken(token: string): Promise<DecodedToken> {
    try {
      const decoded = await admin.auth().verifyIdToken(token, true);
      return {
        uid:   decoded.uid,
        email: decoded.email,
      };
    } catch {
      throw new Error("FirebaseAuthProvider: invalid or expired token");
    }
  }
}
