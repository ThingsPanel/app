<template>
  <ConfirmationModal :model-value="visible" :title="$t('components.notifyDialog.confirmText', { action: String(status) === '1' ? $t('components.notifyDialog.process') : $t('components.notifyDialog.ignore') })" :cancel-text="$t('common.cancel')" :confirm-text="$t('common.confirm')" :auto-close="false" :loading="saving" @cancel="cancle()" @confirm="confirm">
    <template #text>
      <input class="app-dialog-input" type="text" :placeholder="$t('components.notifyDialog.optional')" :aria-label="$t('components.notifyDialog.optional')" v-model="content" :disabled="saving" />
    </template>
  </ConfirmationModal>
</template>
<script>
import ConfirmationModal from '@/components/confirmation-modal/index.vue'
export default {
  components: { ConfirmationModal },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    id:{
      type: [String,Number],
      default: ''
    },
    status:{
      type: [String,Number],
      default: ''
    }
  },
  data(){
    return {
      content: '',
      saving: false
    }
  },
  methods:{
    confirm(){
      if (this.saving) return
      this.saving = true
      this.API.apiRequest('/api/v1/alarm/info', {
        id: this.id, 
        processing_result: this.status, 
        processing_instructions: this.content
      }, 'put').then(res => {
        if (res.code === 200) {
          uni.showToast({
            title: this.$t('components.notifyDialog.operationSuccess')
          })
          this.cancle(true)
        } else {
          throw new Error(res.message || res.msg || '操作失败，请重试')
        }
      }).catch(error => {
        uni.showToast({ title: error.message || '操作失败，请重试', icon: 'none' })
      }).finally(() => { this.saving = false })
    },
    cancle(refresh){
      this.$emit('close', refresh)
    }
  },
  watch:{
    visible(val){
      if(val){
        this.content = ''
      }
    }
  }
  
}
</script>
