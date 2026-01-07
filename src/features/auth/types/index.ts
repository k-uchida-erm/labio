import type { Session, User } from '@supabase/supabase-js';

export type AuthSession = Session | null;

export type AuthUser = User | null;

export type LoginFormValues = {
  email: string;
  password: string;
};

export type LoginErrorCode =
  | 'EMAIL_NOT_CONFIRMED'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'UNKNOWN';

export type LoginResult =
  | {
      ok: true;
      session: AuthSession;
    }
  | {
      ok: false;
      code: LoginErrorCode;
      message: string;
    };
