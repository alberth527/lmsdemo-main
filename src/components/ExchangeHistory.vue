<template>
  <div class="exchange-history">
    <div class="q-mb-md">
      <div class="text-h4 q-mb-sm">兌換紀錄</div>
      <div class="text-subtitle1 text-grey-6">查看您的所有兌換記錄</div>
    </div>

    <!-- 統計卡片 -->
    <div class="row q-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-card class="stats-card">
          <q-card-section>
            <div class="text-h6 text-primary">{{ history.length }}</div>
            <div class="text-caption text-grey-6">總兌換次數</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card class="stats-card">
          <q-card-section>
            <div class="text-h6 text-secondary">{{ totalPointsSpent }}</div>
            <div class="text-caption text-grey-6">總消耗點數</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card class="stats-card">
          <q-card-section>
            <div class="text-h6 text-accent">{{ mostRecentExchange }}</div>
            <div class="text-caption text-grey-6">最近兌換</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 篩選器 -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-md items-end">
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchQuery"
              outlined
              label="搜尋商品名稱"
              clearable
              debounce="300"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="dateFilter"
              outlined
              label="時間範圍"
              :options="dateFilterOptions"
              clearable
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="sortBy"
              outlined
              label="排序方式"
              :options="sortOptions"
              emit-value
              map-options
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 兌換紀錄列表 -->
    <q-card v-if="filteredHistory.length > 0">
      <q-list separator>
        <q-item
          v-for="record in paginatedHistory"
          :key="record.id"
          class="exchange-item"
        >
          <q-item-section avatar>
            <q-avatar size="60px" class="exchange-avatar">
              <q-img :src="getProductImage(record.name)" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium">{{ record.name }}</q-item-label>
            <q-item-label caption class="text-grey-6">
              {{ formatDateTime(record.time) }}
            </q-item-label>
            <q-item-label caption class="text-grey-5">
              兌換編號：{{ record.id }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="text-right">
              <q-chip
                :color="getStatusColor(record.status)"
                text-color="white"
                :icon="getStatusIcon(record.status)"
                dense
              >
                {{ record.status }}
              </q-chip>
              <div class="text-h6 text-negative q-mt-sm">
                -{{ record.points }} 點
              </div>
            </div>
          </q-item-section>

          <q-item-section side>
            <q-btn
              flat
              round
              icon="more_vert"
              @click="showRecordDetails(record)"
            >
              <q-menu>
                <q-list dense>
                  <q-item clickable v-close-popup @click="showRecordDetails(record)">
                    <q-item-section avatar>
                      <q-icon name="info" />
                    </q-item-section>
                    <q-item-section>查看詳情</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="downloadReceipt(record)">
                    <q-item-section avatar>
                      <q-icon name="download" />
                    </q-item-section>
                    <q-item-section>下載收據</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- 分頁 -->
      <q-card-section v-if="totalPages > 1">
        <div class="row justify-center">
          <q-pagination
            v-model="currentPage"
            :max="totalPages"
            :max-pages="6"
            direction-links
            boundary-links
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- 空狀態 -->
    <q-card v-else class="text-center q-pa-xl">
      <q-icon name="receipt_long" size="4rem" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">
        {{ searchQuery || dateFilter ? '找不到符合條件的兌換紀錄' : '尚無兌換紀錄' }}
      </div>
      <div class="text-body2 text-grey-5 q-mt-sm">
        {{ searchQuery || dateFilter ? '請嘗試調整搜尋條件' : '開始兌換商品來建立您的紀錄' }}
      </div>
      <q-btn
        v-if="!searchQuery && !dateFilter"
        color="primary"
        label="瀏覽商品"
        class="q-mt-md"
        @click="$emit('navigate', 'products')"
      />
    </q-card>

    <!-- 詳情對話框 -->
    <q-dialog v-model="showDetailsDialog">
      <q-card style="min-width: 400px;">
        <q-card-section>
          <div class="text-h6">兌換詳情</div>
        </q-card-section>

        <q-card-section v-if="selectedRecord">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-4">
              <q-img
                :src="getProductImage(selectedRecord.name)"
                height="120px"
                class="rounded-borders"
              />
            </div>
            <div class="col-12 col-md-8">
              <q-list dense>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>商品名稱</q-item-label>
                    <q-item-label>{{ selectedRecord.name }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>兌換時間</q-item-label>
                    <q-item-label>{{ formatDateTime(selectedRecord.time) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>消耗點數</q-item-label>
                    <q-item-label>{{ selectedRecord.points }} 點</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>狀態</q-item-label>
                    <q-item-label>
                      <q-chip
                        :color="getStatusColor(selectedRecord.status)"
                        text-color="white"
                        :icon="getStatusIcon(selectedRecord.status)"
                        dense
                      >
                        {{ selectedRecord.status }}
                      </q-chip>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>兌換編號</q-item-label>
                    <q-item-label>{{ selectedRecord.id }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="關閉" v-close-popup />
          <q-btn color="primary" label="下載收據" @click="downloadReceipt(selectedRecord)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  history: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['navigate'])
const $q = useQuasar()

const searchQuery = ref('')
const dateFilter = ref(null)
const sortBy = ref('time-desc')
const currentPage = ref(1)
const itemsPerPage = 10
const showDetailsDialog = ref(false)
const selectedRecord = ref(null)

// 為歷史記錄添加額外的屬性
const enrichedHistory = computed(() => {
  return props.history.map((record, index) => ({
    ...record,
    id: `EX${Date.now()}${index.toString().padStart(3, '0')}`,
    status: getRandomStatus()
  }))
})

// 篩選選項
const dateFilterOptions = [
  { label: '最近 7 天', value: '7d' },
  { label: '最近 30 天', value: '30d' },
  { label: '最近 90 天', value: '90d' },
  { label: '今年', value: 'year' }
]

const sortOptions = [
  { label: '時間 (新到舊)', value: 'time-desc' },
  { label: '時間 (舊到新)', value: 'time-asc' },
  { label: '點數 (高到低)', value: 'points-desc' },
  { label: '點數 (低到高)', value: 'points-asc' }
]

// 計算屬性
const totalPointsSpent = computed(() => {
  return enrichedHistory.value.reduce((total, record) => total + record.points, 0)
})

const mostRecentExchange = computed(() => {
  if (enrichedHistory.value.length === 0) return '無'
  const latest = enrichedHistory.value.reduce((latest, record) => 
    record.time > latest.time ? record : latest
  )
  return formatRelativeTime(latest.time)
})

const filteredHistory = computed(() => {
  let filtered = [...enrichedHistory.value]

  // 搜尋篩選
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(record => 
      record.name.toLowerCase().includes(query)
    )
  }

  // 日期篩選
  if (dateFilter.value) {
    const now = Date.now()
    filtered = filtered.filter(record => {
      switch (dateFilter.value) {
        case '7d':
          return now - record.time <= 7 * 24 * 60 * 60 * 1000
        case '30d':
          return now - record.time <= 30 * 24 * 60 * 60 * 1000
        case '90d':
          return now - record.time <= 90 * 24 * 60 * 60 * 1000
        case 'year':
          return new Date(record.time).getFullYear() === new Date().getFullYear()
        default:
          return true
      }
    })
  }

  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'time-desc':
        return b.time - a.time
      case 'time-asc':
        return a.time - b.time
      case 'points-desc':
        return b.points - a.points
      case 'points-asc':
        return a.points - b.points
      default:
        return b.time - a.time
    }
  })

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredHistory.value.length / itemsPerPage)
})

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredHistory.value.slice(start, end)
})

