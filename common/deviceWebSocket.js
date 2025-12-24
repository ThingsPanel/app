/**
 * 设备在线状态 WebSocket 管理类
 * 负责管理设备状态的WebSocket连接、订阅和消息处理
 */
class DeviceWebSocketManager {
	constructor() {
		this.webSocketTask = null;
		this.onMessageCallback = null;
		this.onErrorCallback = null;
		this.onCloseCallback = null;
		this.reconnectTimer = null;
	}

	/**
	 * 初始化WebSocket连接
	 * @param {Object} options - 配置选项
	 * @param {Function} options.onMessage - 消息接收回调函数
	 * @param {Function} options.onError - 错误回调函数
	 * @param {Function} options.onClose - 连接关闭回调函数
	 */
	init(options = {}) {
		// 先关闭已存在的连接
		this.close();

		const token = uni.getStorageSync('access_token');
		if (!token) {
			console.error('[DeviceWebSocket] Token not found');
			return false;
		}

		const serverUrl = uni.getStorageSync('serverAddress') || '';
		const wsUrl = serverUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/device/online/status/ws/batch';

		// 保存回调函数
		this.onMessageCallback = options.onMessage;
		this.onErrorCallback = options.onError;
		this.onCloseCallback = options.onClose;

		this.webSocketTask = uni.connectSocket({
			url: wsUrl,
			success: () => {
				console.log('[DeviceWebSocket] Connecting...');
			},
			fail: (err) => {
				console.error('[DeviceWebSocket] Connection failed:', err);
				this.onErrorCallback && this.onErrorCallback(err);
			}
		});

		// 监听WebSocket连接打开
		this.webSocketTask.onOpen(() => {
			console.log('[DeviceWebSocket] Connected');
		});

		// 监听WebSocket消息
		this.webSocketTask.onMessage((res) => {
			try {
				const data = JSON.parse(res.data);
				this.handleMessage(data);
			} catch (error) {
				console.error('[DeviceWebSocket] Failed to parse message:', error);
			}
		});

		// 监听WebSocket错误
		this.webSocketTask.onError((err) => {
			console.error('[DeviceWebSocket] Error:', err);
			this.onErrorCallback && this.onErrorCallback(err);
		});

		// 监听WebSocket关闭
		this.webSocketTask.onClose(() => {
			console.log('[DeviceWebSocket] Closed');
			this.webSocketTask = null;
			this.onCloseCallback && this.onCloseCallback();
		});

		return true;
	}

	/**
	 * 订阅设备状态
	 * @param {Array} deviceIds - 设备ID数组
	 */
	subscribe(deviceIds) {
		if (!this.webSocketTask || !deviceIds || deviceIds.length === 0) {
			console.warn('[DeviceWebSocket] Cannot subscribe: connection not ready or empty device list');
			return false;
		}

		const token = uni.getStorageSync('access_token');
		const message = {
			device_ids: deviceIds,
			token: token
		};

		this.webSocketTask.send({
			data: JSON.stringify(message),
			success: () => {
				console.log('[DeviceWebSocket] Subscribed to', deviceIds.length, 'devices');
			},
			fail: (err) => {
				console.error('[DeviceWebSocket] Failed to subscribe:', err);
			}
		});

		return true;
	}

	/**
	 * 处理WebSocket消息
	 * @param {Object|Array} data - 接收到的消息数据
	 */
	handleMessage(data) {
		if (!this.onMessageCallback) {
			return;
		}

		// 处理批量消息（数组格式）
		if (Array.isArray(data)) {
			data.forEach(item => {
				this.onMessageCallback(item);
			});
		} else {
			// 处理单个消息（对象格式）
			this.onMessageCallback(data);
		}
	}

	/**
	 * 重新连接并订阅
	 * @param {Array} deviceIds - 要订阅的设备ID数组
	 * @param {Object} options - 初始化选项
	 */
	reconnectAndSubscribe(deviceIds, options = {}) {
		// 清除之前的定时器
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
		}

		// 关闭现有连接
		this.close();

		// 延迟一下再重新连接，确保连接完全关闭
		setTimeout(() => {
			const connected = this.init(options);

			if (connected) {
				// 等待连接建立后订阅
				this.reconnectTimer = setTimeout(() => {
					if (deviceIds && deviceIds.length > 0) {
						this.subscribe(deviceIds);
					}
				}, 500);
			}
		}, 100);
	}

	/**
	 * 关闭WebSocket连接
	 */
	close() {
		// 清除定时器
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}

		if (this.webSocketTask) {
			this.webSocketTask.close({
				success: () => {
					console.log('[DeviceWebSocket] Closed successfully');
				}
			});
			this.webSocketTask = null;
		}
	}

	/**
	 * 检查连接状态
	 * @returns {Boolean} - 是否已连接
	 */
	isConnected() {
		return this.webSocketTask !== null;
	}
}

// 导出单例
export default new DeviceWebSocketManager();
