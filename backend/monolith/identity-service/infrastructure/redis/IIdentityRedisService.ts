// -> Redis Servis Interface

export interface IIdentityRedisService {
  setToken(
    userId: string,
    token: string,
    expiryInSeconds: number
  ): Promise<void>;
  getToken(userId: string): Promise<string | null>;
  removeToken(userId: string): Promise<void>;
  ping(): Promise<boolean>;
}
