<template>
	<view class="modal-container">
		<!-- 背景粒子效果 -->
		<view class="particles">
			<view v-for="n in 20" :key="n" class="particle"></view>
		</view>

		<view class="modal-content">
			<!-- 关闭按钮 -->
			<view class="close-btn" @tap="handleClose">
				<text class="close-icon">×</text>
			</view>

			<!-- 高科技动画效果 -->
			<view class="tech-animation">
				<!-- 核心能量球 -->
				<view class="energy-core">
					<view class="core-inner"></view>
					<view class="core-outer"></view>
					<view class="energy-particles">
						<view v-for="n in 12" :key="n" class="particle"></view>
					</view>
				</view>
				<!-- 能量环 -->
				<view class="energy-rings">
					<view class="ring r1"></view>
					<view class="ring r2"></view>
					<view class="ring r3"></view>
				</view>
				<!-- 光束效果 -->
				<view class="light-beams">
					<view v-for="n in 6" :key="n" class="beam"></view>
				</view>
				<!-- 悬浮标记 -->
				<view class="floating-badges">
					<view class="badge b1">AI</view>
					<view class="badge b2">✓</view>
					<view class="badge b3">OK</view>
				</view>
			</view>

			<!-- 文字提示 -->
			<view class="text-area">
				<view class="title-wrap">
					<text class="title">AI已完成提示词生成</text>
					<text class="subtitle">您可以根据需要修改提示词</text>
				</view>
			</view>

			<!-- 提示词展示 -->
			<view class="prompt-box">
				<textarea 
					class="prompt-textarea" 
					v-model="promptText"
					auto-height
					:maxlength="-1"
					scroll-y
					show-confirm-bar="false"
					@input="handleInput"
				></textarea>
			</view>

			<!-- 按钮区域 -->
			<view class="button-area">
				<button class="confirm-btn gradient-btn" @tap="handleConfirm">
					<text class="btn-text">设置评分维度</text>
					<text class="btn-icon">→</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';
import { request } from '@/utils/request';

export default Vue.extend({
	data() {
		return {
			promptText: '',
			matrixChars: '01',
			matrixPoints: [] as Array<{x: number, y: number, isOutline: boolean}>
		}
	},
	onLoad() {
		const prompt = uni.getStorageSync('generatedPrompt');
		if (prompt) {
			this.promptText = prompt;
		}
	},
	mounted() {
		this.generateMatrixPoints();
	},
	methods: {
		handleInput(e: any) {
			this.promptText = e.detail.value;
		},
		handleClose() {
			uni.navigateBack();
		},
		async handleConfirm() {
			const agentId = uni.getStorageSync('agentId');
			if (!agentId) {
				uni.showToast({
					title: '未找到场景ID',
					icon: 'none'
				});
				return;
			}

			// 如果提示词有修改，先更新提示词
			if (this.promptText !== uni.getStorageSync('generatedPrompt')) {
				try {
					await request({
						url: `/agent/${agentId}`,
						method: 'PUT',
						data: {
							promptText: this.promptText
						}
					});
				} catch (error) {
					uni.showToast({
						title: '更新提示词失败',
						icon: 'none'
					});
					return;
				}
			}

			uni.redirectTo({
				url: `/pages/dimension/index?agentId=${agentId}`
			});
		},
		randomChar() {
			return this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
		},
		generateMatrixPoints() {
			const points = [];
			// 生成背景点
			for(let i = 0; i < 200; i++) {
				points.push({
					x: Math.random() * 100,
					y: Math.random() * 100,
					isOutline: false
				});
			}
			
			// 生成人像轮廓点
			const outlinePoints = [
				// 头部轮廓
				{x: 50, y: 15}, {x: 45, y: 18}, {x: 42, y: 22}, {x: 40, y: 26},
				{x: 39, y: 30}, {x: 38, y: 34}, {x: 39, y: 38}, {x: 40, y: 42},
				{x: 42, y: 46}, {x: 45, y: 50}, {x: 48, y: 52}, {x: 52, y: 52},
				{x: 55, y: 50}, {x: 58, y: 46}, {x: 60, y: 42}, {x: 61, y: 38},
				{x: 62, y: 34}, {x: 61, y: 30}, {x: 60, y: 26}, {x: 58, y: 22},
				{x: 55, y: 18}, {x: 50, y: 15},
				// 颈部和肩部
				{x: 45, y: 55}, {x: 42, y: 60}, {x: 38, y: 65}, {x: 35, y: 70},
				{x: 55, y: 55}, {x: 58, y: 60}, {x: 62, y: 65}, {x: 65, y: 70},
			].map(p => ({...p, isOutline: true}));
			
			this.matrixPoints = [...points, ...outlinePoints];
		}
	}
});
</script>

<style>
.modal-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #f6f7fb 0%, #ffffff 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.modal-content {
	width: 90%;
	max-width: 600rpx;
	background: #fff;
	border-radius: 24rpx;
	padding: 40rpx;
	box-shadow: 0 20rpx 40rpx rgba(99, 102, 241, 0.1);
	position: relative;
	overflow: hidden;
	margin-top: -50rpx;
}

