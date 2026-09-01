<template>
  <view class="page">
    <view class="page-header">
      <view>
        <text class="eyebrow">{{ $t('pages.alarmRules.eyebrow') }}</text>
        <text class="page-title">{{ $t('pages.alarmRules.title') }}</text>
      </view>
      <button class="create-button" @click="openEditor()">
        <text class="create-icon">＋</text>
        {{ $t('pages.alarmRules.create') }}
      </button>
    </view>

    <view class="filter-row">
      <input
        v-model.trim="keyword"
        class="search-input"
        :placeholder="$t('pages.alarmRules.searchPlaceholder')"
        confirm-type="search"
        @confirm="refresh"
      />
      <button class="search-button" @click="refresh">{{ $t('common.search') }}</button>
    </view>

    <scroll-view scroll-x class="quick-filter-scroll" :show-scrollbar="false">
      <view class="quick-filters">
        <text class="filter-label">{{ $t('pages.alarmRules.level') }}</text>
        <text
          v-for="option in levelFilters"
          :key="option.value"
          class="filter-option"
          :class="{ active: alarmLevel === option.value }"
          @click="selectLevel(option.value)"
        >{{ option.label }}</text>
      </view>
    </scroll-view>
    <view class="status-filters">
      <text class="filter-label">{{ $t('common.status') }}</text>
      <text
        v-for="option in enabledFilters"
        :key="option.value"
        class="filter-option"
        :class="{ active: enabled === option.value }"
        @click="selectEnabled(option.value)"
      >{{ option.label }}</text>
    </view>

    <view v-if="loading && !rules.length" class="state-block">
      <text>{{ $t('common.loading') }}</text>
    </view>

    <view v-else-if="!rules.length" class="state-block empty-state">
      <text class="empty-title">{{ $t('pages.alarmRules.emptyTitle') }}</text>
      <text class="empty-description">{{ $t('pages.alarmRules.emptyDescription') }}</text>
      <button class="empty-action" @click="openEditor()">{{ $t('pages.alarmRules.createFirst') }}</button>
    </view>

    <view v-else class="rule-list">
      <view v-for="rule in rules" :key="rule.id" class="rule-row">
        <view class="level-rail" :class="levelClass(rule.alarm_level)"></view>
        <view class="rule-main" @click="openEditor(rule)">
          <view class="rule-heading">
            <text class="rule-name">{{ rule.name }}</text>
            <text class="level-label" :class="levelClass(rule.alarm_level)">
              {{ levelLabel(rule.alarm_level) }}
            </text>
          </view>
          <text class="rule-description">{{ rule.description || $t('common.none') }}</text>
          <view class="rule-meta">
            <text>{{ $t('pages.alarmRules.notificationGroup') }}</text>
            <text class="meta-value">{{ rule.notification_group_name || $t('pages.alarmRules.noNotificationGroup') }}</text>
          </view>
        </view>
        <view class="rule-actions">
          <switch
            :checked="rule.enabled === 'Y'"
            color="#246fdd"
            @change="toggleRule(rule, $event)"
          />
          <button class="text-action" @click="openEditor(rule)">{{ $t('common.edit') }}</button>
          <button class="text-action danger" @click="confirmDelete(rule)">{{ $t('common.delete') }}</button>
        </view>
      </view>
    </view>

    <view v-if="rules.length && !finished" class="load-more" @click="loadMore">
      {{ loading ? $t('common.loading') : $t('pages.alarmRules.loadMore') }}
    </view>
  </view>
</template>

<script>
import {
  deleteAlarmRule,
  getAlarmRules,
  updateAlarmRule
} from '@/api/modules/alarm'

