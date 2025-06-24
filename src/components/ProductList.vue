<template>
  <div class="product-list">
    <div class="q-mb-md">
      <div class="text-h4 q-mb-sm">兌換商品</div>
      <div class="text-subtitle1 text-grey-6">選擇您想要的商品進行兌換</div>
    </div>

    <!-- 篩選和搜尋 -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-md items-end">
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchQuery"
              outlined
              label="搜尋商品"
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
              v-model="categoryFilter"
              outlined
              label="商品分類"
              :options="categoryOptions"
              clearable
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="pointsFilter"
              outlined
              label="點數範圍"
              :options="pointsOptions"
              clearable
              emit-value
              map-options
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 商品網格 -->
    <div class="row q-gutter-md">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card class="product-card cursor-pointer" @click="selectProduct(product)">
          <q-img
            :src="product.image"
            :alt="product.name"
            height="200px"
            class="product-image"
          >
            <div class="absolute-bottom-right q-ma-sm">
              <q-chip
                :color="product.points <= userPoints ? 'positive' : 'negative'"
                text-color="white"
                icon="stars"
              >
                {{ product.points }} 點
              </q-chip>
            </div>
          </q-img>
          
          <q-card-section>
            <div class="text-h6 text-weight-medium q-mb-xs">{{ product.name }}</div>
            <div class="text-body2 text-grey-7 q-mb-sm">{{ product.description }}</div>
            <div class="text-caption text-grey-6">分類：{{ product.category }}</div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              :disabled="product.points > userPoints"
              :color="product.points <= userPoints ? 'primary' : 'grey-5'"
              :label="product.points <= userPoints ? '立即兌換' : '點數不足'"
              @click.stop="openExchangeDialog(product)"
            />
          </q-card-actions>

          <!-- 點數不足時的遮罩 -->
          <div v-if="product.points > userPoints" class="product-overlay">
            <div class="overlay-content">
              <q-icon name="lock" size="md" class="text-grey-5" />
              <div class="text-grey-5 q-mt-sm">點數不足</div>
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-if="filteredProducts.length === 0" class="text-center q-pa-xl">
      <q-icon name="search_off" size="4rem" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">找不到符合條件的商品</div>
      <div class="text-body2 text-grey-5">請嘗試調整搜尋條件</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  userPoints: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['exchange-product'])

const searchQuery = ref('')
const categoryFilter = ref(null)
const pointsFilter = ref(null)

// 商品資料
const products = ref([
  {
    id: 1,
    name: '星巴克咖啡券',
    points: 100,
    image: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=星巴克咖啡券',
    description: '可於全台星巴克門市使用，價值 NT$100',
    category: '餐飲'
  },
  {
    id: 2,
    name: '購物金 NT$200',
    points: 180,
    image: 'https://via.placeholder.com/300x200/2196F3/FFFFFF?text=購物金',
    description: '線上購物平台通用購物金',
    category: '購物'
  },
  {
    id: 3,
    name: '無線藍牙耳機',
    points: 500,
    image: 'https://via.placeholder.com/300x200/FF9800/FFFFFF?text=藍牙耳機',
    description: '高品質無線藍牙耳機，支援降噪功能',
    category: '3C電子'
  },
  {
    id: 4,
    name: '電影票券',
    points: 150,
    image: 'https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=電影票券',
    description: '全台威秀影城通用電影票券',
    category: '娛樂'
  },
  {
    id: 5,
    name: '健身房體驗券',
    points: 200,
    image: 'https://via.placeholder.com/300x200/FF5722/FFFFFF?text=健身房券',
    description: '一週健身房免費體驗，含個人教練指導',
    category: '運動'
  },
  {
    id: 6,
    name: '品牌手錶',
    points: 800,
    image: 'https://via.placeholder.com/300x200/795548/FFFFFF?text=品牌手錶',
    description: '知名品牌時尚手錶，防水設計',
    category: '時尚'
  }
])

// 篩選選項
const categoryOptions = [
  { label: '餐飲', value: '餐飲' },
  { label: '購物', value: '購物' },
  { label: '3C電子', value: '3C電子' },
  { label: '娛樂', value: '娛樂' },
  { label: '運動', value: '運動' },
  { label: '時尚', value: '時尚' }
]

const pointsOptions = [
  { label: '100 點以下', value: '0-100' },
  { label: '100-300 點', value: '100-300' },
  { label: '300-500 點', value: '300-500' },
  { label: '500 點以上', value: '500+' }
]

// 篩選後的商品
const filteredProducts = computed(() => {
  let filtered = products.value

  // 搜尋篩選
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    )
  }

  // 分類篩選
  if (categoryFilter.value) {
    filtered = filtered.filter(product => product.category === categoryFilter.value)
  }

  // 點數範圍篩選
  if (pointsFilter.value) {
    filtered = filtered.filter(product => {
      switch (pointsFilter.value) {
        case '0-100':
          return product.points <= 100
        case '100-300':
          return product.points > 100 && product.points <= 300
        case '300-500':
          return product.points > 300 && product.points <= 500
        case '500+':
          return product.points > 500
        default:
          return true
      }
    })
  }

  return filtered
})

function selectProduct(product) {
  // 可以在這裡添加商品詳情頁面導航
  console.log('Selected product:', product)
}

function openExchangeDialog(product) {
  if (product.points <= props.userPoints) {
    emit('exchange-product', product)
  }
}
</script>

<style scoped>
.product-list {
  max-width: 1200px;
  margin: 0 auto;
}

.product-card {
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.product-image {
  object-fit: cover;
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.overlay-content {
  text-align: center;
}
</style>
