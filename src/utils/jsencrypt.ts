import JSEncrypt from 'jsencrypt';

export class RsaUtil {
  private encryptor: JSEncrypt;

  constructor() {
    this.encryptor = new JSEncrypt();
  }

  /**
   * 设置公钥
   */
  setPublicKey(publicKey: string): void {
    // 格式化公钥（添加头尾）
    const formattedKey = `-----BEGIN PUBLIC KEY-----\n${publicKey.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
    this.encryptor.setPublicKey(formattedKey);
  }

  /**
   * 加密密码
   */
  encrypt(password: string): string | boolean {
    return this.encryptor.encrypt(password);
  }
}