<template>
  <div class="profile-container">
    <a-card class="profile-card" title="个人资料设置" :bordered="false">
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <a-avatar 
            :size="120" 
            :src="avatarUrl"
            :icon="!avatarUrl ? h(UserOutlined) : undefined"
          >
            <template #icon v-if="!avatarUrl">
              <user-outlined />
            </template>
          </a-avatar>
          <div class="avatar-upload-overlay" @click="handleAvatarClick">
            <upload-outlined />
            <span>更换头像</span>
          </div>
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            accept="image/*"
            @change="handleFileChange"
          />
        </div>
      </div>

      <a-form
        :model="userForm"
        :rules="rules"
        ref="formRef"
        layout="vertical"
        @finish="handleSubmit"
      >
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="userForm.email" disabled />
        </a-form-item>

        <a-form-item label="昵称" name="name">
          <a-input v-model:value="userForm.name" placeholder="请输入昵称" />
        </a-form-item>

        <a-form-item label="年龄" name="age">
          <a-input-number
            v-model:value="userForm.age"
            :min="1"
            :max="120"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="性别" name="gender">
          <a-radio-group v-model:value="userForm.gender">
            <a-radio value="M">男</a-radio>
            <a-radio value="F">女</a-radio>
            <a-radio value="O">其他</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="手机号" name="phone">
          <a-input
            v-model:value="userForm.phone"
            placeholder="请输入手机号"
          />
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            :loading="loading"
            block
          >
            保存修改
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h } from 'vue'
import { message } from 'ant-design-vue'
import { UploadOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { updateUserInfo, uploadUserAvatar } from '@/api/user'

const userStore = useUserStore()
const loading = ref(false)
const fileInput = ref(null)
const formRef = ref(null)

// 获取API基础URL
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const avatarUrl = computed(() => {
  const url = userStore.userInfo.avatar_url
  if (!url) return ''
  
  // 移除URL中可能存在的开头的/media
  const cleanUrl = url.startsWith('/media/') ? url.substring(6) : url
  // 使用API URL访问头像
  const fullUrl = `${baseURL}/media/${cleanUrl}`
  
  return fullUrl
})

const userForm = reactive({
  email: '',
  name: '',
  age: undefined,
  gender: '',
  phone: '',
})

const rules = {
  name: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const handleAvatarClick = () => {
  fileInput.value.click()
}

const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  // 验证文件类型和大小
  const isImage = file.type.startsWith('image/')
  const isLt6M = file.size / 1024 / 1024 < 6

  if (!isImage) {
    message.error('只能上传图片文件！')
    return
  }
  if (!isLt6M) {
    message.error('图片大小不能超过 6MB！')
    return
  }

  try {
    loading.value = true
    const formData = new FormData()
    formData.append('avatar', file)

    const res = await uploadUserAvatar(userStore.id, formData)
    console.log('Upload response:', res.data)
    
    if (res.data && res.data.avatar_url) {
      // 确保更新整个用户信息
      userStore.updateUserState({
        ...userStore.userInfo,
        avatar_url: res.data.avatar_url
      })
      console.log('Updated store:', userStore.userInfo)
      message.success('头像更新成功')
    } else {
      message.error('头像URL未返回')
      console.error('Missing avatar_url in response:', res.data)
    }
  } catch (error) {
    console.error('Upload error:', error)
    message.error('头像上传失败')
  } finally {
    loading.value = false
    e.target.value = ''
  }
}

onMounted(() => {
  // 初始化表单数据
  const userInfo = userStore.userInfo
  if (userInfo) {
    userForm.email = userInfo.email
    userForm.name = userInfo.name || ''
    userForm.age = userInfo.age
    userForm.gender = userInfo.gender || ''
    userForm.phone = userInfo.phone || ''
  }
})

const handleSubmit = async (values) => {
  if (loading.value) return
  
  try {
    loading.value = true
    const updateData = {
      name: values.name,
      age: values.age,
      gender: values.gender,
      phone: values.phone
    }

    const res = await updateUserInfo(userStore.id, updateData)
    userStore.updateUserState(res.data)
    message.success('个人资料更新成功')
  } catch (error) {
    message.error(error.message || '更新失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 0 20px;
}

.profile-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
}

.avatar-wrapper:hover .avatar-upload-overlay {
  opacity: 1;
}

.avatar-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
}

.avatar-upload-overlay span {
  margin-top: 8px;
  font-size: 14px;
}

:deep(.ant-form-item) {
  margin-bottom: 24px;
}

:deep(.ant-input),
:deep(.ant-input-number) {
  height: 40px;
}

:deep(.ant-radio-group) {
  display: flex;
  gap: 32px;
}

@media (max-width: 576px) {
  .profile-container {
    margin: 20px auto;
  }
}
</style>