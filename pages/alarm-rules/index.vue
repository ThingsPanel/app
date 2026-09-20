<template>
  <view class="page">
    <view class="filter-panel">
      <AppSearch v-model.trim="keyword" :placeholder="$t('pages.alarmRules.searchPlaceholder')" :action-label="$t('common.search')" @search="refresh" @action="refresh" @clear="clearKeyword" />

      <view class="compact-filters">
<app-picker :range="levelFilters" range-key="label" :value="levelFilters.findIndex(option => option.value === alarmLevel)" :disabled="loading" @change="selectLevel(levelFilters[Number($event.detail.value)].value)">
          <view class="filter-trigger" :class="{ active: alarmLevel }">
            <text>{{ $t('pages.alarmRules.level') }} · {{ levelFilters.find(option => option.value === alarmLevel).label }}</text>
            <view class="filter-chevron" />
          </view>
        </app-picker>
<app-picker :range="enabledFilters" range-key="label" :value="enabledFilters.findIndex(option => option.value === enabled)" :disabled="loading" @change="selectEnabled(enabledFilters[Number($event.detail.value)].value)">
          <view class="filter-trigger" :class="{ active: enabled }">
            <text>{{ $t('common.status') }} · {{ enabledFilters.find(option => option.value === enabled).label }}</text>
            <view class="filter-chevron" />
          </view>
        </app-picker>
      </view>
    </view>

    <view v-if="loading && !rules.length" class="rule-list skeleton-list" aria-busy="true">
      <view v-for="index in 3" :key="index" class="rule-card skeleton-card">
        <view class="skeleton-line skeleton-title" />
        <view class="skeleton-line skeleton-copy" />
        <view class="skeleton-line skeleton-meta" />
      </view>
    </view>

    <view v-else-if="!rules.length" class="state-block empty-state">
      <view class="empty-mark"><image src="/static/icon/home/bell.svg" mode="aspectFit" /></view>
      <text class="empty-title">{{ $t('pages.alarmRules.emptyTitle') }}</text>
      <text class="empty-description">{{ $t('pages.alarmRules.emptyDescription') }}</text>
      <button class="empty-action" @click="openEditor()">{{ $t('pages.alarmRules.createFirst') }}</button>
    </view>

    <view v-else class="rule-list">
      <view v-for="rule in rules" :key="rule.id" class="rule-card">
        <button class="rule-main" @click="openEditor(rule)">
          <view class="rule-heading">
            <text class="rule-name">{{ rule.name }}</text>
            <text class="level-label" :class="levelClass(rule.alarm_level)">
              {{ levelLabel(rule.alarm_level) }}
            </text>
          </view>
          <text v-if="rule.description" class="rule-description">{{ rule.description }}</text>
          <view class="rule-meta">
            <text>{{ $t('pages.alarmRules.notificationGroup') }} ·</text>
            <text class="meta-value">{{ rule.notification_group_name || $t('pages.alarmRules.noNotificationGroup') }}</text>
          </view>
        </button>
        <view class="rule-actions">
          <button class="text-action" @click="openEditor(rule)">{{ $t('common.edit') }}</button>
          <button class="text-action danger" @click="confirmDelete(rule)">{{ $t('common.delete') }}</button>
          <view class="rule-status">
            <text>{{ $t(rule.enabled === 'Y' ? 'pages.alarmRules.active' : 'pages.alarmRules.inactive') }}</text>
          </view>
          <switch
            class="rule-switch"
            :checked="rule.enabled === 'Y'"
            color="#1677ff"
            :aria-label="$t('common.status')"
            @change="toggleRule(rule, $event)"
          />
        </view>
      </view>
    </view>

    <view v-if="rules.length && !finished" class="load-more" @click="loadMore">
      {{ loading ? $t('common.loading') : $t('pages.alarmRules.loadMore') }}
    </view>
    <ConfirmationModal ref="deleteDialog" danger :confirm-text="$t('common.delete')" :cancel-text="$t('common.cancel')" />
  </view>
</template>

<script>
import AppSearch from '@/components/app-search/index.vue'
import ConfirmationModal from '@/components/confirmation-modal/index.vue'
import {
  deleteAlarmRule,
  getAlarmRules,
  updateAlarmRule
} from '@/api/modules/alarm'

