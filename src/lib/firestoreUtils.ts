import { auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  // Clean, privacy-safe error logging (COPPA & GDPR-K compliant - No raw PII/emails)
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || 'anonymous',
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || true,
    },
    operationType,
    path
  };

  // Log anonymized telemetry safely
  console.warn('[FIRESTORE SECURE AUDIT]', `Op: ${operationType}`, `Path: ${path}`, `Status: ${errInfo.error}`);
  
  // Safe client error without leaking internal server/database schema details
  throw new Error(`Database operation (${operationType}) failed. Please check your network and account permissions.`);
}
