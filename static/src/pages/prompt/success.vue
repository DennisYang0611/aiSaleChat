<template>
	<view class="modal-container">
		<view class="modal-content">
			<!-- 关闭按钮 -->
			<view class="close-btn" @tap="handleClose">
				<text class="close-icon">×</text>
			</view>
			
			<!-- 动画图标 -->
			<view class="animation-container">
				<view class="success-animation">
					<view class="circle-outer"></view>
					<view class="circle-inner"></view>
					<view class="success-icon">
						<view class="success-line-tip"></view>
						<view class="success-line-long"></view>
					</view>
					<view class="particles">
						<view class="particle p1"></view>
						<view class="particle p2"></view>
						<view class="particle p3"></view>
						<view class="particle p4"></view>
						<view class="particle p5"></view>
						<view class="particle p6"></view>
					</view>
				</view>
			</view>
			
			<!-- 文字提示 -->
			<view class="text-area">
				<text class="title">你的提示词已经生成</text>
				<view class="prompt-box">
					<textarea
						class="prompt-textarea"
						v-model="promptText"
						auto-height
						placeholder="编辑你的提示词"
					></textarea>
				</view>
				<text class="edit-hint">你可以编辑提示词内容</text>
			</view>
			
			<!-- 确认按钮 -->
			<button class="confirm-btn" @tap="handleConfirm">确认</button>
		</view>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	data() {
		return {
			promptText: '',
			originalPrompt: ''
		}
	},
	onLoad() {
		// 从本地存储获取生成的提示词
		const prompt = uni.getStorageSync('generatedPrompt');
		if (prompt) {
			this.promptText = prompt;
			this.originalPrompt = prompt;
		}
	},
	methods: {
		handleClose() {
			// 清除本地存储的数据
			uni.removeStorageSync('agentFormData');
			uni.removeStorageSync('generatedPrompt');
			// 提示用户是否保存更改
			if (this.promptText !== this.originalPrompt) {
				uni.showModal({
					title: '提示',
					content: '你有未保存的更改，确定要离开吗？',
					success: (res) => {
						if (res.confirm) {
							uni.reLaunch({
								url: '/pages/evaluation/index'
							});
						}
					}
				});
			} else {
				uni.reLaunch({
					url: '/pages/evaluation/index'
				});
			}
		},
		handleConfirm() {
			// 更新存储的提示词
			uni.setStorageSync('generatedPrompt', this.promptText);
			
			// 显示保存成功提示
			uni.showToast({
				title: '提示词已更新',
				icon: 'success',
				duration: 1500
			});

			// 延迟跳转
			setTimeout(() => {
				uni.redirectTo({
					url: '/pages/dimension/index'
				});
			}, 1500);
		}
	}
});
</script>

<style>
.modal-container {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 30rpx;
}

.modal-content {
	width: 100%;
	background-color: #fff;
	border-radius: 24rpx;
	padding: 40rpx 30rpx;
	position: relative;
	max-height: 90vh;
	display: flex;
	flex-direction: column;
}

