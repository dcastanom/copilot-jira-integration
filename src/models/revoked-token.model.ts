export type TokenType = 'access' | 'refresh';

export interface RevokedToken {
  jti: string;
  subject: number;
  type: TokenType;
  revokedAt: Date;
  expiresAt: Date;
}
