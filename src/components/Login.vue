<template>
  <div class="login-container">
    <q-card class="login-card" style="max-width: 400px; margin: 0 auto;">
      <q-card-section>
        <div class="text-h4 text-center q-mb-md">會員登入</div>
        <q-form @submit.prevent="handleLogin">
          <q-input
            v-model="loginForm.username"
            label="使用者名稱"
            outlined
            class="q-mb-md"
            :rules="[val => !!val || '請輸入使用者名稱']"
          />
          <q-input
            v-model="loginForm.password"
            type="password"
            label="密碼"
            outlined
            class="q-mb-md"
            :rules="[val => !!val || '請輸入密碼']"
          />
          <q-btn
            label="登入"
            type="submit"
            color="primary"
            class="full-width"
            :loading="loading"
          />
        </q-form>
        <div class="text-caption text-center q-mt-md">
          測試帳號: demo / 密碼: 1234
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const emit = defineEmits(['login-success'])
const $q = useQuasar()

const loginForm = ref({ 
  username: '', 
  password: '' 
})
const loading = ref(false)

// 假登入資料
const fakeUser = { 
  username: 'demo', 
  password: '1234', 
  points: 500, 
  history: [] 
}

async function handleLogin() {
  loading.value = true
  
  // 模擬 API 呼叫延遲
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  if (loginForm.value.username === fakeUser.username && 
      loginForm.value.password === fakeUser.password) {
    const user = { ...fakeUser }
    localStorage.setItem('reward-user', JSON.stringify(user))
    emit('login-success', user)
  } else {
    $q.notify({
      type: 'negative',
      message: '帳號或密碼錯誤'
    })
  }
  
  loading.value = false
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.login-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