.close-btn {
	position: absolute;
	top: 20rpx;
	right: 20rpx;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.close-icon {
	font-size: 48rpx;
	color: #999;
	font-weight: 200;
}

.animation-container {
	width: 200rpx;
	height: 200rpx;
	margin: 0 auto 30rpx;
	position: relative;
}

.success-animation {
	width: 100%;
	height: 100%;
	position: relative;
	animation: appear 0.4s ease-out;
}

.circle-outer {
	position: absolute;
	width: 100%;
	height: 100%;
	border-radius: 50%;
	border: 6rpx solid #333;
	animation: circle-scale 0.5s ease-out 0.2s forwards;
	transform: scale(0);
}

.circle-inner {
	position: absolute;
	width: 82%;
	height: 82%;
	top: 9%;
	left: 9%;
	border-radius: 50%;
	background: #333;
	animation: circle-fill 0.4s ease-out 0.4s forwards;
	transform: scale(0);
}

.success-icon {
	position: absolute;
	width: 100%;
	height: 100%;
	animation: success-appear 0.4s ease-out 0.8s forwards;
	transform: scale(0);
}

.success-line-tip {
	position: absolute;
	width: 12%;
	height: 30%;
	background: #fff;
	left: 28%;
	top: 50%;
	transform: rotate(45deg);
	border-radius: 4rpx;
}

.success-line-long {
	position: absolute;
	width: 12%;
	height: 60%;
	background: #fff;
	right: 28%;
	top: 30%;
	transform: rotate(-45deg);
	border-radius: 4rpx;
}

.particles {
	position: absolute;
	width: 100%;
	height: 100%;
}

.particle {
	position: absolute;
	width: 15rpx;
	height: 15rpx;
	background: #333;
	border-radius: 50%;
	animation: particle-move 0.8s ease-out forwards;
	opacity: 0;
}

.p1 { top: 0; left: 50%; animation-delay: 1s; }
.p2 { top: 50%; right: 0; animation-delay: 1.1s; }
.p3 { bottom: 0; left: 50%; animation-delay: 1.2s; }
.p4 { top: 50%; left: 0; animation-delay: 1.3s; }
.p5 { top: 25%; right: 25%; animation-delay: 1.4s; }
.p6 { bottom: 25%; left: 25%; animation-delay: 1.5s; }

@keyframes appear {
	from { opacity: 0; transform: scale(0.5); }
	to { opacity: 1; transform: scale(1); }
}

@keyframes circle-scale {
	from { transform: scale(0); }
	to { transform: scale(1); }
}

@keyframes circle-fill {
	from { transform: scale(0); }
	to { transform: scale(1); }
}

@keyframes success-appear {
	from { transform: scale(0) rotate(-45deg); }
	to { transform: scale(1) rotate(0); }
}

@keyframes particle-move {
	0% {
		transform: scale(0) translate(0, 0);
		opacity: 0;
	}
	50% {
		opacity: 1;
	}
	100% {
		transform: scale(1) translate(var(--tx, 100rpx), var(--ty, 100rpx));
		opacity: 0;
	}
}

.text-area {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
	margin-bottom: 30rpx;
	flex-shrink: 0;
}

.title {
	font-size: 36rpx;
	color: #333;
	font-weight: bold;
	margin-bottom: 10rpx;
}

.prompt-box {
	background: rgba(248, 248, 248, 0.9);
	border-radius: 16rpx;
	padding: 20rpx;
	margin-top: 20rpx;
	width: 100%;
	box-sizing: border-box;
	border: 2rpx solid #eee;
	transition: all 0.3s ease;
	position: relative;
	height: 300rpx;
	display: flex;
}

.prompt-box:focus-within {
	background: #fff;
	border-color: #333;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.prompt-textarea {
	color: #333;
	font-size: 26rpx;
	line-height: 1.6;
	flex: 1;
	background: transparent;
	border: none;
	padding: 0;
	word-break: break-all;
	word-wrap: break-word;
	white-space: pre-wrap;
	overflow-y: scroll;
	-webkit-overflow-scrolling: touch;
	box-sizing: border-box;
}

/* 修改滚动条样式 */
.prompt-textarea::-webkit-scrollbar {
	width: 12rpx !important;
}

.prompt-textarea::-webkit-scrollbar-track {
	background: #f5f5f5;
	border-radius: 6rpx;
}

.prompt-textarea::-webkit-scrollbar-thumb {
	background: #999;
	border-radius: 6rpx;
}

.prompt-textarea::-webkit-scrollbar-thumb:hover {
	background: #666;
}

.edit-hint {
	font-size: 24rpx;
	color: #999;
	margin-top: 8rpx;
	text-align: center;
}

.confirm-btn {
	width: 100%;
	height: 90rpx;
	background: #333;
	border-radius: 16rpx;
	color: #fff;
	font-size: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	margin-top: auto;
}

button::after {
	border: none;
}

/* 针对不同设备高度的优化 */
@media screen and (max-height: 667px) {
	.animation-container {
		width: 160rpx;
		height: 160rpx;
		margin-bottom: 20rpx;
	}

	.prompt-box {
		height: 240rpx;
	}

	.title {
		font-size: 32rpx;
	}
}

/* 较大屏幕的优化 */
@media screen and (min-height: 700px) {
	.prompt-box {
		height: 360rpx;
	}
}

/* 修改滚动提示的样式 */
.prompt-box::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 40rpx;
	background: linear-gradient(transparent, rgba(248, 248, 248, 0.9));
	pointer-events: none;
	opacity: 0.8;
	z-index: 1;
}

/* 添加滚动提示箭头 */
.prompt-box::before {
	content: '';
	position: absolute;
	bottom: 10rpx;
	right: 16rpx;
	width: 12rpx;
	height: 12rpx;
	border-right: 3rpx solid #999;
	border-bottom: 3rpx solid #999;
	transform: rotate(45deg);
	z-index: 2;
	opacity: 0.6;
}

/* 修复 textarea 在某些设备上的默认样式 */
.prompt-textarea {
	width: 100% !important;
	height: 100% !important;
}
</style> 