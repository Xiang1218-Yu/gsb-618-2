/**
 * 验证工具函数
 */

/**
 * 校验中国大陆手机号格式
 * 支持 13x/14x/15x/16x/17x/18x/19x 开头的11位数字
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone.trim());
}

/**
 * 校验姓名（2-20个字符）
 */
export function validateName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 20;
}
