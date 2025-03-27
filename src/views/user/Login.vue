<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-header">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <h1>欢迎回来</h1>
        <p class="subtitle">请登录您的账户以继续使用</p>
      </div>

      <a-card class="login-card" :bordered="false">
        <a-tabs
          v-model:activeKey="activeTab"
          class="custom-tabs"
          centered
        >
          <a-tab-pane key="login" tab="登录">
            <a-form
              :model="loginForm"
              :rules="loginRules"
              ref="loginFormRef"
              @finish="handleLogin"
              layout="vertical"
            >
              <a-form-item name="email">
                <a-input
                  v-model:value="loginForm.email"
                  placeholder="请输入邮箱"
                  size="large"
                  class="custom-input"
                >
                  <template #prefix>
                    <MailOutlined class="input-icon" />
                  </template>
                </a-input>
              </a-form-item>

              <a-form-item>
                <a-radio-group v-model:value="loginType" class="login-type-group">
                  <a-radio value="password">密码登录</a-radio>
                  <a-radio value="code">验证码登录</a-radio>
                </a-radio-group>
              </a-form-item>

              <template v-if="loginType === 'password'">
                <a-form-item name="password">
                  <a-input-password
                    v-model:value="loginForm.password"
                    placeholder="请输入密码"
                    size="large"
                    class="custom-input"
                  >
                    <template #prefix>
                      <LockOutlined class="input-icon" />
                    </template>
                  </a-input-password>
                </a-form-item>
                <div class="form-footer">
                  <a-checkbox v-model:checked="rememberMe">记住我</a-checkbox>
                  <a class="forgot-link">忘记密码？</a>
                </div>
              </template>

              <template v-else>
                <a-form-item name="verificationCode">
                  <div class="verification-code-container">
                    <a-input
                      v-model:value="loginForm.verificationCode"
                      placeholder="请输入验证码"
                      size="large"
                      class="verification-input"
                    >
                      <template #prefix>
                        <SafetyOutlined class="input-icon" />
                      </template>
                    </a-input>
                    <a-button
                      :disabled="codeCooldown > 0"
                      @click="sendVerificationCode"
                      class="send-code-btn"
                      size="large"
                    >
                      {{ codeCooldown > 0 ? `${codeCooldown}秒后重试` : '发送验证码' }}
                    </a-button>
                  </div>
                </a-form-item>
              </template>

              <a-form-item>
                <a-button
                  type="primary"
                  html-type="submit"
                  :loading="loading"
                  block
                  size="large"
                  class="submit-button"
                >
                  登录
                </a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>

          <a-tab-pane key="register" tab="注册">
            <a-form
              :model="registerForm"
              :rules="registerRules"
              ref="registerFormRef"
              @finish="handleRegister"
              layout="vertical"
            >
              <a-form-item name="email">
                <a-input
                  v-model:value="registerForm.email"
                  placeholder="请输入邮箱"
                  size="large"
                  class="custom-input"
                >
                  <template #prefix>
                    <MailOutlined class="input-icon" />
                  </template>
                </a-input>
              </a-form-item>
              <a-form-item name="nickname">
                <a-input
                  v-model:value="registerForm.nickname"
                  placeholder="请输入昵称"
                  size="large"
                  class="custom-input"
                >
                  <template #prefix>
                    <UserOutlined class="input-icon" />
                  </template>
                </a-input>
              </a-form-item>
              <a-form-item name="password">
                <a-input-password
                  v-model:value="registerForm.password"
                  placeholder="请输入密码"
                  size="large"
                  class="custom-input"
                >
                  <template #prefix>
                    <LockOutlined class="input-icon" />
                  </template>
                </a-input-password>
              </a-form-item>
              <a-form-item name="confirmPassword">
                <a-input-password
                  v-model:value="registerForm.confirmPassword"
                  placeholder="请确认密码"
                  size="large"
                  class="custom-input"
                >
                  <template #prefix>
                    <LockOutlined class="input-icon" />
                  </template>
                </a-input-password>
              </a-form-item>
              <a-form-item>
                <a-button
                  type="primary"
                  html-type="submit"
                  :loading="loading"
                  block
                  size="large"
                  class="submit-button"
                >
                  注册
                </a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>
        </a-tabs>
      </a-card>

      <div class="login-footer">
        <p>© 2025 Travel Agent. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { MailOutlined, LockOutlined, UserOutlined, SafetyOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { login, signup, sendEmailCode } from '@/api/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const activeTab = ref('login')
const loginFormRef = ref()
const registerFormRef = ref()
const rememberMe = ref(false)
const loginType = ref('password') // 登录方式：password/code
const codeCooldown = ref(0) // 验证码冷却时间

// 根据URL参数设置默认标签
onMounted(() => {
  const tabFromQuery = route.query.tab
  if (tabFromQuery && (tabFromQuery === 'login' || tabFromQuery === 'register')) {
    activeTab.value = tabFromQuery
  }
  initSavedLoginInfo()
  checkLoginStatus()
})

// 登录表单
const loginForm = reactive({
  email: '',
  password: '',
  verificationCode: ''
})

// 注册表单
const registerForm = reactive({
  email: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

// 页面加载时检查是否有保存的登录信息
const initSavedLoginInfo = () => {
  const savedEmail = localStorage.getItem('remembered_email')
  const savedPassword = localStorage.getItem('remembered_password')
  if (savedEmail && savedPassword) {
    loginForm.email = savedEmail
    loginForm.password = atob(savedPassword) // 解码保存的密码
    rememberMe.value = true
  }
}

// 保存或清除登录信息
const handleRememberMe = () => {
  if (rememberMe.value) {
    localStorage.setItem('remembered_email', loginForm.email)
    localStorage.setItem('remembered_password', btoa(loginForm.password)) // 简单编码密码
  } else {
    localStorage.removeItem('remembered_email')
    localStorage.removeItem('remembered_password')
  }
}

// 邮箱验证规则
const validateEmail = async (rule, value) => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  if (!value) {
    return Promise.reject('请输入邮箱')
  } else if (!emailRegex.test(value)) {
    return Promise.reject('请输入有效的邮箱地址')
  }
  return Promise.resolve()
}

// 登录验证规则
const loginRules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { validator: validateEmail }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度应为6位' }
  ]
}