export default {
  components: { AppSearch, ConfirmationModal },
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
  onNavigationBarButtonTap(event) {
    if (event.index === 0) this.openEditor()
  },
  methods: {
    levelClass(level) {
      // 兼容 'H'/'M'/'L' 与 '1'/'2'/'3' 两种等级编码
      return { H: 'high', M: 'medium', L: 'low', '1': 'high', '2': 'medium', '3': 'low' }[String(level ?? '').toUpperCase()] || 'low'
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
    clearKeyword() {
      this.keyword = ''
      this.refresh()
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
      this.$refs.deleteDialog.open({
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
  --page-gutter: clamp(22rpx, 5vw, 34rpx);
  --primary: var(--tp-color-primary, #1677ff);
  --surface: #ffffff;
  --card-radius: 12rpx;
  min-height: 100vh;
  // 系统导航栏已处理顶部安全区，内容区只保留紧凑间距。
  padding: 12rpx var(--page-gutter) calc(52px + env(safe-area-inset-bottom) + 32rpx);
  box-sizing: border-box;
  background: #f2f2f7;
  color: #1d1d1f;
  font-family: inherit;
  /* 与首页告警图标的橙红色一致，等级使用实色，避免暗红和棕色。 */
  --alarm-high: var(--tp-color-danger, #ff4d35);
  --alarm-medium: var(--tp-color-warning, #ff9500);
  --alarm-low: var(--tp-color-primary, #1677ff);
}

.page button { display:flex; align-items:center; justify-content:center; margin:0; padding:0; border:0; border-radius:0; background:transparent; color:inherit; font:inherit; line-height:normal; }
.page button::after { border:0; }
.page button:focus-visible { outline:2rpx solid var(--primary); outline-offset:4rpx; }

.filter-panel {
  margin-bottom:8rpx;
  padding:0;
  overflow:hidden;
  border-radius:var(--card-radius);
  background:transparent;
}

.filter-row { display:flex; align-items:center; gap:14rpx; margin-bottom:4rpx; }

.search-field {
  display:flex;
  align-items:center;
  flex:1;
  min-width:0;
  height:72rpx;
  padding:0 6rpx 0 18rpx;
  box-sizing:border-box;
  border-radius:14rpx;
  background:var(--surface);
}

.search-icon { width:24rpx; height:24rpx; flex-shrink:0; opacity:.6; }

.alarm-rule-search-input {
  flex:1;
  min-width:0;
  height:70rpx;
  padding:0 12rpx;
  box-sizing:border-box;
  border:0;
  border-radius:0;
  background:transparent;
  color:#1d1d1f;
  font-size:22rpx;
}

.page .search-clear {
  display:flex;
  align-items:center;
  justify-content:center;
  width:48rpx;
  height:48rpx;
  color:#8b95a5;
  font-size:32rpx;
}

.page .search-button {
  flex-shrink:0;
  height:72rpx;
  padding:0 24rpx;
  border-radius:14rpx;
  color:var(--primary);
  background:var(--surface);
  font-size:22rpx;
  font-weight:600;
}

.compact-filters { display:flex; align-items:center; flex-wrap:wrap; column-gap:32rpx; }
.filter-trigger { display:flex; align-items:center; gap:12rpx; min-height:64rpx; color:#51515c; font-size:22rpx; line-height:32rpx; }
.filter-trigger.active { color:var(--primary); }
.filter-chevron { width:10rpx; height:10rpx; margin-top:-6rpx; border-right:2rpx solid currentColor; border-bottom:2rpx solid currentColor; transform:rotate(45deg); }

.rule-list { display:grid; gap:16rpx; }

.rule-card {
  position:relative;
  overflow:hidden;
  border-radius:var(--card-radius);
  background:var(--surface);
}

.page .rule-main {
  display:block;
  width:100%;
  box-sizing:border-box;
  text-align:left;
  min-width:0;
  padding:24rpx;
}

.rule-heading {
  display:flex;
  align-items:center;
  gap:14rpx;
  min-height:38rpx;
}

.rule-name {
  flex:1;
  display:block;
  min-width:0;
  overflow:hidden;
  color:#1d1d1f;
  font-size:27rpx;
  font-weight:600;
  line-height:38rpx;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.level-label {
  flex-shrink:0;
  display:flex;
  align-items:center;
  justify-content:center;
  min-width:36rpx;
  height:36rpx;
  padding:0 8rpx;
  box-sizing:border-box;
  border-radius:8rpx;
  font-size:19rpx;
  line-height:28rpx;
}

.level-label.high { color:#fff; background:var(--alarm-high); }
.level-label.medium { color:#fff; background:var(--alarm-medium); }
.level-label.low { color:#fff; background:var(--alarm-low); }

.rule-description {
  display:block;
  margin-top:8rpx;
  overflow:hidden;
  color:#73737d;
  font-size:22rpx;
  line-height:30rpx;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.rule-meta {
  display:flex;
  align-items:center;
  gap:12rpx;
  margin-top:12rpx;
  min-width:0;
  color:#73737d;
  font-size:22rpx;
  line-height:30rpx;
}

.meta-value { flex:1; min-width:0; overflow:hidden; color:#475467; text-overflow:ellipsis; white-space:nowrap; }

.rule-actions {
  display:flex;
  align-items:center;
  gap:24rpx;
  min-height:72rpx;
  margin:0 24rpx;
  border-top:1rpx solid #eeeef2;
}

.rule-status { margin-left:auto; color:#73737d; font-size:22rpx; line-height:30rpx; white-space:nowrap; }
.rule-switch { flex-shrink:0; }
/* H5 原生开关默认是 52×32px；直接调整轨道和滑块，避免缩放后仍占用原始宽度。 */
/* #ifdef H5 */
.rule-switch { display:flex; align-items:center; justify-content:flex-end; min-width:44px; min-height:44px; margin-left:-12rpx; }
.rule-switch :deep(.uni-switch-input) { width:36px; height:20px; margin:0; border-radius:10px; }
.rule-switch :deep(.uni-switch-input::before) { width:34px; height:18px; border-radius:9px; }
.rule-switch :deep(.uni-switch-input::after) { width:18px; height:18px; border-radius:9px; box-shadow:0 1px 2px rgba(0,0,0,.15); }
.rule-switch :deep(.uni-switch-input.uni-switch-input-checked::after) { transform:translateX(16px); }
/* #endif */

.page .text-action {
  min-width:44rpx;
  min-height:44px;
  color:var(--primary);
  font-size:22rpx;
}

.page .text-action.danger { color:var(--tp-color-danger, #ff4d35); }

.state-block {
  min-height:520rpx;
  padding:60rpx 40rpx;
  box-sizing:border-box;
  text-align:center;
  color:#73737d;
}

.empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; }
.empty-mark { display:flex; align-items:center; justify-content:center; width:112rpx; height:112rpx; margin-bottom:26rpx; border-radius:50%; background:#eaf2ff; }
.empty-mark image { width:54rpx; height:54rpx; }
.empty-title, .empty-description { display:block; }

.empty-title {
  margin-bottom:10rpx;
  color:#475467;
  font-size:28rpx;
  font-weight:600;
  line-height:40rpx;
}

.empty-description {
  max-width:520rpx;
  margin-bottom:28rpx;
  color:#98a2b3;
  font-size:21rpx;
  line-height:32rpx;
}

.page .empty-action {
  height:64rpx;
  padding:0 24rpx;
  border-radius:14rpx;
  background:var(--primary);
  color:#fff;
  font-size:22rpx;
}

.load-more {
  padding:30rpx 0;
  color:var(--primary);
  font-size:22rpx;
  text-align:center;
}

.skeleton-card { min-height:204rpx; padding:26rpx; box-sizing:border-box; }
.skeleton-line { border-radius:7rpx; background:linear-gradient(100deg,#eef1f5 20%,#f8f9fb 38%,#eef1f5 56%); background-size:220% 100%; animation:skeleton-shimmer 1.35s ease-in-out infinite; }
.skeleton-title { width:48%; height:26rpx; }
.skeleton-copy { width:76%; height:20rpx; margin-top:22rpx; }
.skeleton-meta { width:58%; height:18rpx; margin-top:28rpx; }

@keyframes skeleton-shimmer { 0% { background-position:100% 0; } 100% { background-position:-100% 0; } }
@media (prefers-reduced-motion: reduce) { .skeleton-line { animation:none; } }
</style>