export default {
  data() {
    return {
      keyword: '',
      alarmLevel: '',
      enabled: '',
      loading: false,
      page: 1,
      pageSize: 20,
      total: 0,
      rules: []
    }
  },
  computed: {
    levelFilters() {
      return [
        { value: '', label: this.$t('pages.alarmRules.allLevels') },
        { value: 'H', label: this.$t('pages.alarmRules.levels.H') },
        { value: 'M', label: this.$t('pages.alarmRules.levels.M') },
        { value: 'L', label: this.$t('pages.alarmRules.levels.L') }
      ]
    },
    enabledFilters() {
      return [
        { value: '', label: this.$t('pages.alarmRules.allStatuses') },
        { value: 'Y', label: this.$t('pages.alarmRules.active') },
        { value: 'N', label: this.$t('pages.alarmRules.inactive') }
      ]
    },
    finished() {
      return this.rules.length >= this.total
    }
  },
  onShow() {
    this.refresh()
  },
  methods: {
    levelClass(level) {
      return { H: 'high', M: 'medium', L: 'low' }[level] || 'low'
    },
    levelLabel(level) {
      return this.$t(`pages.alarmRules.levels.${level || 'L'}`)
    },
    async fetchRules(reset = false) {
      if (this.loading) return
      if (reset) {
        this.page = 1
        this.rules = []
      }
      this.loading = true
      try {
        const response = await getAlarmRules({
          page: this.page,
          page_size: this.pageSize,
          name: this.keyword || undefined,
          alarm_level: this.alarmLevel || undefined,
          enabled: this.enabled || undefined
        })
        if (response.code !== 200) throw new Error(response.message || 'load failed')
        const data = response.data || {}
        this.total = Number(data.total || 0)
        this.rules = reset ? (data.list || []) : this.rules.concat(data.list || [])
      } catch (error) {
        uni.showToast({ title: this.$t('pages.alarmRules.loadFailed'), icon: 'none' })
      } finally {
        this.loading = false
        uni.stopPullDownRefresh()
      }
    },
    refresh() {
      return this.fetchRules(true)
    },
    selectLevel(level) {
      if (this.alarmLevel === level) return
      this.alarmLevel = level
      this.refresh()
    },
    selectEnabled(enabled) {
      if (this.enabled === enabled) return
      this.enabled = enabled
      this.refresh()
    },
    loadMore() {
      if (this.loading || this.finished) return
      this.page += 1
      this.fetchRules()
    },
    openEditor(rule) {
      const query = rule?.id ? `?id=${encodeURIComponent(rule.id)}` : ''
      uni.navigateTo({ url: `/pages/alarm-rules/editor${query}` })
    },
    async toggleRule(rule, event) {
      const enabled = event.detail.value ? 'Y' : 'N'
      try {
        const response = await updateAlarmRule({ id: rule.id, enabled })
        if (response.code !== 200) throw new Error(response.message || 'update failed')
        rule.enabled = enabled
      } catch (error) {
        uni.showToast({ title: this.$t('pages.alarmRules.updateFailed'), icon: 'none' })
        this.refresh()
      }
    },
    confirmDelete(rule) {
      uni.showModal({
        title: this.$t('pages.alarmRules.deleteTitle'),
        content: this.$t('pages.alarmRules.deleteConfirm', { name: rule.name }),
        success: async result => {
          if (!result.confirm) return
          try {
            const response = await deleteAlarmRule(rule.id)
            if (response.code !== 200) throw new Error(response.message || 'delete failed')
            uni.showToast({ title: this.$t('pages.alarmRules.deleted'), icon: 'none' })
            this.refresh()
          } catch (error) {
            uni.showToast({ title: this.$t('pages.alarmRules.deleteFailed'), icon: 'none' })
          }
        }
      })
    }
  },
  onPullDownRefresh() {
    this.refresh()
  },
  onReachBottom() {
    this.loadMore()
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 32rpx 28rpx 60rpx;
  box-sizing: border-box;
  background: #f4f7fb;
  color: #182230;
}

.page-header,
.filter-row,
.rule-row,
.rule-heading,
.rule-meta,
.rule-actions {
  display: flex;
  align-items: center;
}

.page-header {
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.eyebrow,
.page-title {
  display: block;
}

.eyebrow {
  margin-bottom: 6rpx;
  color: #64748b;
  font-size: 22rpx;
  letter-spacing: 2rpx;
}

.page-title {
  font-size: 42rpx;
  font-weight: 700;
  line-height: 1.2;
}

.create-button,
.search-button,
.empty-action {
  margin: 0;
  border: 0;
  border-radius: 4rpx;
  background: #246fdd;
  color: #fff;
}

.create-button {
  height: 72rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
  line-height: 72rpx;
}

.create-icon {
  margin-right: 6rpx;
  font-size: 30rpx;
}

.filter-row {
  margin-bottom: 24rpx;
  border-bottom: 2rpx solid #d8e0ea;
  background: #fff;
}

.quick-filter-scroll {
  width: 100%;
  white-space: nowrap;
}

.quick-filters,
.status-filters {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-width: max-content;
}

.quick-filters {
  padding: 0 0 12rpx;
}

.status-filters {
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #dbe3ed;
}

.filter-label {
  margin-right: 4rpx;
  color: #758294;
  font-size: 22rpx;
}

.filter-option {
  padding: 8rpx 18rpx;
  color: #5d6979;
  background: #e9eef4;
  border-bottom: 4rpx solid transparent;
  border-radius: 2rpx;
  font-size: 22rpx;
  line-height: 30rpx;

  &.active {
    color: #1f5fb7;
    background: #e1ebfa;
    border-color: #246fdd;
    font-weight: 600;
  }
}

.search-input {
  flex: 1;
  height: 80rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.search-button {
  width: 112rpx;
  height: 64rpx;
  margin-right: 8rpx;
  line-height: 64rpx;
  font-size: 26rpx;
}

.rule-list {
  border-top: 1rpx solid #dbe3ed;
}

.rule-row {
  position: relative;
  align-items: stretch;
  min-height: 190rpx;
  border-bottom: 1rpx solid #dbe3ed;
  background: #fff;
}

.level-rail {
  width: 8rpx;
  flex: 0 0 8rpx;
}

.level-rail.high { background: #d93f3f; }
.level-rail.medium { background: #d88416; }
.level-rail.low { background: #2d8f67; }

.rule-main {
  flex: 1;
  min-width: 0;
  padding: 24rpx 20rpx;
}

.rule-heading {
  gap: 14rpx;
  margin-bottom: 10rpx;
}

.rule-name {
  max-width: 340rpx;
  overflow: hidden;
  color: #152033;
  font-size: 30rpx;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.level-label {
  padding: 2rpx 10rpx;
  border: 1rpx solid currentColor;
  border-radius: 2rpx;
  font-size: 20rpx;
}

.level-label.high { color: #b52f35; }
.level-label.medium { color: #a35c08; }
.level-label.low { color: #247553; }

.rule-description {
  display: block;
  min-height: 40rpx;
  margin-bottom: 16rpx;
  overflow: hidden;
  color: #5c6878;
  font-size: 25rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rule-meta {
  gap: 12rpx;
  color: #7b8796;
  font-size: 22rpx;
}

.meta-value {
  color: #354255;
}

.rule-actions {
  width: 116rpx;
  padding: 18rpx 12rpx;
  box-sizing: border-box;
  flex-direction: column;
  justify-content: center;
  border-left: 1rpx solid #edf1f5;
}

.rule-actions switch {
  margin-bottom: 8rpx;
  transform: scale(.72);
}

.text-action {
  min-width: 88rpx;
  margin: 0;
  padding: 4rpx 0;
  border: 0;
  background: transparent;
  color: #246fdd;
  font-size: 22rpx;
  line-height: 34rpx;
}

.text-action.danger {
  color: #b52f35;
}

.state-block {
  padding: 140rpx 40rpx;
  text-align: center;
  color: #7a8797;
}

.empty-title,
.empty-description {
  display: block;
}

.empty-title {
  margin-bottom: 12rpx;
  color: #263346;
  font-size: 32rpx;
  font-weight: 650;
}

.empty-description {
  margin-bottom: 28rpx;
  font-size: 25rpx;
}

.empty-action {
  display: inline-block;
  padding: 0 30rpx;
  line-height: 68rpx;
  font-size: 25rpx;
}

.load-more {
  padding: 30rpx 0;
  color: #246fdd;
  font-size: 25rpx;
  text-align: center;
}
</style>
