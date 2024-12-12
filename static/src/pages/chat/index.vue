<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="header">
			<view class="back-btn" @tap="handleBack">
				<text class="back-icon">←</text>
			</view>
			<text class="header-title">Chat Hub</text>
		</view>

		<!-- 聊天内容区域 -->
		<scroll-view
			class="chat-content"
			scroll-y="true"
			:scroll-top="scrollTop"
			:scroll-with-animation="true"
			@scrolltoupper="loadMoreMessages"
		>
			<view class="message-list">
				<view
					v-for="(message, index) in messages"
					:key="index"
					:class="['message-item', message.type === 'user' ? 'user' : 'assistant']"
				>
					<view class="avatar">
						<default-avatar v-if="message.type === 'assistant'"></default-avatar>
						<view class="user-avatar" v-else>You</view>
					</view>
					<view class="message-content">
						<text>{{ message.content }}</text>
						<view class="audio-controls" v-if="message.type === 'assistant' && message.audioUrl">
							<view class="play-btn" @tap="playAudio(message.audioUrl)">
								<text class="iconfont icon-play"></text>
							</view>
						</view>
						<view class="share-btn" v-if="message.type === 'assistant'" @tap="handleShare(message)">
							<text class="share-icon">↗</text>
						</view>
					</view>
				</view>
				<view class="stop-generating" v-if="isGenerating" @tap="handleStop">
					<text>Stop generating...</text>
				</view>
			</view>
		</scroll-view>

		<!-- 输入区域 -->
		<view class="input-area">
			<view class="voice-btn" @tap="toggleRecording" :class="{ 'recording': isRecording }">
				<view class="voice-icon">
					<svg class="mic-svg" viewBox="0 0 24 24" width="24" height="24">
						<path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
						<path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
					</svg>
				</view>
				<view class="recording-waves" v-if="isRecording">
					<view class="wave"></view>
					<view class="wave"></view>
					<view class="wave"></view>
				</view>
			</view>
			<input
				class="message-input"
				type="text"
				v-model="inputMessage"
				placeholder="输入消息..."
				:disabled="isRecording"
			/>
			<button
				class="send-btn"
				:class="{ disabled: !inputMessage }"
				@tap="handleSend"
			>
				发送
			</button>
		</view>

		<!-- 录音提示 -->
		<view class="recording-tip" v-if="isRecording">
			<view class="recording-status">
				<view class="recording-dot"></view>
				<text class="recording-time">{{ recordingTime }}s</text>
			</view>
			<text class="recording-text">正在录音...</text>
			<text class="recording-cancel" @tap="cancelRecording">取消</text>
		</view>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';
import DefaultAvatar from '@/components/DefaultAvatar.vue';
import { API_BASE_URL } from '@/config';

interface ChatMessage {
	type: 'user' | 'assistant';
	content: string;
	audioUrl?: string;
}

interface AIResponse {
	choices: Array<{
		message: {
			content: string;
			role: string;
		};
		finish_reason: string;
		index: number;
	}>;
}

interface AgentData {
	prompt: string;
	dimensions: Array<{
		keyword: string;
		score: number;
	}>;
}

interface PageInstance {
	options?: {
		id?: string;
	};
	$page?: {
		options?: {
			id?: string;
		};
	};
}

// 录音相关工具函数
const initMediaRecorder = async () => {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		const mediaRecorder = new MediaRecorder(stream);
		return mediaRecorder;
	} catch (error) {
		console.error('获取麦克风失败:', error);
		throw error;
	}
};

// 定义 RecorderManager 类型
type RecorderManager = UniApp.RecorderManager;

