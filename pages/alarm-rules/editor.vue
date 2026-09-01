<template>
  <view class="page">
    <view class="editor-intro">
      <text class="editor-kicker">{{ $t('pages.alarmRules.editorKicker') }}</text>
      <text class="editor-title">{{ isEdit ? $t('pages.alarmRules.editTitle') : $t('pages.alarmRules.createTitle') }}</text>
      <text class="editor-description">{{ $t('pages.alarmRules.editorDescription') }}</text>
    </view>

    <view class="form-section">
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
        <picker :range="levelOptions" range-key="label" @change="selectLevel">
          <view class="field-control picker-control">
            <text>{{ selectedLevelLabel }}</text>
            <text class="picker-arrow">⌄</text>
          </view>
        </picker>
      </view>

      <view class="field">
        <text class="field-label">{{ $t('pages.alarmRules.notificationGroup') }}</text>
        <picker :range="notificationGroups" range-key="name" @change="selectNotificationGroup">
          <view class="field-control picker-control">
            <text>{{ selectedNotificationGroupName }}</text>
            <text class="picker-arrow">⌄</text>
          </view>
        </picker>
        <text v-if="!notificationGroups.length" class="field-help">{{ $t('pages.alarmRules.noGroupsHelp') }}</text>
      </view>

      <view class="field switch-field">
        <view>
          <text class="field-label inline-label">{{ $t('pages.alarmRules.enabled') }}</text>
          <text class="field-help">{{ $t('pages.alarmRules.enabledHelp') }}</text>
        </view>
        <switch :checked="form.enabled === 'Y'" color="#246fdd" @change="changeEnabled" />
      </view>
    </view>

    <view class="footer-actions">
      <button class="cancel-button" @click="cancel">{{ $t('common.cancel') }}</button>
      <button class="save-button" :loading="submitting" :disabled="submitting" @click="save">
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
      this.loading = true
      uni.showLoading({ title: this.$t('common.loading'), mask: true })
      try {
        const tasks = [getNotificationGroups({ page: 1, page_size: 1000 })]
        if (this.id) tasks.push(getAlarmRules({ page: 0, page_size: 0 }))
        const [groupResponse, ruleResponse] = await Promise.all(tasks)
        if (groupResponse.code === 200) {
          this.notificationGroups = (groupResponse.data?.list || []).filter(group => group.status === 'OPEN')
        }
        if (this.id) {
          if (ruleResponse.code !== 200) throw new Error(ruleResponse.message || 'load failed')
          const rule = (ruleResponse.data?.list || []).find(item => item.id === this.id)
          if (!rule) throw new Error('rule not found')
          this.form = {
            name: rule.name || '',
            description: rule.description || '',
            alarm_level: rule.alarm_level || 'M',
            notification_group_id: rule.notification_group_id || '',
            enabled: rule.enabled || 'Y'
          }
        }
      } catch (error) {
        uni.showToast({ title: this.$t('pages.alarmRules.loadFailed'), icon: 'none' })
      } finally {
        this.loading = false
        uni.hideLoading()
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
  min-height: 100vh;
  padding: 36rpx 30rpx 60rpx;
  box-sizing: border-box;
  background: #f4f7fb;
  color: #182230;
}

.editor-intro {
  padding: 8rpx 0 30rpx;
  border-bottom: 2rpx solid #246fdd;
}

.editor-kicker,
.editor-title,
.editor-description,
.field-label,
.field-help {
  display: block;
}

.editor-kicker {
  margin-bottom: 6rpx;
  color: #246fdd;
  font-size: 22rpx;
  letter-spacing: 2rpx;
}

.editor-title {
  margin-bottom: 10rpx;
  font-size: 40rpx;
  font-weight: 700;
}

.editor-description {
  color: #637083;
  font-size: 25rpx;
  line-height: 1.6;
}

.form-section {
  margin-top: 28rpx;
  border-top: 1rpx solid #d8e0ea;
  background: #fff;
}

.field {
  display: block;
  padding: 24rpx 22rpx;
  border-bottom: 1rpx solid #d8e0ea;
}

.field-label {
  margin-bottom: 12rpx;
  color: #334155;
  font-size: 25rpx;
  font-weight: 600;
}

.field-control {
  width: 100%;
  min-height: 68rpx;
  padding: 0 18rpx;
  box-sizing: border-box;
  border: 1rpx solid #cbd5e1;
  border-radius: 2rpx;
  background: #fbfcfe;
  color: #172033;
  font-size: 28rpx;
  line-height: 68rpx;
}

.textarea {
  height: 150rpx;
  padding-top: 16rpx;
  line-height: 1.5;
}

.picker-control,
.switch-field,
.footer-actions {
  display: flex;
  align-items: center;
}

.picker-control {
  justify-content: space-between;
}

.picker-arrow {
  color: #246fdd;
  font-size: 30rpx;
}

.field-help {
  margin-top: 10rpx;
  color: #788597;
  font-size: 22rpx;
  line-height: 1.5;
}

.switch-field {
  justify-content: space-between;
}

.inline-label {
  margin-bottom: 4rpx;
}

.footer-actions {
  gap: 18rpx;
  margin-top: 34rpx;
}

.cancel-button,
.save-button {
  flex: 1;
  height: 82rpx;
  margin: 0;
  border-radius: 3rpx;
  font-size: 28rpx;
  line-height: 82rpx;
}

.cancel-button {
  border: 1rpx solid #aeb9c7;
  background: #fff;
  color: #3e4a5b;
}

.save-button {
  border: 1rpx solid #246fdd;
  background: #246fdd;
  color: #fff;
}
</style>
