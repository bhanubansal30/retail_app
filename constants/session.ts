export type SessionRole = 'USER' | 'ADMIN';

export type Session = {
  userId: string;
  role: SessionRole;
};

let currentSession: Session | null = null;

export const setSession = (session: Session | null) => {
  currentSession = session;
};

export const getSession = () => currentSession;
