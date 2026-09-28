#!/usr/bin/env node
/**
 * ThingsPanel 设备模拟器 —— 持续上报「温度 / 湿度」遥测数据
 *
 * 协议依据：ThingsPanel 直连设备 MQTT 数据交互规范
 *   上报主题 : devices/telemetry
 *   实时格式 : {"temperature": 25.5, "humidity": 65.0}   (扁平键值对，设备身份由 MQTT 认证识别)
 *   历史上报 : [{"ts": 1754928146491, "values": {...}}, ...]
 *
 * 本脚本零第三方依赖，内置最小 MQTT 3.1.1 客户端（net / tls），
 * 直接 node 运行即可，无需 npm install。
 *
 * 用法：
 *   node scripts/mock-device-telemetry.mjs                     # 默认每 5 秒上报一次，持续运行
 *   node scripts/mock-device-telemetry.mjs --interval 2        # 每 2 秒上报一次
 *   node scripts/mock-device-telemetry.mjs --count 10          # 只上报 10 条后退出
 *   node scripts/mock-device-telemetry.mjs --once              # 只上报 1 条（连通性自检）
 *   node scripts/mock-device-telemetry.mjs --history --count 5 # 历史上报模式（带 ts 的时间序列数组）
 *   node scripts/mock-device-telemetry.mjs --help              # 查看全部参数
 *
 * 所有参数均可用环境变量覆盖：MQTT_HOST / MQTT_PORT / MQTT_USERNAME / MQTT_PASSWORD / MQTT_CLIENT_ID
 */

import net from 'node:net';
import tls from 'node:tls';
import process from 'node:process';

// ────────────────────────────────────────────────────────────
// 默认配置（来自 ThingsPanel 设备接入页的凭证与连接信息）
// ────────────────────────────────────────────────────────────
const DEFAULTS = {
  host: '47.115.210.16',
  port: 1883,
  username: 'd0bb6295-5999-a182-743',
  password: '5dce61a',
  clientId: 'mqtt_e1984989-2c6',
  topic: 'devices/telemetry',
  interval: 5,          // 上报间隔（秒）
  count: 0,             // 上报条数上限，0 = 不限
  once: false,          // 只上报一条
  history: false,       // 历史上报模式（数组 + ts）
  useTls: false,        // 是否使用 TLS（端口通常为 8883）
  uniqueClientId: false,// 在 ClientID 后追加随机后缀，便于同时开多个实例
  deviceId: '',         // 可选：在 payload 中额外携带 device_id
  keepAlive: 60,        // MQTT 心跳（秒）
  // 温度随机游走区间
  tempStart: 24.5, tempMin: 18, tempMax: 32, tempStep: 0.6,
  // 湿度随机游走区间
  humiStart: 58, humiMin: 30, humiMax: 85, humiStep: 2.5,
};

// ────────────────────────────────────────────────────────────
// 命令行参数解析
// ────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const opts = { ...DEFAULTS };
  const alias = {
    h: 'host', p: 'port', u: 'username', w: 'password', c: 'clientId',
    t: 'topic', i: 'interval', n: 'count', k: 'keepAlive', d: 'deviceId',
  };
  const numKeys = new Set(['port', 'interval', 'count', 'keepAlive']);
  const boolKeys = new Set(['once', 'history', 'tls', 'uniqueClientId', 'help']);

  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i];
    if (!raw.startsWith('-')) continue;
    let key = raw.replace(/^--?/, '');
    if (alias[key]) key = alias[key];
    if (key === 'help') { opts.help = true; continue; }
    if (boolKeys.has(key)) { opts[key] = true; continue; }
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('-')) {
      console.error(`参数 --${key} 缺少取值`);
      process.exit(2);
    }
    i++;
    opts[key] = numKeys.has(key) ? Number(next) : next;
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));

if (opts.help) {
  console.log(`
ThingsPanel 设备模拟器 —— 持续上报温度 / 湿度

  --host <ip>           MQTT 接入地址         (默认 ${DEFAULTS.host})
  --port <port>         MQTT 端口             (默认 ${DEFAULTS.port})
  --username <str>      MQTT Username         (默认 ${DEFAULTS.username})
  --password <str>      MQTT Password         (默认 ${DEFAULTS.password})
  --clientId <str>      MQTT ClientID         (默认 ${DEFAULTS.clientId})
  --topic <str>         上报主题              (默认 ${DEFAULTS.topic})
  --deviceId <str>      在 payload 中附加 device_id
  --interval <秒>       上报间隔              (默认 ${DEFAULTS.interval})
  --count <n>           上报 n 条后退出        (默认 0 = 持续运行)
  --once                只上报 1 条后退出
  --history             历史上报模式（[{"ts":..,"values":{..}}]）
  --tls                 使用 TLS 加密连接
  --uniqueClientId      ClientID 追加随机后缀，支持多实例同时运行
  --keepAlive <秒>      MQTT 心跳             (默认 ${DEFAULTS.keepAlive})

  环境变量 MQTT_HOST / MQTT_PORT / MQTT_USERNAME / MQTT_PASSWORD / MQTT_CLIENT_ID 可覆盖同名默认值。
  Ctrl+C 停止上报。
`);
  process.exit(0);
}