// 注册验证规则
const registerRules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { validator: validateEmail }
  ],
  nickname: [
    { required: true, message: '请输入昵称' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码' },
    {
      validator: async (rule, value) => {
        if (value !== registerForm.password) {
          return Promise.reject('两次输入密码不一致')
        }
        return Promise.resolve()
      }
    }
  ]
}

// 发送验证码
const sendVerificationCode = async () => {
  try {
    // 验证邮箱格式
    await loginFormRef.value.validateFields(['email'])
    
    loading.value = true
    await sendEmailCode(loginForm.email)
    message.success('验证码已发送')
    
    // 开始倒计时
    codeCooldown.value = 60
    const timer = setInterval(() => {
      codeCooldown.value--
      if (codeCooldown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    message.error(error.message || '验证码发送失败')
  } finally {
    loading.value = false
  }
}

// 处理登录
const handleLogin = async (values) => {
  try {
    loading.value = true
    
    // 验证必填字段
    if (loginType.value === 'code' && !loginForm.verificationCode) {
      message.error('请输入验证码')
      return
    }
    
    const loginData = {
      email: values.email,
      type: loginType.value, // 改为type字段
      ...(loginType.value === 'password' 
        ? { password: values.password }
        : { code: values.verificationCode } // 改为code字段
      )
    }

    const res = await login(loginData)

    // 处理记住我
    if (loginType.value === 'password') {
      handleRememberMe()
    }

    // 更新用户信息到store
    userStore.setUserInfo(res.data)

    message.success('登录成功')
    router.push('/agent')
  } catch (error) {
    if (error.response?.status === 400) {
      message.error('验证码错误或已过期')
    } else {
      message.error(error.message || '登录失败')
    }
  } finally {
    loading.value = false
  }
}

// 处理注册
const handleRegister = async (values) => {
  try {
    loading.value = true
    const res = await signup({
      email: values.email,
      nickname: values.nickname,
      password: values.password
    })

    if (res.status === 201) {
      message.success('注册成功')
      // 注册成功后自动登录
      const loginRes = await login({
        email: values.email,
        password: values.password
      })
      userStore.setUserInfo(loginRes.data)
      router.push('/user-plan')
    }
  } catch (error) {
    if (error.response?.status === 400) {
      // 处理验证错误
      const errors = error.response.data
      let errorMsg = '注册失败: '
      if (typeof errors === 'object') {
        errorMsg += Object.values(errors).flat().join(', ')
      } else {
        errorMsg += errors
      }
      message.error(errorMsg)
    } else {
      message.error(error.message || '注册失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 检查登录状态
const checkLoginStatus = async () => {
  if (userStore.isLoggedIn) {
    const isValid = await userStore.checkTokenValidity()
    if (isValid) {
      // 如果已经登录且token有效，直接跳转
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f7fa;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(0, 0, 0, 0.02) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(0, 0, 0, 0.02) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(0, 0, 0, 0.02) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(0, 0, 0, 0.02) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.login-content {
  width: 100%;
  max-width: 440px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.login-header {
  margin-bottom: 32px;
}

.logo {
  width: 64px;
  height: 64px;
  margin-bottom: 24px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
}

.subtitle {
  font-size: 16px;
  color: #606266;
}

.login-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

:deep(.ant-tabs-nav) {
  margin-bottom: 32px !important;
}

:deep(.ant-tabs-tab) {
  font-size: 16px;
  padding: 12px 24px !important;
}

:deep(.ant-tabs-tab-active) {
  font-weight: 600;
}

:deep(.ant-form-item) {
  margin-bottom: 24px;
}

.custom-input {
  height: 48px;
  border-radius: 8px;
}

:deep(.ant-input-affix-wrapper) {
  padding: 0 16px;
  border-radius: 8px;
  border-color: #e4e7ed;
  transition: all 0.3s;
}

:deep(.ant-input-affix-wrapper:hover) {
  border-color: #40a9ff;
}

:deep(.ant-input-affix-wrapper-focused) {
  box-shadow: 0 0 0 2px rgba(64, 169, 255, 0.1);
}

.input-icon {
  color: #909399;
  font-size: 18px;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.forgot-link {
  color: #40a9ff;
  text-decoration: none;
  transition: color 0.3s;
}

.forgot-link:hover {
  color: #1890ff;
}

.submit-button {
  height: 48px;
  font-size: 16px;
  border-radius: 8px;
  background: #40a9ff;
  border: none;
  transition: all 0.3s;
}

.submit-button:hover {
  background: #1890ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 169, 255, 0.2);
}

.login-footer {
  margin-top: 24px;
  color: #909399;
  font-size: 14px;
}

.login-type-group {
  margin-bottom: 24px;
  width: 100%;
  display: flex;
  justify-content: space-around;
}

.verification-code-container {
  display: flex;
  gap: 12px;
}

.verification-input {
  flex: 1;
}

.send-code-btn {
  width: 120px;
  white-space: nowrap;
}

@media (max-width: 576px) {
  .login-container {
    padding: 20px;
    background: #ffffff;
  }

  .login-container::before {
    display: none;
  }

  .login-card {
    box-shadow: none;
    padding: 0;
  }

  .login-content {
    padding: 0;
  }

  .login-header h1 {
    color: #2c3e50;
  }

  .subtitle {
    color: #606266;
  }
}
</style>
