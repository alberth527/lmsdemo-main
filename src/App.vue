<template>
  <div id="q-app">
    <q-layout view="hHh lpR fFf">
      <q-header elevated class="bg-primary">
        <q-toolbar>
          <q-toolbar-title class="row items-center">
            <q-icon name="card_giftcard" class="q-mr-sm" />
            紅利點數兌換系統
          </q-toolbar-title>
          <div v-if="loggedIn" class="q-gutter-sm">
            <q-chip
              icon="account_circle"
              :label="user.username"
              color="white"
              text-color="primary"
              square
            />
            <q-chip
              icon="stars"
              :label="`${user.points} 點`"
              color="amber"
              text-color="white"
              square
            />
          </div>
        </q-toolbar>
      </q-header>

      <q-page-container>
        <q-page class="q-pa-md" style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh;">
          <!-- 登入頁面 -->
          <Login 
            v-if="!loggedIn" 
            @login-success="handleLoginSuccess"
          />
          
          <!-- 主要內容 -->
          <div v-else>
            <!-- 導航標籤 -->
            <q-tabs 
              v-model="currentTab" 
              dense 
              class="text-grey-8 bg-white rounded-borders shadow-1 q-mb-md"
              indicator-color="primary"
              active-color="primary"
              align="justify"
            >
              <q-tab name="dashboard" label="會員中心" icon="dashboard" />
              <q-tab name="products" label="商品列表" icon="shopping_cart" />
              <q-tab name="history" label="兌換紀錄" icon="history" />
            </q-tabs>

            <!-- 內容面板 -->
            <q-tab-panels v-model="currentTab" animated>
              <q-tab-panel name="dashboard" class="q-pa-none">
                <Dashboard 
                  :user="user" 
                  @logout="handleLogout"
                  @navigate="navigateToTab"
                />
              </q-tab-panel>

              <q-tab-panel name="products" class="q-pa-none">
                <ProductList 
                  :user-points="user.points"
                  @exchange-product="openExchangeDialog"
                />
              </q-tab-panel>

              <q-tab-panel name="history" class="q-pa-none">
                <ExchangeHistory 
                  :history="user.history"
                  @navigate="navigateToTab"
                />
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </q-page>
      </q-page-container>

      <!-- 兌換確認對話框 -->
      <ExchangeConfirm
        v-model="showExchangeDialog"
        :product="selectedProduct"
        :user-points="user?.points || 0"
        @confirm-exchange="handleExchange"
      />

      <!-- 全域載入指示器 -->
      <q-inner-loading :showing="globalLoading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </q-layout>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import Login from './components/Login.vue'
import Dashboard from './components/Dashboard.vue'
import ProductList from './components/ProductList.vue'
import ExchangeHistory from './components/ExchangeHistory.vue'
import ExchangeConfirm from './components/ExchangeConfirm.vue'

const $q = useQuasar()

// 響應式數據
const user = ref(JSON.parse(localStorage.getItem('reward-user')) || null)
const currentTab = ref('dashboard')
const showExchangeDialog = ref(false)
const selectedProduct = ref({})
const globalLoading = ref(false)

// 計算屬性
const loggedIn = computed(() => user.value !== null)

// 方法
function handleLoginSuccess(userData) {
  user.value = userData
  $q.notify({
    type: 'positive',
    message: '登入成功！',
    position: 'top'
  })
}

function handleLogout() {
  user.value = null
  currentTab.value = 'dashboard'
  $q.notify({
    type: 'info',
    message: '已成功登出',
    position: 'top'
  })
}

function navigateToTab(tabName) {
  currentTab.value = tabName
}

function openExchangeDialog(product) {
  selectedProduct.value = product
  showExchangeDialog.value = true
}

function handleExchange(exchangeData) {
  globalLoading.value = true
  
  setTimeout(() => {
    // 扣除點數
    user.value.points -= exchangeData.points
    
    // 添加到歷史記錄
    user.value.history.push({
      name: exchangeData.product.name,
      points: exchangeData.points,
      time: exchangeData.timestamp
    })
    
    // 保存到本地存儲
    localStorage.setItem('reward-user', JSON.stringify(user.value))
    
    globalLoading.value = false
    
    // 自動切換到歷史記錄頁面
    setTimeout(() => {
      currentTab.value = 'history'
    }, 1000)
  }, 500)
}

// 在組件掛載時檢查登入狀態
if (user.value) {
  $q.notify({
    type: 'info',
    message: `歡迎回來，${user.value.username}！`,
    position: 'top'
  })
}
</script>

<style>
body, #q-app {
  min-height: 100vh;
}
</style>
