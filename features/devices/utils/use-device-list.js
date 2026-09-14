import { onBeforeUnmount, ref } from 'vue'

export function useDeviceList(fetchPage) {
  const items = ref([])
  const loading = ref(false)
  const error = ref('')
  const total = ref(0)
  let page = 0
  let version = 0
  let disposed = false
  onBeforeUnmount(() => { disposed = true; version += 1 })
  async function load(reset = false) {
    if (disposed) return
    if (loading.value && !reset) return
    const current = ++version
    const nextPage = reset ? 1 : page + 1
    if (reset) { items.value = []; total.value = 0; page = 0 }
    loading.value = true
    error.value = ''
    try {
      const data = await fetchPage(nextPage)
      if (current !== version) return
      if (!data || !Array.isArray(data.list)) throw new Error('服务返回的列表格式异常')
      items.value = reset ? data.list : items.value.concat(data.list)
      total.value = Number(data.total || 0)
      page = nextPage
    } catch (cause) {
      if (current === version) error.value = cause.message || '加载失败，请重试'
    } finally {
      if (current === version) loading.value = false
    }
  }
  return { items, loading, error, total, load }
}