// 环境变量覆盖
for (const [envKey, optKey] of [
  ['MQTT_HOST', 'host'], ['MQTT_PORT', 'port'],
  ['MQTT_USERNAME', 'username'], ['MQTT_PASSWORD', 'password'],
  ['MQTT_CLIENT_ID', 'clientId'], ['MQTT_TOPIC', 'topic'],
]) {
  if (process.env[envKey]) opts[optKey] = envKey === 'MQTT_PORT' ? Number(process.env[envKey]) : process.env[envKey];
}

if (opts.uniqueClientId) opts.clientId = `${opts.clientId}_${Math.random().toString(16).slice(2, 8)}`;

// ────────────────────────────────────────────────────────────
// 最小 MQTT 3.1.1 报文编解码
// ────────────────────────────────────────────────────────────
const PACKET = { CONNACK: 2, PUBLISH: 3, PUBACK: 4, SUBACK: 9, PINGRESP: 13 };

/** MQTT 剩余长度变长编码 */
function encodeLength(n) {
  const out = [];
  do {
    let byte = n % 128;
    n = Math.floor(n / 128);
    if (n > 0) byte |= 0x80;
    out.push(byte);
  } while (n > 0);
  return Buffer.from(out);
}

/** UTF-8 字符串（2 字节长度前缀） */
function encodeString(str) {
  const body = Buffer.from(str, 'utf8');
  const head = Buffer.alloc(2);
  head.writeUInt16BE(body.length, 0);
  return Buffer.concat([head, body]);
}

/** 组装 CONNECT 报文 */
function buildConnect() {
  const flags = 0x02 | 0x80 | 0x40; // CleanSession + Username + Password
  const variable = Buffer.concat([
    encodeString('MQTT'),
    Buffer.from([0x04, flags, (opts.keepAlive >> 8) & 0xff, opts.keepAlive & 0xff]),
  ]);
  const payload = Buffer.concat([
    encodeString(opts.clientId),
    encodeString(opts.username),
    encodeString(opts.password),
  ]);
  const body = Buffer.concat([variable, payload]);
  return Buffer.concat([Buffer.from([0x10]), encodeLength(body.length), body]);
}

/** 组装 PUBLISH 报文（QoS 0） */
function buildPublish(topic, payload) {
  const body = Buffer.concat([encodeString(topic), Buffer.from(payload, 'utf8')]);
  return Buffer.concat([Buffer.from([0x30]), encodeLength(body.length), body]);
}

/** 从缓冲区尝试切出一个完整报文，数据不足返回 null */
function tryParsePacket(buf) {
  if (buf.length < 2) return null;
  let i = 1;
  let multiplier = 1;
  let length = 0;
  for (;;) {
    if (i >= buf.length) return null;      // 剩余长度字段还没收全
    const byte = buf[i++];
    length += (byte & 0x7f) * multiplier;
    if ((byte & 0x80) === 0) break;
    multiplier *= 128;
    if (multiplier > 128 ** 3) throw new Error('MQTT 报文格式异常：剩余长度超长');
  }
  if (buf.length < i + length) return null; // 报文体还没收全
  return { type: buf[0] >> 4, body: buf.subarray(i, i + length), total: i + length };
}

// ────────────────────────────────────────────────────────────
// 遥测数据生成：带惯性的随机游走，比纯随机更接近真实传感器
// ────────────────────────────────────────────────────────────
let temperature = opts.tempStart;
let humidity = opts.humiStart;

function walk(prev, min, max, step) {
  let value = prev + (Math.random() * 2 - 1) * step;
  if (value < min) value = min + Math.random() * step;
  if (value > max) value = max - Math.random() * step;
  return value;
}

function nextReading() {
  temperature = walk(temperature, opts.tempMin, opts.tempMax, opts.tempStep);
  humidity = walk(humidity, opts.humiMin, opts.humiMax, opts.humiStep);
  return {
    temperature: Number(temperature.toFixed(1)),
    humidity: Number(humidity.toFixed(1)),
  };
}

