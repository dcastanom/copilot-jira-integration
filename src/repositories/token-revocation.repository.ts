import type { RevokedToken } from '../models/revoked-token.model.js';

export class TokenRevocationRepository {
  constructor(private readonly revokedTokens: RevokedToken[] = []) {}

  async revoke(token: RevokedToken): Promise<void> {
    const alreadyRevoked = this.revokedTokens.some((revokedToken) => revokedToken.jti === token.jti);

    if (!alreadyRevoked) {
      this.revokedTokens.push(token);
    }
  }

  async isRevoked(jti: string): Promise<boolean> {
    return this.revokedTokens.some((token) => token.jti === jti);
  }
}
