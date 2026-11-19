import jwt from 'jsonwebtoken';

export interface TokenConfig {
  secret: string;
  expiresInSeconds: number;
}

const ALGORITHM = 'HS256';

export function signAccessToken(userId: string, config: TokenConfig): string {
  return jwt.sign({}, config.secret, {
    subject: userId,
    expiresIn: config.expiresInSeconds,
    algorithm: ALGORITHM,
  });
}

export function verifyAccessToken(token: string, secret: string): string | null {
  try {
    const payload = jwt.verify(token, secret, { algorithms: [ALGORITHM] });
    return typeof payload === 'object' && typeof payload.sub === 'string' ? payload.sub : null;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return null;
    }
    throw error;
  }
}