// 方法
function formatDateTime(timestamp) {
  return new Date(timestamp).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatRelativeTime(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  if (days < 30) return `${Math.floor(days / 7)} 週前`
  return `${Math.floor(days / 30)} 個月前`
}

function getProductImage(productName) {
  // 根據產品名稱返回對應的圖片
  const imageMap = {
    '星巴克咖啡券': 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=星巴克咖啡券',
    '購物金 NT$200': 'https://via.placeholder.com/300x200/2196F3/FFFFFF?text=購物金',
    '無線藍牙耳機': 'https://via.placeholder.com/300x200/FF9800/FFFFFF?text=藍牙耳機',
    '電影票券': 'https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=電影票券',
    '健身房體驗券': 'https://via.placeholder.com/300x200/FF5722/FFFFFF?text=健身房券',
    '品牌手錶': 'https://via.placeholder.com/300x200/795548/FFFFFF?text=品牌手錶'
  }
  return imageMap[productName] || 'https://via.placeholder.com/300x200/9E9E9E/FFFFFF?text=商品'
}

function getRandomStatus() {
  const statuses = ['已完成', '處理中', '已發送']
  return statuses[Math.floor(Math.random() * statuses.length)]
}

function getStatusColor(status) {
  switch (status) {
    case '已完成':
      return 'positive'
    case '處理中':
      return 'warning'
    case '已發送':
      return 'info'
    default:
      return 'grey'
  }
}

function getStatusIcon(status) {
  switch (status) {
    case '已完成':
      return 'check_circle'
    case '處理中':
      return 'hourglass_empty'
    case '已發送':
      return 'local_shipping'
    default:
      return 'help'
  }
}

function showRecordDetails(record) {
  selectedRecord.value = record
  showDetailsDialog.value = true
}

function downloadReceipt(record) {
  $q.notify({
    type: 'info',
    message: `正在下載 ${record.name} 的兌換收據...`,
    position: 'top'
  })
  
  // 模擬下載延遲
  setTimeout(() => {
    $q.notify({
      type: 'positive',
      message: '收據下載完成！',
      position: 'top'
    })
  }, 2000)
}
</script>

<style scoped>
.exchange-history {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-card {
  text-align: center;
  border-left: 4px solid #1976d2;
}

.exchange-item {
  transition: background-color 0.2s;
}

.exchange-item:hover {
  background-color: #f5f5f5;
}

.exchange-avatar {
  border-radius: 8px;
}

.rounded-borders {
  border-radius: 8px;
}
</style>