.close-btn {
	position: absolute;
	top: 20rpx;
	right: 20rpx;
	width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.close-icon {
	font-size: 32rpx;
	font-weight: bold;
}

.text-area {
	text-align: center;
	margin: 20rpx 0 40rpx;
}

.title-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
}

.title {
	font-size: 36rpx;
	font-weight: 600;
	color: #333;
	line-height: 1.4;
}

.subtitle {
	font-size: 28rpx;
	font-weight: 400;
	color: #666;
	line-height: 1.4;
}

.prompt-box {
	margin-top: 20rpx;
	background: #f8f9ff;
	border-radius: 16rpx;
	padding: 30rpx;
	height: 300rpx;
	position: relative;
	overflow-y: auto;
	-webkit-overflow-scrolling: touch;
}

.prompt-textarea {
	width: 100%;
	font-size: 28rpx;
	line-height: 1.6;
	color: #333;
	background: transparent;
	height: 100%;
	box-sizing: border-box;
}

.gradient-btn {
	background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
	color: #fff;
	height: 90rpx;
	border-radius: 45rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	box-shadow: 0 8rpx 20rpx rgba(99, 102, 241, 0.2);
	transition: all 0.3s ease;
}

.gradient-btn:active {
	transform: scale(0.98);
	box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.15);
}

.btn-text {
	margin-right: 12rpx;
}

.btn-icon {
	font-size: 32rpx;
	font-weight: bold;
}

/* 新的高科技动画样式 */
.tech-animation {
	width: 240rpx;
	height: 240rpx;
	margin: 40rpx auto;
	position: relative;
}

/* 核心能量球 */
.energy-core {
	position: absolute;
	width: 100rpx;
	height: 100rpx;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	z-index: 2;
}

.core-inner {
	width: 100%;
	height: 100%;
	background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
	border-radius: 50%;
	animation: pulse 2s ease-in-out infinite;
	box-shadow: 0 0 30rpx rgba(99, 102, 241, 0.6);
}

.core-outer {
	position: absolute;
	width: 140%;
	height: 140%;
	left: -20%;
	top: -20%;
	border: 4rpx solid rgba(124, 58, 237, 0.5);
	border-radius: 50%;
	animation: rotate 10s linear infinite;
}

/* 能量环 */
.energy-rings {
	position: absolute;
	width: 100%;
	height: 100%;
	animation: counter-rotate 20s linear infinite;
}

.ring {
	position: absolute;
	border-radius: 50%;
	border: 2rpx dashed rgba(99, 102, 241, 0.3);
}

.r1 {
	width: 140%;
	height: 140%;
	left: -20%;
	top: -20%;
	animation: glow 3s ease-in-out infinite;
}

.r2 {
	width: 180%;
	height: 180%;
	left: -40%;
	top: -40%;
	animation: glow 3s ease-in-out infinite 1s;
}

.r3 {
	width: 220%;
	height: 220%;
	left: -60%;
	top: -60%;
	animation: glow 3s ease-in-out infinite 2s;
}

/* 光束效果 */
.light-beams {
	position: absolute;
	width: 100%;
	height: 100%;
	animation: rotate 15s linear infinite;
}

.beam {
	position: absolute;
	width: 2rpx;
	height: 50%;
	left: 50%;
	top: 0;
	background: linear-gradient(to top, transparent, rgba(99, 102, 241, 0.6), transparent);
	transform-origin: bottom center;
}

.beam:nth-child(1) { transform: rotate(0deg); }
.beam:nth-child(2) { transform: rotate(60deg); }
.beam:nth-child(3) { transform: rotate(120deg); }
.beam:nth-child(4) { transform: rotate(180deg); }
.beam:nth-child(5) { transform: rotate(240deg); }
.beam:nth-child(6) { transform: rotate(300deg); }

/* 悬浮标记 */
.floating-badges {
	position: absolute;
	width: 100%;
	height: 100%;
}

.badge {
	position: absolute;
	padding: 8rpx 16rpx;
	background: rgba(99, 102, 241, 0.9);
	color: white;
	border-radius: 20rpx;
	font-size: 24rpx;
	animation: float 3s ease-in-out infinite;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
}

.b1 { top: 20%; left: 10%; animation-delay: 0s; }
.b2 { top: 60%; right: 10%; animation-delay: 1s; }
.b3 { bottom: 20%; left: 50%; animation-delay: 2s; }

/* 动画关键帧 */
@keyframes pulse {
	0%, 100% { transform: scale(0.95); opacity: 0.8; }
	50% { transform: scale(1.05); opacity: 1; }
}

@keyframes rotate {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

@keyframes counter-rotate {
	from { transform: rotate(360deg); }
	to { transform: rotate(0deg); }
}

@keyframes glow {
	0%, 100% { opacity: 0.3; transform: scale(1); }
	50% { opacity: 0.6; transform: scale(1.05); }
}

@keyframes float {
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-10rpx); }
}

.button-area {
	margin-top: 80rpx;
	margin-bottom: 30rpx;
}
</style>