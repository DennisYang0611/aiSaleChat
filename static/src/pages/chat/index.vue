<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="header">
			<view class="back-btn" @tap="handleBack">
				<text class="back-icon">←</text>
			</view>
			<text class="header-title">对话</text>
			<view class="end-btn" @tap="handleEndChat">
				<text class="end-text">结束对话</text>
			</view>
		</view>

		<!-- 录音状态浮层 -->
		<view class="recording-overlay" v-if="isRecording">
			<view class="recording-panel">
				<view class="recording-waves">
					<view class="wave"></view>
					<view class="wave"></view>
					<view class="wave"></view>
				</view>
				<view class="recording-status">
					<view class="recording-dot"></view>
					<text class="recording-time">{{ recordingTime }}s</text>
				</view>
				<text class="recording-tip">正在录音...</text>
				<view class="recording-actions">
					<view class="action-btn cancel" @tap="cancelRecording">
						<text>取消</text>
					</view>
					<view class="action-btn confirm" @tap="stopRecording">
						<text>完成</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 聊天内容区域 -->
		<scroll-view class="chat-content" scroll-y="true" :scroll-top="scrollTop" :scroll-with-animation="true"
			@scrolltoupper="loadMoreMessages">
			<!-- 场景简介 -->
			<view class="scene-intro" v-if="agent">
				<view class="intro-title">场景简介</view>
				<view class="intro-content">{{ agent.description }}</view>
			</view>

			<!-- 消息列表 -->
			<view class="message-list">
				<view v-for="(message, index) in messages" :key="index"
					:class="['message-item', message.type === 'user' ? 'user' : 'assistant']">
					<view class="avatar">
						<default-avatar v-if="message.type === 'assistant'"></default-avatar>
						<view class="user-avatar" v-else>You</view>
					</view>
					<view class="message-content">
						<text>{{ message.content }}</text>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 输入区域 -->
		<view class="input-area">
			<view class="voice-btn" @tap="toggleRecording" :class="{ recording: isRecording }">
				<view class="voice-icon">
					<svg class="mic-svg" viewBox="0 0 24 24" width="24" height="24">
						<path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
						<path
							d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
					</svg>
				</view>
			</view>
			<view class="input-wrapper">
				<input class="message-input" v-model="inputMessage" :placeholder="isRecording ? '正在录音...' : '输入消息...'"
					@confirm="handleSend" :disabled="isRecording" />
			</view>
			<view class="send-btn" @tap="handleSend">
				<text class="send-text">发送</text>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';
import DefaultAvatar from '@/components/DefaultAvatar.vue';
import { API_BASE_URL } from '@/config';
import { request } from '@/utils/request';
import { Agent as AgentType, RatingDimension } from '@/types/agent';

interface ChatMessage {
	type: 'user' | 'assistant';
	content: string;
	audioUrl?: string;
}

interface TrainingRecord {
	id: string;
	agentId: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
}

interface TrainingRecordResponse {
	code: number;
	message: string;
	data: TrainingRecord;
}

interface TrainingRecordListResponse {
	code: number;
	message: string;
	data: {
		list: TrainingRecord[];
		total: number;
		page: number;
		pageSize: number;
	};
}