export default Vue.extend({
	components: {
		DefaultAvatar
	},
	data() {
		return {
			messages: [] as ChatMessage[],
			inputMessage: '',
			scrollTop: 0,
			isGenerating: false,
			isRecording: false,
			mediaRecorder: null as MediaRecorder | null,
			audioChunks: [] as Blob[],
			recordStartTime: 0,
			hasRecordPermission: false,
			recorderManager: null as RecorderManager | null,
			recordingTime: 0,
			recordingTimer: null as number | null,
			chatId: '',
			agentData: null as AgentData | null,
			speechSynthesis: window.speechSynthesis,
		}
	},
	async onLoad(options: any) {
		try {
			// 解码并解析参数
			const prompt = decodeURIComponent(options.prompt || '');
			const dimensions = JSON.parse(decodeURIComponent(options.dimensions || '[]'));
			
			console.log('Received data:', { prompt, dimensions }); // 调试日志
			
			// 保存数据
			this.agentData = {
				prompt,
				dimensions
			};
			
			if (!prompt) {
				throw new Error('未找到提示词');
			}
			
			// 初始化 chatId
			this.chatId = Math.random().toString(36).substring(7);
			
		} catch (error) {
			console.error('初始化失败:', error);
			uni.showToast({
				title: error instanceof Error ? error.message : '初始化失败',
				icon: 'none'
			});
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);
		}
	},
	async mounted() {
		// Web 端初始化录音
		if (process.env.VUE_APP_PLATFORM === 'h5') {
			try {
				this.mediaRecorder = await initMediaRecorder();
				
				// 添加录音事件监听
				this.mediaRecorder.ondataavailable = (event) => {
					if (event.data.size > 0) {
						this.audioChunks.push(event.data);
					}
				};
				
				this.mediaRecorder.onstop = async () => {
					const duration = Date.now() - this.recordStartTime;
					if (duration < 1000) {
						uni.showToast({
							title: '录音时间太短',
							icon: 'none'
						});
						this.audioChunks = [];
						return;
					}
					
					const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
					await this.uploadAudioBlob(audioBlob);
					this.audioChunks = [];
				};
				
				this.hasRecordPermission = true;
			} catch (error) {
				console.error('初始化录音失败:', error);
				this.hasRecordPermission = false;
			}
		} else {
			// 初始化录音管理器 (非 Web 端)
			this.recorderManager = uni.getRecorderManager();
			
			// 添加录音事件监听
			if (this.recorderManager) {
				this.recorderManager.onStop((res) => {
					this.uploadAudio(res.tempFilePath);
				});
				
				this.recorderManager.onError((res) => {
					console.error('录音失败:', res);
					uni.showToast({
						title: '录音失败',
						icon: 'none'
					});
					this.isRecording = false;
				});
			}
		}
	},
	methods: {
		handleBack() {
			uni.navigateBack();
		},
		async handleSend() {
			if ((!this.inputMessage && !this.isRecording) || !this.agentData) return;

			// 添加用户消息
			this.messages.push({
				type: 'user',
				content: this.inputMessage
			});

			// 清空输入
			const userMessage = this.inputMessage;
			this.inputMessage = '';

			// 滚动到底部
			this.scrollToBottom();

			// 发送到 FastGPT
			this.isGenerating = true;
			await this.sendToFastGPT(userMessage);
			this.isGenerating = false;
			this.scrollToBottom();
		},
		async sendToFastGPT(content: string, isSystemPrompt = false) {
			try {
				// 先添加一个空的 AI 回复消息
				const messageIndex = this.messages.length;
				this.messages.push({
					type: 'assistant',
					content: ''
				});

				uni.request({
					url: 'https://api.fastgpt.in/api/v1/chat/completions',
					method: 'POST',
					header: {
						'Authorization': 'Bearer fastgpt-ufjwtYs5kN2WdIiEqM7io4byhAe2HoB9wOuOEAF5hnNcxqH5ZYxITqEjum4K5FD',
						'Content-Type': 'application/json'
					},
					data: {
						chatId: this.chatId,
						stream: true,
						detail: false,
						responseChatItemId: 'my_responseChatItemId',
						variables: {
							prompt: this.agentData?.prompt || ''
						},
						messages: [
							...(isSystemPrompt ? [{
								role: 'system',
								content: `你是一个销售培训助手。请根据以下提示词进行对话：${this.agentData?.prompt || ''}`
							}] : []),
							{
								role: 'user',
								content
							}
						]
					},
					enableChunked: true,
					enableStream: true,
					responseType: 'text',
					success: async (res) => {
						let fullContent = '';
						const reader = res.data as any;
						
						reader.split('\n').forEach((line: string) => {
							if (line.startsWith('data: ')) {
								try {
									if (line.includes('[DONE]')) {
										return;
									}
									const data = JSON.parse(line.slice(6));
									if (data.choices && data.choices[0]?.delta?.content) {
										const content = data.choices[0].delta.content;
										fullContent += content;
										// 更新消息内容
										this.messages[messageIndex].content = fullContent;
									}
								} catch (e) {
									if (!line.includes('[DONE]')) {
										console.error('Parse chunk error:', e, line);
									}
								}
							}
						});

						// 生成完成后，播放语音
						if (fullContent) {
							try {
								await this.generateSpeech(fullContent);
							} catch (error) {
								console.error('生成语音失败:', error);
							}
						}
					},
					fail: (err) => {
						console.error('FastGPT 请求失败:', err);
						uni.showToast({
							title: '对话失败，请重试',
							icon: 'none'
						});
					}
				});
			} catch (error) {
				console.error('FastGPT 请求失败:', error);
				uni.showToast({
					title: '对话失败，请重试',
						icon: 'none'
				});
			}
		},
		handleStop() {
			this.isGenerating = false;
		},
		handleShare(message: any) {
			uni.showToast({
				title: '已复制到剪贴板',
				icon: 'none'
			});
		},
		loadMoreMessages() {
			console.log('加载更多消息');
		},
		scrollToBottom() {
			setTimeout(() => {
				const query = uni.createSelectorQuery().in(this);
				query.select('.message-list').boundingClientRect(data => {
					// this.scrollTop = data.height;
				}).exec();
			}, 100);
		},
		async checkRecordPermission() {
			if (process.env.VUE_APP_PLATFORM === 'h5') {
				try {
					await navigator.mediaDevices.getUserMedia({ audio: true });
					this.hasRecordPermission = true;
				} catch (error) {
					console.error('获取麦克风权限失败:', error);
					this.hasRecordPermission = false;
					uni.showToast({
						title: '请允许使用麦克风',
						icon: 'none'
					});
				}
			}
		},
		async toggleRecording() {
			// 检查权限
			if (!this.hasRecordPermission) {
				await this.checkRecordPermission();
				if (!this.hasRecordPermission) return;
			}

			if (this.isRecording) {
				// 停止录音
				if (process.env.VUE_APP_PLATFORM === 'h5') {
					if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
						this.mediaRecorder.stop();
					}
				} else {
					if (this.recorderManager) {
						this.recorderManager.stop();
					}
				}
				if (this.recordingTimer) {
					clearInterval(this.recordingTimer);
					this.recordingTimer = null;
				}
			} else {
				// 开始录音
				this.audioChunks = [];
				if (process.env.VUE_APP_PLATFORM === 'h5') {
					if (this.mediaRecorder) {
						this.mediaRecorder.start();
						this.recordStartTime = Date.now();
					}
				} else {
					if (this.recorderManager) {
						this.recorderManager.start({
							duration: 60000,
							sampleRate: 16000,
							numberOfChannels: 1,
							encodeBitRate: 48000,
							format: 'mp3'
						});
					}
				}
				this.recordingTime = 0;
				this.recordingTimer = setInterval(() => {
					this.recordingTime++;
					// 60秒后自动停止
					if (this.recordingTime >= 60) {
						this.toggleRecording();
					}
				}, 1000);
			}
			
			this.isRecording = !this.isRecording;
		},
		cancelRecording() {
			if (process.env.VUE_APP_PLATFORM === 'h5') {
				if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
					this.mediaRecorder.stop();
					this.audioChunks = [];
				}
			} else {
				if (this.recorderManager) {
					this.recorderManager.stop();
				}
			}
			
			this.isRecording = false;
			uni.showToast({
				title: '已取消录音',
				icon: 'none'
			});
			if (this.recordingTimer) {
				clearInterval(this.recordingTimer);
				this.recordingTimer = null;
			}
			this.recordingTime = 0;
		},
		async uploadAudioBlob(audioBlob: Blob) {
			try {
				uni.showLoading({ title: '识别中...' });
				
				// 创建 FormData
				const formData = new FormData();
				formData.append('file', audioBlob, 'audio.mp3');
				formData.append('model', 'whisper-1');
				
				// 发送请求
				const response = await fetch('http://api.sealos.vip/v1/audio/transcriptions', {
					method: 'POST',
					headers: {
						'Authorization': 'Bearer sk-wNzf1gHWXMWK9BFD85307f6587D14b0fA838Ca17A4858561'
					},
					body: formData
				});
				
				if (response.ok) {
					const data = await response.json();
					this.inputMessage = data.text || '';
					this.handleSend();
				} else {
					throw new Error('语音识别失败');
				}
			} catch (error) {
				console.error('语音识别失败:', error);
				uni.showToast({
					title: '语音识别失败',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		},
		async requestRecordPermission() {
			try {
				await uni.authorize({
					scope: 'scope.record'
				});
				this.hasRecordPermission = true;
				return true;
			} catch (error) {
				uni.showModal({
					title: '需要录音权限',
					content: '请在设置中开启录音权限',
					success: (res) => {
						if (res.confirm) {
							uni.openSetting();
						}
					}
				});
				return false;
			}
		},
		async uploadAudio(tempFilePath: string) {
			try {
				uni.showLoading({ title: '识别中...' });
				
				const uploadResult = await uni.uploadFile({
					url: 'http://api.sealos.vip/v1/audio/transcriptions',
					filePath: tempFilePath,
					name: 'file',
					header: {
						'Authorization': 'Bearer sk-wNzf1gHWXMWK9BFD85307f6587D14b0fA838Ca17A4858561'
					},
					formData: {
						model: 'whisper-1'
					}
				});
				
				if (uploadResult.statusCode === 200) {
					const data = JSON.parse(uploadResult.data);
					this.inputMessage = data.text || '';
					this.handleSend();
				} else {
					throw new Error('语音识别失败');
				}
			} catch (error) {
				console.error('语音上传失败:', error);
				uni.showToast({
					title: '语音识别失败',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		},
		async retryWithDelay(fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> {
			try {
				return await fn();
			} catch (error) {
				if (retries > 0) {
					await new Promise(resolve => setTimeout(resolve, delay));
					return this.retryWithDelay(fn, retries - 1, delay);
				}
				throw error;
			}
		},
		async generateSpeech(text: string): Promise<void> {
			try {
				const response = await uni.request({
					url: 'http://api.sealos.vip/v1/audio/speech',
					method: 'POST',
					header: {
						'Authorization': 'Bearer sk-wNzf1gHWXMWK9BFD85307f6587D14b0fA838Ca17A4858561',
						'Content-Type': 'application/json'
					},
					data: {
						model: "tts-1",
						voice: "nova",
						input: text
					},
					responseType: 'arraybuffer'
				});
				
				if (response.statusCode === 200 && response.data) {
					// 创建音频上下文
					const audioContext = uni.createInnerAudioContext();
					
					// 将二进制数据转换为 Base64
					const base64 = uni.arrayBufferToBase64(response.data as ArrayBuffer);
					const audioUrl = `data:audio/mp3;base64,${base64}`;
					
					// 设置音频源并播放
					audioContext.src = audioUrl;
					audioContext.autoplay = true;
					
					// 监听播放完成
					audioContext.onEnded(() => {
						audioContext.destroy();
					});
					
					// 监听错误
					audioContext.onError((err) => {
						console.error('播放音频失败:', err);
						audioContext.destroy();
					});
				} else {
					throw new Error('语音生成失败');
				}
			} catch (error) {
				console.error('语音生成失败:', error);
				throw error;
			}
		}
	}
});
</script>

<style>
@font-face {
	font-family: 'iconfont';
	src: url('//at.alicdn.com/t/font_3159629_1234567890.ttf') format('truetype');
}

.iconfont {
	font-family: "iconfont" !important;
	font-size: 40rpx;
	font-style: normal;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.icon-mic:before {
	content: "\e7c8";
}

.icon-stop:before {
	content: "\e7c9";
}

.container {
	min-height: 100vh;
	background-color: #fff;
	display: flex;
	flex-direction: column;
}

.header {
	display: flex;
	align-items: center;
	padding: 40rpx 32rpx;
	background: #fff;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
}

.back-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
}

.back-icon {
	font-size: 40rpx;
	color: #333;
}

.header-title {
	flex: 1;
	text-align: center;
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	margin-right: 60rpx;
}

.chat-content {
	flex: 1;
	padding: 140rpx 32rpx 180rpx;
}

.message-list {
	display: flex;
	flex-direction: column;
	gap: 40rpx;
}

.message-item {
	display: flex;
	gap: 20rpx;
	max-width: 80%;
}

.message-item.assistant {
	align-self: flex-start;
}

.message-item.user {
	align-self: flex-end;
	flex-direction: row-reverse;
}

.avatar {
	width: 80rpx;
	height: 80rpx;
	flex-shrink: 0;
}

.user-avatar {
	width: 100%;
	height: 100%;
	background: #333;
	border-radius: 50%;
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
}

.message-content {
	background: #F8F8F8;
	padding: 24rpx;
	border-radius: 24rpx;
	font-size: 28rpx;
	color: #333;
	position: relative;
}

.user .message-content {
	background: #333;
	color: #fff;
}

.share-btn {
	position: absolute;
	right: -60rpx;
	top: 50%;
	transform: translateY(-50%);
	width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.share-icon {
	font-size: 32rpx;
	color: #999;
}

.stop-generating {
	align-self: center;
	padding: 16rpx 32rpx;
	background: #F8F8F8;
	border-radius: 30rpx;
	font-size: 24rpx;
	color: #666;
}

.input-area {
	display: flex;
	align-items: center;
	padding: 20rpx;
	background: #fff;
	border-top: 1px solid #eee;
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
}

.voice-btn {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f5f5f5;
	border-radius: 50%;
	transition: all 0.3s ease;
	margin-right: 20rpx;
}

.voice-btn.recording {
	background: #ff6b00;
}

.voice-icon {
	position: relative;
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.mic-svg {
	width: 32rpx;
	height: 32rpx;
	fill: #666;
	transition: fill 0.3s ease;
}

.voice-btn.recording .mic-svg {
	fill: #fff;
}

.recording-waves {
	position: absolute;
	width: 100%;
	height: 100%;
}

.wave {
	position: absolute;
	width: 100%;
	height: 100%;
	border: 2rpx solid #fff;
	border-radius: 50%;
	animation: wave-animation 1.5s infinite;
	opacity: 0;
}

.wave:nth-child(2) {
	animation-delay: 0.5s;
}

.wave:nth-child(3) {
	animation-delay: 1s;
}

@keyframes wave-animation {
	0% {
		transform: scale(1);
		opacity: 0.8;
	}
	100% {
		transform: scale(2);
		opacity: 0;
	}
}

.recording-tip {
	position: fixed;
	bottom: 200rpx;
	left: 50%;
	transform: translateX(-50%);
	background: rgba(0, 0, 0, 0.7);
	padding: 20rpx 40rpx;
	border-radius: 16rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
}

.recording-status {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.recording-dot {
	width: 16rpx;
	height: 16rpx;
	background: #ff6b00;
	border-radius: 50%;
	animation: pulse 1s infinite;
}

.recording-time {
	font-size: 28rpx;
	color: #fff;
}

.recording-text {
	font-size: 28rpx;
	color: #fff;
}

.recording-cancel {
	font-size: 28rpx;
	color: #ff6b00;
	padding: 8rpx 20rpx;
	border-radius: 8rpx;
}

.recording-cancel:active {
	opacity: 0.8;
	background: rgba(255, 107, 0, 0.1);
}

@keyframes pulse {
	0% {
		transform: scale(0.8);
		opacity: 0.5;
	}
	50% {
		transform: scale(1.2);
		opacity: 1;
	}
	100% {
		transform: scale(0.8);
		opacity: 0.5;
	}
}

.message-input {
	flex: 1;
	height: 80rpx;
	background: #f8f8f8;
	border-radius: 40rpx;
	padding: 0 32rpx;
	font-size: 28rpx;
}

.send-btn {
	width: 120rpx;
	height: 64rpx;
	background: #333;
	color: #fff;
	border-radius: 32rpx;
	font-size: 28rpx;
	margin-left: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.send-btn.disabled {
	opacity: 0.5;
}

.audio-controls {
	margin-top: 12rpx;
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.play-btn {
	width: 48rpx;
	height: 48rpx;
	background: rgba(0, 0, 0, 0.1);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.icon-play:before {
	content: "\e7cb";
}
</style>