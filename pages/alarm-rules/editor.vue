<template>
  <view class="page">
    <view v-if="loading" class="load-state">{{ $t('common.loading') }}</view>
    <button v-else-if="loadFailed" class="load-state retry-button" @click="loadInitialData">{{ $t('pages.alarmRules.loadFailed') }} · {{ $t('dashboard.refresh') }}</button>
    <view v-else class="form-section">
      <label class="field">
        <text class="field-label">{{ $t('pages.alarmRules.name') }}</text>
        <input v-model.trim="form.name" class="field-control" :placeholder="$t('pages.alarmRules.namePlaceholder')" />
      </label>

      <label class="field">
        <text class="field-label">{{ $t('pages.alarmRules.description') }}</text>
        <textarea
          v-model.trim="form.description"
          class="field-control textarea"
          maxlength="255"
          :placeholder="$t('pages.alarmRules.descriptionPlaceholder')"
        />
      </label>

      <view class="field">
        <text class="field-label">{{ $t('pages.alarmRules.level') }}</text>
<app-picker :range="levelOptions" range-key="label" :value="levelOptions.findIndex(item => item.value === form.alarm_level)" @change="selectLevel">
          <view class="field-control picker-control">
            <text class="level-value" :class="'level-' + form.alarm_level">{{ selectedLevelLabel }}</text>
            <view class="picker-arrow" />
          </view>
        </app-picker>
      </view>

      <view class="field">
        <text class="field-label">{{ $t('pages.alarmRules.notificationGroup') }}</text>
<app-picker :range="notificationGroups" range-key="name" :value="Math.max(0, notificationGroups.findIndex(item => item.id === form.notification_group_id))" @change="selectNotificationGroup">
          <view class="field-control picker-control">
            <text class="picker-value">{{ selectedNotificationGroupName }}</text>
            <view class="picker-arrow" />
          </view>
        </app-picker>
        <text v-if="!notificationGroups.length" class="field-help">{{ $t('pages.alarmRules.noGroupsHelp') }}</text>
      </view>

      <view class="field switch-field">
        <view class="switch-copy">
          <text class="field-label inline-label">{{ $t('pages.alarmRules.enabled') }}</text>
          <text class="field-help">{{ $t('pages.alarmRules.enabledHelp') }}</text>
        </view>
        <switch class="rule-switch" :checked="form.enabled === 'Y'" color="#1677ff" :aria-label="$t('pages.alarmRules.enabled')" @change="changeEnabled" />
      </view>
    </view>

    <view class="footer-actions">
      <button class="cancel-button" @click="cancel">{{ $t('common.cancel') }}</button>
      <button class="save-button" :loading="submitting" :disabled="submitting || loading || loadFailed" @click="save">
        {{ $t('pages.alarmRules.save') }}
      </button>
    </view>
  </view>
</template>

<script>
import { createAlarmRule, getAlarmRules, updateAlarmRule } from '@/api/modules/alarm'
import { getNotificationGroups } from '@/api/modules/notification'

