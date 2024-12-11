<template>
	<view class="container">
		<view class="loading-area">
			<!-- 动态 Logo -->
			<view class="dynamic-logo">
				<view class="orbit">
					<view class="dot dot1 animate-dot"></view>
					<view class="dot dot2 animate-dot"></view>
					<view class="dot dot3 animate-dot"></view>
					<view class="dot dot4 animate-dot"></view>
					<view class="circle-line"></view>
				</view>
			</view>
			
			<!-- 文字提示 -->
			<view class="text-area">
				<text class="title">稍等片刻......</text>
				<text class="subtitle">AI 提示词马上出炉</text>
			</view>
		</view>
		
		<!-- 取消按钮 -->
		<button class="cancel-btn" @tap="handleCancel">取消</button>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	onLoad() {
		// 模拟加载过程
		setTimeout(() => {
			uni.navigateTo({
				url: '/pages/prompt/success'
			});
		}, 2000);  // 2秒后跳转
	},
	methods: {
		handleCancel() {
			uni.navigateBack();
		}
	}
});
</script>

<style>
.container {
	min-height: 100vh;
	background-color: #fff;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 0 40rpx;
}

.loading-area {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.dynamic-logo {
	width: 300rpx;
	height: 300rpx;
	position: relative;
	margin-bottom: 80rpx;
}

.orbit {
	width: 100%;
	height: 100%;
	position: relative;
	animation: orbit-rotate 8s linear infinite;
}

.circle-line {
	position: absolute;
	width: 100%;
	height: 100%;
	border: 4rpx solid #000;
	border-radius: 50%;
	top: 0;
	left: 0;
	animation: pulse 2s ease-in-out infinite;
}

.dot {
	position: absolute;
	width: 24rpx;
	height: 24rpx;
	background-color: #000;
	border-radius: 50%;
}

.dot1 { top: 0; left: 50%; transform: translateX(-50%); }
.dot2 { right: 0; top: 50%; transform: translateY(-50%); }
.dot3 { bottom: 0; left: 50%; transform: translateX(-50%); }
.dot4 { left: 0; top: 50%; transform: translateY(-50%); }

.animate-dot {
	animation: dot-pulse 2s ease-in-out infinite;
}

.text-area {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16rpx;
}

.title {
	font-size: 36rpx;
	color: #333;
	font-weight: 500;
}

.subtitle {
	font-size: 28rpx;
	color: #666;
}

.cancel-btn {
	position: fixed;
	bottom: 40rpx;
	left: 40rpx;
	right: 40rpx;
	height: 100rpx;
	background: #333;
	color: #fff;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
}

button::after {
	border: none;
}

@keyframes orbit-rotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

@keyframes dot-pulse {
	0% {
		transform: scale(1);
		opacity: 0.8;
	}
	50% {
		transform: scale(1.5);
		opacity: 1;
	}
	100% {
		transform: scale(1);
		opacity: 0.8;
	}
}

@keyframes pulse {
	0% {
		transform: scale(1);
		opacity: 0.5;
	}
	50% {
		transform: scale(1.1);
		opacity: 1;
	}
	100% {
		transform: scale(1);
		opacity: 0.5;
	}
}

/* 让每个点的动画有不同的延迟，创造波浪效果 */
.dot1 { animation-delay: 0s; }
.dot2 { animation-delay: 0.5s; }
.dot3 { animation-delay: 1s; }
.dot4 { animation-delay: 1.5s; }
</style> 