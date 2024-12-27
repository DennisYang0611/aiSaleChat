<template>
	<view class="container">
		<!-- 背景粒子效果 -->
		<view class="particles">
			<view v-for="n in 20" :key="n" class="particle"></view>
		</view>

		<view class="loading-content">
			<!-- AI大脑动画 -->
			<view class="ai-brain">
				<view class="brain-core">
					<!-- 内部能量脉冲 -->
					<view class="energy-pulse"></view>
				</view>
				<view class="brain-waves">
					<view class="wave"></view>
					<view class="wave"></view>
					<view class="wave"></view>
				</view>
				<!-- 神经元连接动画 -->
				<view class="neurons">
					<view class="neuron n1"></view>
					<view class="neuron n2"></view>
					<view class="neuron n3"></view>
					<view class="neuron n4"></view>
					<view class="neuron n5"></view>
					<view class="neuron n6"></view>
					<view class="connection c1"></view>
					<view class="connection c2"></view>
					<view class="connection c3"></view>
					<view class="connection c4"></view>
					<view class="connection c5"></view>
					<!-- 能量光束效果 -->
					<view class="energy-beam"></view>
				</view>
			</view>

			<!-- 文字提示 -->
			<view class="text-area">
				<text class="title">AI正在思考</text>
				<text class="subtitle">正在为您生成专业的提示词</text>
				<view class="dot-flow">
					<text class="dot"></text>
					<text class="dot"></text>
					<text class="dot"></text>
				</view>
			</view>
		</view>

		<!-- 取消按钮 -->
		<!-- <button class="cancel-btn" @tap="handleCancel">取消</button> -->
	</view>
</template>

<script lang="ts">
import { request } from '@/utils/request';
import Vue from 'vue';

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

export default Vue.extend({
	data() {
		return {
			promptText: '',
		}
	},
	async onLoad(options) {
		const formData = uni.getStorageSync('agentFormData');
		if (!formData) {
			this.handleError('未获取到表单数据');
			return;
		}

		// 准备请求数据
		const requestData = {
			chatId: Math.random().toString(36).substring(7),
			stream: false,
			detail: false,
			responseChatItemId: 'my_responseChatItemId',
			variables: {
				name: formData.name,
				scene: formData.scene,
				customerProfile: formData.customerProfile,
				buyingPower: formData.buyingPower,
				consumptionHabits: formData.consumptionHabits,
				consumptionConcepts: formData.consumptionConcepts
			},
			messages: [
				{
					role: 'user',
					content: '生成'
				}
			]
		};



		// 发起请求
		uni.request({
			url: 'https://api.fastgpt.in/api/v1/chat/completions',
			method: 'POST',
			header: {
				'Authorization': 'Bearer fastgpt-ivclLFAcNWNyOVNvvm8K9LjcoajA5sH8roTienpWDm9pbsKyiSk8aoHXnH7GhV',
				'Content-Type': 'application/json'
			},
			data: requestData,
			success: async (res: UniApp.RequestSuccessCallbackResult) => {
				try {
					const response = res.data as AIResponse;
					this.promptText = response.choices[0].message.content;

					// 存储生成的提示词
					uni.setStorageSync('generatedPrompt', this.promptText);


					// 发起创建 agent 请求
					const agentInfo = await request<{ data: any[] }>({
						url: '/agent',
						method: 'POST',
						data: {
							creatorId: 'fe9d6b54-40d7-4d56-a3b1-50c21feeeb41',
							name: formData.name,
							prompt: formData,
							avatar: 'https://lslkgpcf.cloud.sealos.io/logo.png',
							promptText: this.promptText,
							ratingDimensions: {}
						},
					});
					uni.setStorageSync('agentId', agentInfo?.data[0].id);

					// 跳转到成功页面
					this.navigateToSuccess();
				} catch (error) {
					this.handleError('解析响应失败');
				}
			},
			fail: () => {
				this.handleError('请求失败');
			}
		});
	},
	methods: {
		handleError(message: string) {
			uni.showToast({
				title: message,
				icon: 'none'
			});
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);
		},
		navigateToSuccess() {
			uni.navigateTo({
				url: '/pages/prompt/success'
			});
		}
	}
});
</script>

