// Serialize native visibility changes: a late hide callback must not hide another page's tabs.
const owners = new Map()
let hidden = false
let busy = false
let queued = false
function schedule() {
  if (queued) return
  queued = true
  Promise.resolve().then(() => { queued = false; reconcile() })
}
function reconcile() {
  if (busy) return
  const desired = owners.size > 0
  if (desired === hidden) { owners.forEach(notify => notify(hidden)); return }
  busy = true
  const success = () => { hidden = desired; owners.forEach(notify => notify(hidden)) }
  const fail = () => { owners.forEach(notify => notify(false)) }
  const complete = () => { busy = false; if ((owners.size > 0) !== desired) schedule() }
  try {
    const options = { animation: false, success, fail, complete }
    if (desired) uni.hideTabBar(options)
    else uni.showTabBar(options)
  } catch { fail(); complete() }
}
export function acquireBoardTabbar(notify) {
  const owner = Symbol('board-tabbar')
  owners.set(owner, notify)
  schedule()
  return () => { owners.delete(owner); schedule() }
}
