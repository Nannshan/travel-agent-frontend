import { defineStore } from 'pinia';
import router from '@/router';
import { message } from 'ant-design-vue';
import { login, logout, getUserInfo, updateUserInfo as apiUpdateUserInfo } from '@/api/user';

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    email: null,
    name: null,
    age: null,
    gender: null,
    phone: null,
    preference: null,
    loading: false,
    error: null,
    lastLoginTime: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.id,
    userInfo: (state) => ({
      id: state.id,
      email: state.email,
      name: state.name,
      age: state.age,
      gender: state.gender,
      phone: state.phone,
      preference: state.preference,
    }),
    loginStatus: (state) => ({
      isLoggedIn: !!state.id,
      lastLoginTime: state.lastLoginTime,
      loading: state.loading,
      error: state.error,
    }),
  },

  actions: {
    // 用户登录
    async login(loginData) {
      try {
        this.setLoading(true);
        const response = await login(loginData);
        this.setUserInfo(response.data);
        message.success('登录成功');
        return response.data;
      } catch (error) {
        this.setError(error.response?.data?.message || '登录失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // 设置用户信息
    setUserInfo(userInfo) {
      if (!userInfo.id) {
        console.error('用户信息中缺少ID');
        throw new Error('用户信息不完整');
      }
      
      this.id = userInfo.id;
      this.email = userInfo.email;
      this.name = userInfo.name;
      this.age = userInfo.age;
      this.gender = userInfo.gender;
      this.phone = userInfo.phone;
      this.preference = userInfo.preference;
      this.lastLoginTime = new Date().toISOString();
      
      // 保存到本地存储
      this.saveToStorage();
    },

    // 清除用户信息
    clearUserInfo() {
      this.id = null;
      this.email = null;
      this.name = null;
      this.age = null;
      this.gender = null;
      this.phone = null;
      this.preference = null;
      this.lastLoginTime = null;
      this.error = null;

      // 清除本地存储
      this.clearFromStorage();
    },

    // 保存到本地存储
    saveToStorage() {
      try {
        const userInfo = {
          id: this.id,
          email: this.email,
          name: this.name,
          age: this.age,
          gender: this.gender,
          phone: this.phone,
          preference: this.preference,
          lastLoginTime: this.lastLoginTime,
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      } catch (error) {
        console.error('保存用户信息到本地存储失败:', error);
      }
    },

    // 从本地存储清除
    clearFromStorage() {
      try {
        localStorage.removeItem('userInfo');
      } catch (error) {
        console.error('清除本地存储失败:', error);
      }
    },

    // 从本地存储恢复用户状态
    async initializeFromStorage() {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.id) {
          // 从服务器获取最新的用户信息
          const response = await getUserInfo(userInfo.id);
          if (!response.data || !response.data.id) {
            throw new Error('服务器返回的用户信息不完整');
          }
          this.setUserInfo(response.data);
        }
      } catch (error) {
        console.error('从本地存储恢复用户信息失败:', error);
        this.clearUserInfo();
      }
    },

    // 设置加载状态
    setLoading(loading) {
      this.loading = loading;
    },

    // 设置错误信息
    setError(error) {
      this.error = error;
      if (error) {
        message.error(error);
      }
    },

    // 更新用户信息
    async updateUserInfo(userData) {
      try {
        this.setLoading(true);
        const response = await apiUpdateUserInfo(this.id, userData);
        this.setUserInfo(response.data);
        message.success('个人信息更新成功');
      } catch (error) {
        this.setError(error.response?.data?.message || '更新个人信息失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // 退出登录
    async userlogout() {
      try {
        this.setLoading(true);
        // 准备完整的用户数据
        const userData = {
          id: this.id,
          email: this.email,
          name: this.name,
          age: this.age,
          gender: this.gender,
          phone: this.phone,
          preference: this.preference,
          lastLoginTime: this.lastLoginTime
        };
        
        // 发送用户数据到后端
        await logout(userData);
        this.clearUserInfo();
        message.success('退出登录成功');
        router.push('/login');
      } catch (error) {
        this.setError(error.response?.data?.message || '退出登录失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
  },
}); 