interface AIResponse {
	id: string;
	model: string;
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
	choices: Array<{
		message: {
			role: string;
			content: string;
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

interface ApiResponse {
	code: number;
	message: string;
	data: AgentType;
}

interface TranscriptionResponse {
	text: string;
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

type Timer = ReturnType<typeof setTimeout>;

export default Vue.extend({
	components: {
		DefaultAvatar
	},
	data() {
		return {
			agentId: '',
			agent: null as AgentType | null,
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
			recordingTimer: null as Timer | null,
			chatId: '',
			agentData: null as AgentData | null,
			speechSynthesis: window.speechSynthesis,
			showEndModal: false,
			logs: [] as any[],
			isTranscribing: false,
			tempAudioChunks: [] as Blob[],
			transcriptionTimer: null as any,
			isEnding: false,
			userId: '',
		}
	},
	async onLoad(options: any) {
		this.agentId = options.agentId;
		await this.getUserInfo();
		await this.loadAgentData();
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
						this.tempAudioChunks.push(event.data);
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
			uni.redirectTo({
				url: '/pages/index/index'
			});
		},
		async handleSend() {
			if (!this.agent || !this.inputMessage.trim()) {
				return;
			}

			try {
				// 添加用户消息
				this.messages.push({
					type: 'user',
					content: this.inputMessage
				});

				// 清空输入框
				const userMessage = this.inputMessage;
				this.inputMessage = '';

				// 自动滚动到底部
				this.scrollToBottom();

				this.isGenerating = true;

				const response = await uni.request({
					url: 'https://api.fastgpt.in/api/v1/chat/completions',
					method: 'POST',
					header: {
						'Authorization': 'Bearer fastgpt-bVysrxhwkvmwhD7pKE3kzM3IWi5iiyMyqCpIVFYB9xr1uqInGfJobiP1zZQpgh',
						'Content-Type': 'application/json'
					},
					data: {
						chatId: `chat_${Date.now()}`,
						stream: false,
						detail: false,
						variables: {
							prompt: this.agent.promptText,
							dimension: JSON.stringify(this.agent.ratingDimensions)
						},
						messages: [
							{
								role: 'user',
								content: userMessage
							}
						]
					}
				}) as unknown as { data: AIResponse };

				console.log('AI Response:', response.data); // 调试输出

				if (response.data?.choices?.[0]?.message?.content) {
					const aiMessage = response.data.choices[0].message.content;

					console.log('AI Message:', aiMessage); // 调试输出

					// 添加助手回复
					this.messages.push({
						type: 'assistant',
						content: aiMessage
					});

					// 生成语音
					try {
						await this.generateSpeech(aiMessage);
					} catch (error) {
						console.error('生成语音失败:', error);
					}

					// 自动滚动到底部
					this.scrollToBottom();
				} else {
					console.error('Invalid AI response:', response.data);
					throw new Error('AI 返回数据格式错误');
				}
			} catch (error) {
				console.error('发送消息失败:', error);
				uni.showToast({
					title: error instanceof Error ? error.message : '发送失败',
					icon: 'none'
				});
			} finally {
				this.isGenerating = false;
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
				this.stopRecording();
			} else {
				// 开始录音
				try {
					this.isRecording = true;
					this.recordStartTime = Date.now();
					this.audioChunks = [];
					this.tempAudioChunks = [];
					this.startRecordingTimer();
					this.startTranscriptionTimer();

					if (process.env.VUE_APP_PLATFORM === 'h5') {
						this.mediaRecorder?.start(1000); // 每秒收集一次数据
					} else {
						this.recorderManager?.start({
							duration: 60000,
							sampleRate: 16000,
							numberOfChannels: 1,
							encodeBitRate: 48000,
							format: 'mp3'
						});
					}
				} catch (error) {
					console.error('开始录音失败:', error);
					this.isRecording = false;
				}
			}
		},
		startTranscriptionTimer() {
			this.transcriptionTimer = setInterval(async () => {
				if (this.tempAudioChunks.length > 0) {
					const audioBlob = new Blob(this.tempAudioChunks, { type: 'audio/mp3' });
					this.tempAudioChunks = []; // 清空临时数据
					await this.transcribeAudio(audioBlob);
				}
			}, 2000); // 每2秒尝试转写一次
		},
		async transcribeAudio(audioBlob: Blob) {
			try {
				this.isTranscribing = true;

				// 创建 FormData
				const formData = new FormData();
				formData.append('file', audioBlob, 'audio.mp3');
				formData.append('model', 'whisper-1');

				// 使用 fetch API 发送请求
				const response = await fetch('http://api.sealos.vip/v1/audio/transcriptions', {
					method: 'POST',
					headers: {
						'Authorization': 'Bearer sk-wNzf1gHWXMWK9BFD85307f6587D14b0fA838Ca17A4858561'
					},
					body: formData
				});

				if (response.ok) {
					const data = await response.json() as TranscriptionResponse;
					const text = data.text;
					if (text) {
						this.inputMessage = text;
						await this.handleSend();
					} else {
						throw new Error('未能识别语音内容');
					}
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
				this.isTranscribing = false;
			}
		},
		async stopRecording() {
			this.isRecording = false;
			if (this.recordingTimer) {
				clearInterval(this.recordingTimer);
				this.recordingTimer = null;
			}
			clearInterval(this.transcriptionTimer);

			if (process.env.VUE_APP_PLATFORM === 'h5') {
				this.mediaRecorder?.stop();
			} else {
				this.recorderManager?.stop();
			}

			// 等待一下确保音频数据已经收集完成
			setTimeout(async () => {
				if (this.audioChunks.length > 0) {
					const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
					await this.transcribeAudio(audioBlob);
					this.audioChunks = [];
				}
			}, 100);
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
		},
		async handleEndChat() {
			try {
				if (this.isEnding) return;
				this.isEnding = true;

				// 检查必要的数据
				if (!this.agentId || !this.userId) {
					console.log('Missing required data:', {
						agentId: this.agentId,
						userId: this.userId
					});
					throw new Error('缺少必要的参数');
				}

				// 创建训练记录
				const trainingRecordRes = await request<{
					code: number;
					message: string;
					data: {
						id: string;
						userId: string;
						agentId: string;
					};
				}>({
					url: '/agent/trainingRecord',
					method: 'POST',
					data: {
						agentId: String(this.agentId),
						userId: String(this.userId)
					}
				});

				console.log('创建训练记录结果:', trainingRecordRes);

				if (trainingRecordRes.code !== 0) {
					throw new Error('创建训练记录失败');
				}



				const trainingRecordId = trainingRecordRes.data.id;
				console.log('Got training record ID:', trainingRecordId);

				// 2. 保存对话记录
				await request({
					url: `/agent/trainingRecord/${trainingRecordId}/message`,
					method: 'PUT',
					data: {
						messages: this.messages.map(msg => ({
							role: msg.type,
							content: msg.content
						}))
					}
				});

				console.log('Messages saved to training record:', trainingRecordId);

				// 3. 发送评分请求到 FastGPT
				const chatLogs = this.messages.map(msg =>
					`${msg.type === 'user' ? '用户' : 'AI助手'}: ${msg.content}`
				).join('\n');

				const scoreResponse = await uni.request({
					url: 'https://api.fastgpt.in/api/v1/chat/completions',
					method: 'POST',
					header: {
						'Authorization': 'Bearer fastgpt-izkegcE0Ox8MLUA1LPXdxEf7fwE7K3W7jxuuJRH5Wy94BlUVq3odsY7AMsud',
						'Content-Type': 'application/json'
					},
					data: {
						chatId: Math.random().toString(36).substring(7),
						stream: false,
						detail: false,
						responseChatItemId: 'my_responseChatItemId',
						variables: {
							prompt: this.agent?.promptText || '未设置提示词',
							logs: chatLogs,
							score: this.agent?.ratingDimensions?.map((d: RatingDimension) =>
								`${d.keyword}:${d.score}分`
							).join(',') || '未设置评分维度'
						},
						messages: [{
							role: 'user',
							content: '输出'
						}]
					}
				});

				if (scoreResponse.statusCode === 200) {
					// 保存训练记录ID到本地存储
					uni.setStorageSync('currentTrainingId', trainingRecordId);
					uni.setStorageSync('scoreResult', scoreResponse.data);
					uni.redirectTo({
						url: '/pages/score/index?trainingRecordId=' + trainingRecordId
					});
				} else {
					throw new Error('获取评分失败');
				}
			} catch (error) {
				console.error('结束对话失败:', error);
				if (error instanceof Error) {
					console.error('Error details:', {
						message: error.message,
						stack: error.stack,
						name: error.name,
					});
				}

				const errorMessage = error instanceof Error ?
					`操作失败: ${error.message}` :
					'创建训练记录失败';

				uni.showToast({
					title: errorMessage,
					icon: 'none',
					duration: 3000
				});
			} finally {
				this.isEnding = false;
			}
		},
		async loadAgentData() {
			try {
				const res = await request<ApiResponse>({
					url: `/agent/${this.agentId}`,
					method: 'GET'
				});

				if (res.code === 0 && res.data) {
					this.agent = res.data;
				} else {
					throw new Error('获取场景数据失败');
				}
			} catch (error) {
				console.error('Load agent error:', error);
				uni.showToast({
					title: '获取场景数据失败',
					icon: 'none'
				});
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			}
		},
		startRecordingTimer() {
			this.recordingTime = 0;
			this.recordingTimer = setInterval(() => {
				this.recordingTime++;
				// 60秒后自动停止
				if (this.recordingTime >= 60) {
					this.stopRecording();
				}
			}, 1000);
		},
		async getUserInfo() {
			try {
				const res = await request<{
					code: number;
					data: {
						id: string;
						email: string;
						name: string;
					}
				}>({
					url: '/user/info',
					method: 'GET'
				});

				if (res.code === 0 && res.data) {
					this.userId = res.data.id;
					// 保存到本地存储，其他地方可能也需要用到
					uni.setStorageSync('userId', res.data.id);
				} else {
					throw new Error('获取用户信息失败');
				}
			} catch (error) {
				console.error('Get user info error:', error);
				uni.showToast({
					title: '获取用户信息失败',
					icon: 'none'
				});
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
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
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
	padding: 140rpx 12rpx 180rpx;
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
	border: 2rpx solid rgba(99, 102, 241, 0.1);
	border-radius: 50%;
	overflow: hidden;
}

.user-avatar {
	width: 100%;
	height: 100%;
	background: linear-gradient(135deg, #818cf8 0%, #8b5cf6 100%);
	border-radius: 50%;
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(139, 92, 246, 0.15);
}

.message-content {
	background: rgba(99, 102, 241, 0.05);
	padding: 24rpx;
	border-radius: 24rpx;
	font-size: 28rpx;
	color: #333;
	position: relative;
	box-shadow: 0 2rpx 8rpx rgba(99, 102, 241, 0.05);
}

.user .message-content {
	background: linear-gradient(135deg, #818cf8 0%, #8b5cf6 100%);
	color: #fff;
	box-shadow: 0 2rpx 8rpx rgba(139, 92, 246, 0.15);
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
	background: rgba(99, 102, 241, 0.05);
	border-radius: 30rpx;
	font-size: 24rpx;
	color: #8b5cf6;
	border: 1px solid rgba(99, 102, 241, 0.15);
}

.input-area {
	display: flex;
	align-items: center;
	padding: 20rpx 32rpx;
	background: #fff;
	border-top: 1px solid rgba(99, 102, 241, 0.1);
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.03);
}

.input-wrapper {
	flex: 1;
	margin-right: 20rpx;
	position: relative;
}

.message-input {
	height: 80rpx;
	background: #f8f8f8;
	border-radius: 40rpx;
	padding: 0 32rpx;
	font-size: 28rpx;
	border: 1px solid rgba(99, 102, 241, 0.15);
}

.send-btn {
	width: 120rpx;
	height: 80rpx;
	border-radius: 40rpx;
	background: linear-gradient(135deg, #818cf8 0%, #8b5cf6 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 8rpx rgba(139, 92, 246, 0.2);
	transition: all 0.3s ease;
}

.send-btn:active {
	transform: scale(0.95);
	box-shadow: 0 2rpx 4rpx rgba(139, 92, 246, 0.15);
}

.send-text {
	font-size: 28rpx;
	color: #fff;
}

.voice-btn {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(99, 102, 241, 0.05);
	border-radius: 50%;
	transition: all 0.3s ease;
	margin-right: 20rpx;
	border: 1px solid rgba(99, 102, 241, 0.15);
}

.voice-btn.recording {
	background: linear-gradient(135deg, #818cf8 0%, #8b5cf6 100%);
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
	fill: #8b5cf6;
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
	border: 2rpx solid rgba(139, 92, 246, 0.5);
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

/* 结束按钮样式 */
.end-btn {
	padding: 12rpx 24rpx;
	background: #ff6b6b;
	border-radius: 30rpx;
}

.end-text {
	color: #fff;
	font-size: 28rpx;
}

/* 弹窗样式 */
.modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 100;
}

.modal-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
}

.modal-content {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 600rpx;
	background: #fff;
	border-radius: 20rpx;
	padding: 40rpx;
}

.modal-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	text-align: center;
	margin-bottom: 20rpx;
}

.modal-desc {
	font-size: 28rpx;
	color: #666;
	text-align: center;
	margin-bottom: 40rpx;
}

.modal-btns {
	display: flex;
	gap: 20rpx;
}

.modal-btn {
	flex: 1;
	height: 80rpx;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
}

.modal-btn.cancel {
	background: #f8f8f8;
	color: #666;
}

.modal-btn.confirm {
	background: #ff6b6b;
	color: #fff;
}

.scene-intro {
	background: rgba(99, 102, 241, 0.05);
	border-radius: 16rpx;
	padding: 24rpx;
	margin: 20rpx 20rpx 40rpx;
	border: 1px solid rgba(99, 102, 241, 0.15);
	box-shadow: 0 2rpx 8rpx rgba(99, 102, 241, 0.05);
}

.intro-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #8b5cf6;
	margin-bottom: 12rpx;
	padding: 0 12rpx;
}

.intro-content {
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
	padding: 0 12rpx;
}

.recording-indicator {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.recording-dot {
	width: 12rpx;
	height: 12rpx;
	background: #8b5cf6;
	border-radius: 50%;
	animation: pulse 1s infinite;
}

.recording-time {
	font-size: 24rpx;
	color: #8b5cf6;
}

.recording-cancel {
	position: absolute;
	right: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	font-size: 24rpx;
	color: #ff6b6b;
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
	background: rgba(255, 107, 107, 0.1);
}

.recording-cancel:active {
	opacity: 0.8;
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

.recording-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.3);
	z-index: 1000;
	display: flex;
	align-items: center;
	justify-content: center;
}

.recording-panel {
	background: #fff;
	border-radius: 24rpx;
	padding: 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 24rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.recording-waves {
	width: 160rpx;
	height: 160rpx;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.recording-status {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.recording-dot {
	width: 16rpx;
	height: 16rpx;
	background: #8b5cf6;
	border-radius: 50%;
	animation: pulse 1s infinite;
}

.recording-time {
	font-size: 32rpx;
	color: #333;
	font-weight: 500;
}

.recording-tip {
	font-size: 28rpx;
	color: #666;
}

.recording-actions {
	display: flex;
	gap: 32rpx;
	margin-top: 20rpx;
}

.action-btn {
	padding: 16rpx 40rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
	transition: all 0.3s ease;
}

.action-btn.cancel {
	background: rgba(239, 68, 68, 0.1);
	color: #ef4444;
}

.action-btn.confirm {
	background: linear-gradient(135deg, #818cf8 0%, #8b5cf6 100%);
	color: #fff;
}

.action-btn:active {
	transform: scale(0.95);
	opacity: 0.9;
}

/* 修改波纹动画 */
.wave {
	border: 4rpx solid rgba(139, 92, 246, 0.3);
	animation: wave-animation 2s infinite;
}

@keyframes wave-animation {
	0% {
		transform: scale(0.5);
		opacity: 1;
	}

	100% {
		transform: scale(2);
		opacity: 0;
	}
}

.end-btn {
	padding: 12rpx 24rpx;
	background: #ef4444;
	border-radius: 8rpx;
	margin-left: auto;
}

.end-text {
	color: #fff;
	font-size: 28rpx;
}
</style>