// ────────────────────────────────────────────────────────────
// 连接与上报主逻辑
// ────────────────────────────────────────────────────────────
const state = {
  socket: null,
  connected: false,
  buffer: Buffer.alloc(0),
  sent: 0,
  pingTimer: null,
  reportTimer: null,
  retry: 0,
  closing: false,
};

const stamp = () => new Date().toLocaleTimeString('zh-CN', { hour12: false });

function log(...args) {
  console.log(`[${stamp()}]`, ...args);
}

function connect() {
  const label = opts.useTls ? 'mqtts' : 'mqtt';
  log(`正在连接 ${label}://${opts.host}:${opts.port}  clientId=${opts.clientId}`);

  const socket = opts.useTls
    ? tls.connect({ host: opts.host, port: opts.port, rejectUnauthorized: false })
    : net.createConnection({ host: opts.host, port: opts.port });

  state.socket = socket;
  socket.setNoDelay(true);

  socket.on(opts.useTls ? 'secureConnect' : 'connect', () => {
    socket.write(buildConnect());
  });

  socket.on('data', (chunk) => {
    state.buffer = Buffer.concat([state.buffer, chunk]);
    for (;;) {
      const packet = tryParsePacket(state.buffer);
      if (!packet) break;
      state.buffer = state.buffer.subarray(packet.total);
      handlePacket(packet);
    }
  });

  socket.on('error', (err) => {
    if (state.closing) return; // 主动 DISCONNECT 后 broker 关闭连接产生的 ECONNRESET 属正常现象
    log(`连接错误：${err.code || ''} ${err.message}`);
  });

  socket.on('close', () => {
    const wasConnected = state.connected;
    state.connected = false;
    clearInterval(state.pingTimer);
    clearInterval(state.reportTimer);
    state.pingTimer = null;
    state.reportTimer = null;
    if (state.closing) return;
    state.retry++;
    const delay = Math.min(30, 2 ** Math.min(state.retry, 4)); // 指数退避，最长 30 秒
    log(`连接已断开${wasConnected ? '' : '（未建立）'}，${delay} 秒后重连…`);
    setTimeout(connect, delay * 1000);
  });
}

function handlePacket(packet) {
  if (packet.type === PACKET.CONNACK) {
    const code = packet.body[1];
    if (code !== 0) {
      const reasons = {
        1: '不支持的协议版本',
        2: 'ClientID 被拒绝',
        3: '服务不可用',
        4: 'Username / Password 错误',
        5: '未授权',
      };
      log(`认证失败：CONNACK code=${code}（${reasons[code] || '未知原因'}）`);
      log('请核对 ThingsPanel 设备接入页的 Username / Password / ClientID 是否完整、准确。');
      state.closing = true;
      state.socket.destroy();
      process.exit(1);
    }
    state.connected = true;
    state.retry = 0;
    log(`连接成功，开始上报到主题 ${opts.topic}（间隔 ${opts.interval}s）`);

    // 心跳保活
    state.pingTimer = setInterval(() => {
      if (state.connected) state.socket.write(Buffer.from([0xc0, 0x00]));
    }, Math.max(5, Math.floor(opts.keepAlive / 2)) * 1000);

    if (opts.once) {
      publishOnce();
      return;
    }
    publishOnce();                                        // 连上先立刻发一条
    state.reportTimer = setInterval(publishOnce, opts.interval * 1000);
    return;
  }

  if (packet.type === PACKET.PINGRESP) return;
  if (packet.type === PACKET.PUBACK || packet.type === PACKET.SUBACK) return;
}

function publishOnce() {
  if (!state.connected) return;

  const reading = nextReading();
  const payload = opts.history
    ? JSON.stringify([{ ts: Date.now(), values: reading }])
    : JSON.stringify(opts.deviceId ? { device_id: opts.deviceId, ...reading } : reading);

  state.socket.write(buildPublish(opts.topic, payload));
  state.sent++;

  const suffix = opts.count ? `  (${state.sent}/${opts.count})` : `  (第 ${state.sent} 条)`;
  log(`已上报 ${payload}${suffix}`);

  if (opts.once || (opts.count > 0 && state.sent >= opts.count)) {
    log(`上报完成，共 ${state.sent} 条，断开连接。`);
    shutdown(0);
  }
}

function shutdown(code) {
  state.closing = true;
  clearInterval(state.pingTimer);
  clearInterval(state.reportTimer);
  try {
    if (state.socket && !state.socket.destroyed) {
      state.socket.write(Buffer.from([0xe0, 0x00])); // DISCONNECT
      state.socket.end();
    }
  } catch { /* 忽略关闭阶段的异常 */ }
  setTimeout(() => process.exit(code), 150);
}

process.on('SIGINT', () => {
  log(`收到中断信号，已上报 ${state.sent} 条，正在断开…`);
  shutdown(0);
});

connect();
