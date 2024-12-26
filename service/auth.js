import api from '@/API/'

/**
 * 登录接口
 * @param email 用户邮箱
 * @param password 密码
 * @param salt 加密盐值
 */
export const fetchLogin = (email, password, salt) => {
  return api.apiRequest('/api/v1/login', { email, password, salt }, 'POST');
};

/**
 * 获取用户信息
 */
export const fetchGetUserInfo = () => {
  return api.apiRequest('/api/v1/user/detail', null, 'GET');
};

/**
 * 登出接口
 */
export const logout = () => {
  return api.apiRequest('/api/v1/user/logout', null, 'GET');
};

/**
 * 获取邮箱验证码
 * @param email 邮箱地址
 */
export const fetchEmailCode = (email) => {
  const params = {
    email,
    is_register: 1
  };
  return api.apiRequest('/api/v1/verification/code', params, 'GET');
};

/**
 * 邮箱注册接口参数类型
 
interface RegisterData {
  email: string;           // 邮箱
  verify_code: string;     // 邮箱验证码
  password: string;        // 用户密码
  confirm_password: string;// 确认密码
  phone_prefix: string;    // 手机前缀
  phone_number: string;    // 手机号码
}
*/

/**
 * 邮箱注册
 * @param data 注册数据
 */
export const registerByEmail = (data) => {
  return api.apiRequest('/api/v1/tenant/email/register', data, 'POST');
};