<template>
  <div class="dashboard">
    <q-card class="dashboard-card">
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="col">
            <div class="text-h4">會員中心</div>
            <div class="text-subtitle1 text-grey-6">歡迎回來，{{ user.username }}！</div>
          </div>
          <div class="col-auto">
            <q-btn 
              flat 
              round 
              icon="logout" 
              @click="handleLogout"
              color="grey-7"
            >
              <q-tooltip>登出</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="row q-gutter-md q-mt-md">
      <!-- 點數卡片 -->
      <div class="col-12 col-md-6">
        <q-card class="points-card bg-gradient-primary text-white">
          <q-card-section>
            <div class="text-h6 q-mb-sm">
              <q-icon name="stars" class="q-mr-sm" />
              目前點數
            </div>
            <div class="text-h3 text-weight-bold">{{ user.points }}</div>
            <div class="text-subtitle2 q-mt-sm opacity-80">
              可用於兌換商品
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 統計卡片 -->
      <div class="col-12 col-md-6">
        <q-card class="stats-card">
          <q-card-section>
            <div class="text-h6 q-mb-sm">
              <q-icon name="history" class="q-mr-sm" />
              兌換統計
            </div>
            <div class="row q-gutter-md">
              <div class="col">
                <div class="text-h5 text-weight-bold text-primary">{{ user.history.length }}</div>
                <div class="text-caption text-grey-6">總兌換次數</div>
              </div>
              <div class="col">
                <div class="text-h5 text-weight-bold text-secondary">{{ totalSpentPoints }}</div>
                <div class="text-caption text-grey-6">已使用點數</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 快捷功能 -->
    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">快捷功能</div>
        <div class="row q-gutter-md">
          <div class="col-12 col-sm-6 col-md-3">
            <q-btn
              unelevated
              color="primary"
              class="full-width"
              icon="shopping_cart"
              label="瀏覽商品"
              @click="$emit('navigate', 'products')"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-btn
              unelevated
              color="secondary"
              class="full-width"
              icon="history"
              label="兌換紀錄"
              @click="$emit('navigate', 'history')"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-btn
              unelevated
              color="accent"
              class="full-width"
              icon="card_giftcard"
              label="熱門商品"
              @click="$emit('navigate', 'products')"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-btn
              unelevated
              color="positive"
              class="full-width"
              icon="support_agent"
              label="客服中心"
              @click="showSupport"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['logout', 'navigate'])
const $q = useQuasar()

const totalSpentPoints = computed(() => {
  return props.user.history.reduce((total, item) => total + item.points, 0)
})

function handleLogout() {
  $q.dialog({
    title: '確認登出',
    message: '您確定要登出嗎？',
    cancel: true,
    persistent: true
  }).onOk(() => {
    localStorage.removeItem('reward-user')
    emit('logout')
  })
}

function showSupport() {
  $q.notify({
    type: 'info',
    message: '客服功能開發中，敬請期待！',
    position: 'top'
  })
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.points-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.stats-card {
  border-left: 4px solid #667eea;
}

.opacity-80 {
  opacity: 0.8;
}
</style>
