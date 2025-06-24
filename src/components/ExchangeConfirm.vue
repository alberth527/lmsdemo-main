<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 400px; max-width: 600px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">確認兌換</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="row q-gutter-md">
          <div class="col-12 col-md-4">
            <q-img
              :src="product.image"
              :alt="product.name"
              height="150px"
              class="rounded-borders"
            />
          </div>
          <div class="col-12 col-md-8">
            <div class="text-h6 q-mb-sm">{{ product.name }}</div>
            <div class="text-body2 text-grey-7 q-mb-md">{{ product.description }}</div>
            <div class="text-subtitle2 text-grey-6 q-mb-sm">分類：{{ product.category }}</div>
            
            <q-separator class="q-my-md" />
            
            <div class="exchange-details">
              <div class="row q-gutter-md">
                <div class="col">
                  <div class="text-caption text-grey-6">所需點數</div>
                  <div class="text-h6 text-negative">{{ product.points }} 點</div>
                </div>
                <div class="col">
                  <div class="text-caption text-grey-6">目前點數</div>
                  <div class="text-h6 text-primary">{{ userPoints }} 點</div>
                </div>
                <div class="col">
                  <div class="text-caption text-grey-6">兌換後剩餘</div>
                  <div class="text-h6" :class="remainingPoints >= 0 ? 'text-positive' : 'text-negative'">
                    {{ remainingPoints }} 點
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section v-if="remainingPoints < 0">
        <q-banner class="bg-negative text-white rounded-borders">
          <template v-slot:avatar>
            <q-icon name="warning" />
          </template>
          點數不足，無法進行兌換。您還需要 {{ Math.abs(remainingPoints) }} 點才能兌換此商品。
        </q-banner>
      </q-card-section>

      <q-card-section v-else>
        <q-banner class="bg-positive text-white rounded-borders">
          <template v-slot:avatar>
            <q-icon name="check_circle" />
          </template>
          點數充足，可以進行兌換！
        </q-banner>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-body2 text-grey-6">
          <q-icon name="info" class="q-mr-sm" />
          兌換後的商品將在 3-5 個工作天內寄送，請確認您的聯絡資訊正確。
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="取消" v-close-popup />
        <q-btn
          :disabled="remainingPoints < 0 || exchanging"
          :loading="exchanging"
          color="primary"
          label="確認兌換"
          @click="confirmExchange"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  userPoints: {
    type: Number,
    required: true
  },
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm-exchange'])
const $q = useQuasar()

const exchanging = ref(false)

const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const remainingPoints = computed(() => {
  return props.userPoints - props.product.points
})

async function confirmExchange() {
  if (remainingPoints.value < 0) return
  
  exchanging.value = true
  
  try {
    // 模擬 API 呼叫延遲
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 顯示成功訊息
    $q.notify({
      type: 'positive',
      message: `成功兌換 ${props.product.name}！`,
      caption: `已扣除 ${props.product.points} 點數`,
      position: 'top',
      timeout: 3000,
      actions: [
        { 
          label: '查看紀錄', 
          color: 'white', 
          handler: () => {
            // 可以在這裡觸發導航到兌換紀錄頁面
          }
        }
      ]
    })
    
    // 發送兌換確認事件
    emit('confirm-exchange', {
      product: props.product,
      points: props.product.points,
      timestamp: Date.now()
    })
    
    // 關閉對話框
    showDialog.value = false
    
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '兌換失敗，請稍後再試',
      position: 'top'
    })
  } finally {
    exchanging.value = false
  }
}
</script>

<style scoped>
.exchange-details {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}

.rounded-borders {
  border-radius: 8px;
}
</style>