<style>
.container {
	min-height: 100vh;
	background: linear-gradient(135deg, #f6f7fb 0%, #ffffff 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.loading-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 60rpx;
}

.ai-brain {
	width: 300rpx;
	height: 300rpx;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.brain-core {
	width: 100rpx;
	height: 100rpx;
	background: linear-gradient(135deg, #6366f1, #8b5cf6);
	border-radius: 50%;
	animation: pulse 2s ease-in-out infinite;
	position: relative;
	overflow: hidden;
}

.brain-waves {
	position: absolute;
	width: 100%;
	height: 100%;
}

.wave {
	position: absolute;
	border: 4rpx solid rgba(99, 102, 241, 0.3);
	border-radius: 50%;
	width: 100%;
	height: 100%;
	animation: wave 3s ease-out infinite;
	opacity: 0;
}

.wave:nth-child(2) {
	animation-delay: 1s;
}

.wave:nth-child(3) {
	animation-delay: 2s;
}

.neurons {
	position: absolute;
	width: 100%;
	height: 100%;
}

.neuron {
	position: absolute;
	width: 12rpx;
	height: 12rpx;
	background: #6366f1;
	border-radius: 50%;
	animation: glow 1.5s ease-in-out infinite, neuronFloat 8s ease-in-out infinite;
	box-shadow: 0 0 20rpx rgba(99, 102, 241, 0.6);
}

.connection {
	position: absolute;
	height: 2rpx;
	background: linear-gradient(90deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
	transform-origin: left center;
	animation: connect 2s ease-in-out infinite;
}

.text-area {
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16rpx;
}

.title {
	font-size: 40rpx;
	font-weight: 600;
	color: #333;
}

.subtitle {
	font-size: 28rpx;
	color: #666;
	font-weight: 400;
}

.dot-flow {
	display: flex;
	gap: 12rpx;
	margin-top: 20rpx;
}

.dot {
	width: 12rpx;
	height: 12rpx;
	background: #6366f1;
	border-radius: 50%;
	animation: dotFlow 1.5s ease-in-out infinite;
}

.dot:nth-child(2) {
	animation-delay: 0.5s;
}

.dot:nth-child(3) {
	animation-delay: 1s;
}

/* 动画关键帧 */
@keyframes pulse {
	0% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7),
					inset 0 0 20rpx rgba(255, 255, 255, 0.5);
	}
	70% {
		transform: scale(1);
		box-shadow: 0 0 30rpx rgba(99, 102, 241, 0.7),
					inset 0 0 40rpx rgba(255, 255, 255, 0.8);
	}
	100% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(99, 102, 241, 0),
					inset 0 0 20rpx rgba(255, 255, 255, 0.5);
	}
}

@keyframes wave {
	0% {
		transform: scale(0);
		opacity: 1;
	}
	100% {
		transform: scale(1);
		opacity: 0;
	}
}

@keyframes glow {
	0%, 100% {
		opacity: 0.3;
		transform: scale(1);
	}
	50% {
		opacity: 1;
		transform: scale(1.2);
	}
}

@keyframes connect {
	0%, 100% {
		opacity: 0.3;
		transform: scaleX(0.8);
	}
	50% {
		opacity: 1;
		transform: scaleX(1);
	}
}

@keyframes dotFlow {
	0%, 100% {
		transform: translateY(0);
		opacity: 0.5;
	}
	50% {
		transform: translateY(-6rpx);
		opacity: 1;
	}
}

/* 背景粒子动画 */
.particles {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
	pointer-events: none;
}

.particle {
	position: absolute;
	width: 4rpx;
	height: 4rpx;
	background: rgba(99, 102, 241, 0.3);
	border-radius: 50%;
	animation: particleFloat 15s linear infinite;
}

/* 随机分布粒子 */
.particle:nth-child(3n) {
	width: 6rpx;
	height: 6rpx;
	animation-duration: 20s;
}

.particle:nth-child(3n + 1) {
	width: 8rpx;
	height: 8rpx;
	animation-duration: 25s;
}

/* 内部能量脉冲 */
.energy-pulse {
	position: absolute;
	top: 50%;
	left: 50%;
	width: 150%;
	height: 150%;
	background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
	transform: translate(-50%, -50%);
	animation: energyPulse 3s ease-in-out infinite;
}

/* 能量光束 */
.energy-beam {
	position: absolute;
	width: 2rpx;
	background: linear-gradient(to top, rgba(99, 102, 241, 0), rgba(99, 102, 241, 0.8), rgba(99, 102, 241, 0));
	animation: beamMove 4s ease-in-out infinite;
}

/* 定位神经元 */
.n1 { top: 20%; left: 20%; animation-delay: 0s, 1s; }
.n2 { top: 30%; right: 25%; animation-delay: 0.3s, 2s; }
.n3 { bottom: 25%; right: 20%; animation-delay: 0.6s, 3s; }
.n4 { bottom: 30%; left: 25%; animation-delay: 0.9s, 4s; }
.n5 { top: 50%; right: 15%; animation-delay: 1.2s, 5s; }
.n6 { bottom: 40%; left: 15%; animation-delay: 1.5s, 6s; }

/* 新增动画关键帧 */
@keyframes particleFloat {
	0% {
		transform: translate(0, 0);
		opacity: 0;
	}
	50% {
		opacity: 0.8;
	}
	100% {
		transform: translate(100vw, -100vh);
		opacity: 0;
	}
}

@keyframes energyPulse {
	0%, 100% {
		opacity: 0.3;
		transform: translate(-50%, -50%) scale(0.8);
	}
	50% {
		opacity: 0.6;
		transform: translate(-50%, -50%) scale(1.2);
	}
}

@keyframes beamMove {
	0% {
		height: 0;
		opacity: 0;
		transform: rotate(45deg) translateX(-50%);
	}
	50% {
		height: 200rpx;
		opacity: 1;
		transform: rotate(45deg) translateX(0);
	}
	100% {
		height: 0;
		opacity: 0;
		transform: rotate(45deg) translateX(50%);
	}
}

@keyframes neuronFloat {
	0%, 100% {
		transform: translate(0, 0);
	}
	50% {
		transform: translate(10rpx, -10rpx);
	}
}
</style>