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
			<view class="voice-btn" @tap="toggleRecording">
				<view class="voice-icon" :class="{ recording: isRecording }">
					<text class="iconfont" :class="isRecording ? 'icon-stop' : 'icon-mic'"></text>
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
			<view class="recording-wave"></view>
			<text class="recording-text">正在录音...</text>
			<text class="recording-cancel" @tap="cancelRecording">取消</text>
		</view>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';
import DefaultAvatar from '@/components/DefaultAvatar.vue';
import { API_BASE_URL } from '@/config';

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

export default Vue.extend({
	components: {
		DefaultAvatar
	},
	data() {
		return {
			messages: [
				{
					type: 'assistant',
						content: 'Hello! how may I help you today?'
				}
			],
			inputMessage: '',
			scrollTop: 0,
			isGenerating: false,
			isRecording: false,
			mediaRecorder: null as MediaRecorder | null,
			audioChunks: [] as Blob[],
			recordStartTime: 0,
			hasRecordPermission: false
		}
	},
	async mounted() {
		// 在 Web 端初始化录音
		if (process.env.VUE_APP_PLATFORM === 'h5') {
			try {
				this.mediaRecorder = await initMediaRecorder();
				this.hasRecordPermission = true;
				
				// 监听录音数据
				this.mediaRecorder.ondataavailable = (event) => {
					if (event.data.size > 0) {
						this.audioChunks.push(event.data);
					}
				};
				
				// 监听录音停止
				this.mediaRecorder.onstop = async () => {
					const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
					await this.uploadAudioBlob(audioBlob);
					this.audioChunks = [];
				};
			} catch (error) {
				console.error('初始化录音失败:', error);
				this.hasRecordPermission = false;
			}
		} else {
			// 初始化录音管理器 (非 Web 端)
			this.recorderManager = uni.getRecorderManager();
			// ... 其他初始化代码保持不变
		}
	},
	methods: {
		handleBack() {
			uni.navigateBack();
		},
		handleSend() {
			if (!this.inputMessage && !this.isRecording) return;

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

			// 模拟AI回复
			this.isGenerating = true;
			setTimeout(() => {
				this.messages.push({
					type: 'assistant',
					content: `This is a response to: ${userMessage}`
				});
				this.isGenerating = false;
				this.scrollToBottom();
			}, 1000);
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
		async toggleRecording() {
			// Web 端录音处理
			if (process.env.VUE_APP_PLATFORM === 'h5') {
				if (!this.mediaRecorder) {
					try {
						this.mediaRecorder = await initMediaRecorder();
						this.hasRecordPermission = true;
					} catch (error) {
						uni.showToast({
							title: '无法访问麦克风',
							icon: 'none'
						});
						return;
					}
				}

				if (this.isRecording) {
					// 停止录音
					this.mediaRecorder.stop();
					this.isRecording = false;
					
					const duration = Date.now() - this.recordStartTime;
					if (duration < 1000) {
						uni.showToast({
							title: '录音时间太短',
							icon: 'none'
						});
						this.audioChunks = [];
						return;
					}
				} else {
					// 开始录音
					this.audioChunks = [];
					this.isRecording = true;
					this.recordStartTime = Date.now();
					this.mediaRecorder.start();
				}
				return;
			}

			// 非 Web 端录音处理
			if (!this.hasRecordPermission) {
				const granted = await this.requestRecordPermission();
				if (!granted) return;
			}
		},
		cancelRecording() {
			if (process.env.VUE_APP_PLATFORM === 'h5') {
				if (this.mediaRecorder && this.isRecording) {
					this.mediaRecorder.stop();
					this.audioChunks = [];
				}
			} else {
				this.recorderManager.stop();
			}
			
			this.isRecording = false;
			uni.showToast({
				title: '已取消录音',
				icon: 'none'
			});
		},
		async uploadAudioBlob(audioBlob: Blob) {
			try {
				uni.showLoading({ title: '识别中...' });
				
				// 创建 FormData
				const formData = new FormData();
				formData.append('file', audioBlob, 'audio.mp3');
				formData.append('model', 'whisper-1');
				
				// 发送请求
				const response = await fetch(`${API_BASE_URL}/v1/audio/transcriptions`, {
					method: 'POST',
					headers: {
						'Authorization': 'Bearer sk-wNzf1gHWXMWK9BFD85307f6587D14b0fA838Ca17A4858561'
					},
					body: formData
				});
				
				if (response.ok) {
					const data = await response.json();
					this.inputMessage = data.text;
					this.handleSend();
				} else {
					throw new Error('语音识别失败');
				}
			} catch (error) {
				uni.showToast({
					title: '语音识别失败',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		},
		async checkRecordPermission() {
			try {
				const res = await uni.authorize({
					scope: 'scope.record'
				});
				this.hasRecordPermission = true;
			} catch (error) {
				this.hasRecordPermission = false;
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
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

.voice-icon {
	width: 48rpx;
	height: 48rpx;
	border-radius: 24rpx;
	background: #f5f5f5;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
}

.voice-icon.recording {
	background: #ff6b00;
	color: #fff;
	transform: scale(1.1);
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

.recording-tip {
	position: fixed;
	bottom: 200rpx;
	left: 50%;
	transform: translateX(-50%);
	background: rgba(0, 0, 0, 0.7);
	padding: 30rpx 60rpx;
	border-radius: 20rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.recording-wave {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: #ff6b00;
	margin-bottom: 20rpx;
	animation: wave 1s ease-in-out infinite;
	position: relative;
}

.recording-wave::after {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 40rpx;
	height: 40rpx;
	background: #fff;
	border-radius: 50%;
}

.recording-text {
	color: #fff;
	font-size: 28rpx;
	margin-bottom: 16rpx;
}

.recording-cancel {
	color: #ff6b00;
	font-size: 28rpx;
	padding: 10rpx 20rpx;
}

.recording-cancel:active {
	opacity: 0.8;
}

@keyframes wave {
	0% {
		transform: scale(0.8);
		opacity: 1;
	}
	100% {
		transform: scale(1.5);
		opacity: 0;
	}
}
</style>