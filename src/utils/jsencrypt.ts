/**
 * jsencrypt —— RSA 非对称加密工具
 *
 * 基于 jsencrypt 库封装，提供公钥设置和文本加密功能。
 * 用于登录时对密码进行 RSA 加密传输，避免明文密码在网络上传输。
 *
 * 使用方式：
 *   const rsa = new RsaUtil()
 *   rsa.setPublicKey(publicKey)              // 从后端获取公钥
 *   const encrypted = rsa.encrypt(password)   // 加密密码
 */

import JSEncrypt from 'jsencrypt';

export class RsaUtil {
  /** JSEncrypt 加密器实例 */
  private encryptor: JSEncrypt;

  constructor() {
    this.encryptor = new JSEncrypt();
  }

  /**
   * 设置 RSA 公钥
   *
   * 后端返回的 publicKey 通常是不含头尾标记的裸 Base64 字符串，
   * 需要转换为 PEM 格式（添加 -----BEGIN PUBLIC KEY----- 头尾标记，
   * 且每行最多 64 个字符）才能被 jsencrypt 识别。
   *
   * @param publicKey 后端返回的裸 Base64 公钥字符串
   */
  setPublicKey(publicKey: string): void {
    // 格式化公钥：添加 PEM 头尾标记，且每行 64 字符换行
    // .match(/.{1,64}/g) 将字符串按每 64 个字符分组
    const formattedKey = `-----BEGIN PUBLIC KEY-----\n${publicKey.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
    this.encryptor.setPublicKey(formattedKey);
  }

  /**
   * 使用已设置的公钥加密文本
   *
   * @param password 明文字符串（如登录密码）
   * @returns 加密后的 Base64 字符串，加密失败时返回 false
   */
  encrypt(password: string): string | boolean {
    return this.encryptor.encrypt(password);
  }
}