export default {
  data() {
    return {
      id: '',
      loading: false,
      loadFailed: false,
      submitting: false,
      notificationGroups: [],
      form: {
        name: '',
        description: '',
        alarm_level: 'M',
        notification_group_id: '',
        enabled: 'Y'
      }
    }
  },
  computed: {
    isEdit() {
      return Boolean(this.id)
    },
    levelOptions() {
      return [
        { value: 'H', label: this.$t('pages.alarmRules.levels.H') },
        { value: 'M', label: this.$t('pages.alarmRules.levels.M') },
        { value: 'L', label: this.$t('pages.alarmRules.levels.L') }
      ]
    },
    selectedLevelLabel() {
      return this.levelOptions.find(item => item.value === this.form.alarm_level)?.label || ''
    },
    selectedNotificationGroupName() {
      return this.notificationGroups.find(item => item.id === this.form.notification_group_id)?.name
        || this.$t('pages.alarmRules.noNotificationGroup')
    }
  },
  async onLoad(options) {
    this.id = options?.id || ''
    await this.loadInitialData()
  },
  methods: {
    async loadInitialData() {
      if (this.loading) return
      this.loading = true
      this.loadFailed = false

      try {
        const tasks = [getNotificationGroups({ page: 1, page_size: 1000 })]
        if (this.id) tasks.push(this.loadRule())
        const [groupResponse, rule] = await Promise.all(tasks)
        if (groupResponse.code !== 200) throw new Error('notification groups load failed')
        if (groupResponse.code === 200) {
          this.notificationGroups = (groupResponse.data?.list || []).filter(group => group.status === 'OPEN')
        }
        if (this.id) {
          this.form = {
            name: rule.name || '',
            description: rule.description || '',
            alarm_level: rule.alarm_level || 'M',
            notification_group_id: rule.notification_group_id || '',
            enabled: rule.enabled || 'Y'
          }
        }
      } catch (error) {
        this.loadFailed = true
        uni.showToast({ title: this.$t('pages.alarmRules.loadFailed'), icon: 'none' })
      } finally {
        this.loading = false

      }
    },
    async loadRule() {
      // 列表接口要求正整数分页，不能用 0 请求全部；逐页查找到目标即停止。
      const pageSize = 100
      for (let page = 1; ; page += 1) {
        const response = await getAlarmRules({ page, page_size: pageSize })
        if (response.code !== 200) throw new Error('rule load failed')
        const list = response.data?.list || []
        const rule = list.find(item => item.id === this.id)
        if (rule) return rule
        if (!list.length || page * pageSize >= Number(response.data?.total || 0)) {
          throw new Error('rule not found')
        }
      }
    },
    selectLevel(event) {
      this.form.alarm_level = this.levelOptions[Number(event.detail.value)]?.value || 'M'
    },
    selectNotificationGroup(event) {
      this.form.notification_group_id = this.notificationGroups[Number(event.detail.value)]?.id || ''
    },
    changeEnabled(event) {
      this.form.enabled = event.detail.value ? 'Y' : 'N'
    },
    validate() {
      if (!this.form.name) return this.$t('pages.alarmRules.nameRequired')
      if (!this.form.alarm_level) return this.$t('pages.alarmRules.levelRequired')
      return ''
    },
    async save() {
      if (this.loading || this.loadFailed || this.submitting) return
      const validationMessage = this.validate()
      if (validationMessage) {
        uni.showToast({ title: validationMessage, icon: 'none' })
        return
      }
      this.submitting = true
      try {
        const payload = { ...this.form }
        if (this.id) payload.id = this.id
        const response = this.id
          ? await updateAlarmRule(payload)
          : await createAlarmRule(payload)
        if (response.code !== 200) throw new Error(response.message || 'save failed')
        uni.showToast({ title: this.$t('pages.alarmRules.saved'), icon: 'success' })
        setTimeout(() => uni.navigateBack(), 400)
      } catch (error) {
        uni.showToast({ title: this.$t('pages.alarmRules.saveFailed'), icon: 'none' })
      } finally {
        this.submitting = false
      }
    },
    cancel() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height:100vh;
  padding:24rpx 28rpx calc(36rpx + env(safe-area-inset-bottom));
  box-sizing:border-box;
  background:#f2f2f7;
  color:#1d1d1f;
  font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size:22rpx;
}
.form-section { display:flex; flex-direction:column; gap:16rpx; }
.field { display:block; padding:24rpx; border-radius:12rpx; background:#fff; }
.field-label { display:block; margin-bottom:14rpx; font-size:27rpx; font-weight:600; line-height:38rpx; }
.field-control {
  width:100%;
  min-height:68rpx;
  padding:0 18rpx;
  box-sizing:border-box;
  border:0;
  border-radius:10rpx;
  background:#f7f8fa;
  color:#1d1d1f;
  font-family:inherit;
  font-size:22rpx;
  line-height:32rpx;
}
.textarea { height:140rpx; padding:16rpx 18rpx; line-height:32rpx; }
.picker-control { display:flex; align-items:center; justify-content:space-between; gap:20rpx; }
.picker-value { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.picker-arrow { flex-shrink:0; width:10rpx; height:10rpx; margin:-5rpx 4rpx 0 0; border-right:2rpx solid #73737d; border-bottom:2rpx solid #73737d; transform:rotate(45deg); }
.level-value { display:flex; align-items:center; gap:10rpx; }
.level-value::before { content:''; width:12rpx; height:12rpx; border-radius:50%; background:currentColor; }
.level-H { color:#ff4d35; }
.level-M { color:#ff9500; }
.level-L { color:#1677ff; }
.field-help { display:block; margin-top:10rpx; color:#73737d; font-size:22rpx; line-height:32rpx; }
.switch-field { display:flex; align-items:center; justify-content:space-between; gap:24rpx; }
.switch-copy { flex:1; min-width:0; }
.inline-label { margin-bottom:0; }
.rule-switch { flex-shrink:0; }
/* 与规则列表保持相同的 H5 轨道尺寸，保留 44px 点击区域。 */
/* #ifdef H5 */
.rule-switch { display:flex; align-items:center; justify-content:flex-end; min-width:44px; min-height:44px; }
.rule-switch :deep(.uni-switch-input) { width:36px; height:20px; margin:0; border-radius:10px; }
.rule-switch :deep(.uni-switch-input::before) { width:34px; height:18px; border-radius:9px; }
.rule-switch :deep(.uni-switch-input::after) { width:18px; height:18px; border-radius:9px; box-shadow:0 1px 2px rgba(0,0,0,.15); }
.rule-switch :deep(.uni-switch-input.uni-switch-input-checked::after) { transform:translateX(16px); }
/* #endif */
.footer-actions { display:flex; align-items:center; gap:16rpx; margin-top:24rpx; }
.page .cancel-button, .page .save-button {
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:44px;
  height:72rpx;
  margin:0;
  padding:0 24rpx;
  border:0;
  border-radius:12rpx;
  font-family:inherit;
  font-size:22rpx;
  font-weight:500;
  line-height:32rpx;
}
.page .cancel-button { flex:1; background:#fff; color:#51515c; }
.page .save-button { flex:2; background:#1677ff; color:#fff; }
.page .save-button[disabled] { opacity:.6; color:#fff; background:#1677ff; }
.load-state { padding:48rpx 24rpx; text-align:center; color:#73737d; font:inherit; }
.retry-button { width:100%; margin:0; border:0; border-radius:12rpx; background:#fff; color:#1677ff; }
.cancel-button::after, .save-button::after { border:0; }
button:focus-visible, .field-control:focus-visible { outline:2rpx solid #1677ff; outline-offset:4rpx; }
</style>
