export const hashPassword = async (pw: string) => {
  return await Bun.password.hash(pw, { algorithm: 'argon2id', memoryCost: 19456, timeCost: 2 });
}
export const verifyPassword = async (pw: string, hash: string) => {
  return await Bun.password.verify(pw, hash);
}
