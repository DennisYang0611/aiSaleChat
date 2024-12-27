<template>
	<view class="container">
		<!-- 动态背景 -->
		<view class="background">
			<view class="circle-container" v-for="n in 10" :key="n">
				<view class="circle"></view>
			</view>
		</view>

		<!-- Logo区域 -->
		<view class="logo-container">
			<view class="logo">
				<view class="orbit outer">
					<view class="satellite"></view>
				</view>
				<view class="orbit inner">
					<view class="satellite"></view>
				</view>
				<view class="core"></view>
			</view>
		</view>

		<!-- 文字区域 -->
		<view class="text-container">
			<text class="title">AI Sales Training</text>
			<text class="subtitle">智能销售对练系统</text>
			<text class="description">让每一次练习都更有价值</text>
		</view>

		<!-- 开始按钮 -->
		<view class="button-container">
			<button class="start-button" @tap="handleStart">
				<text class="button-text">开始使用</text>
				<text class="button-icon">→</text>
			</button>
		</view>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	methods: {
		handleStart() {
			uni.navigateTo({
				url: '/pages/login/index'
			});
		}
	}
});
</script>

<style>
.container {
	min-height: 100vh;
	background: linear-gradient(135deg, #1a1a1a 0%, #373737 100%);
	position: relative;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
}

/* 动态背景 */
.background {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1;
}

.circle-container {
	position: absolute;
	transform: translateY(-50%);
}

.circle-container:nth-child(1) { left: 10%; top: 20%; }
.circle-container:nth-child(2) { left: 80%; top: 40%; }
.circle-container:nth-child(3) { left: 20%; top: 70%; }
.circle-container:nth-child(4) { left: 70%; top: 90%; }
.circle-container:nth-child(5) { left: 30%; top: 30%; }
.circle-container:nth-child(6) { left: 90%; top: 60%; }
.circle-container:nth-child(7) { left: 40%; top: 80%; }
.circle-container:nth-child(8) { left: 60%; top: 20%; }
.circle-container:nth-child(9) { left: 50%; top: 50%; }
.circle-container:nth-child(10) { left: 85%; top: 30%; }

.circle {
	width: 20rpx;
	height: 20rpx;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 50%;
	animation: float 6s infinite;
}

.circle-container:nth-child(even) .circle {
	animation-duration: 8s;
	animation-delay: -2s;
}

/* Logo样式 */
.logo-container {
	position: relative;
	z-index: 2;
	width: 300rpx;
	height: 300rpx;
	margin-bottom: 80rpx;
}

.logo {
	width: 100%;
	height: 100%;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.orbit {
	position: absolute;
	border: 2rpx solid rgba(255, 255, 255, 0.2);
	border-radius: 50%;
	animation: rotate 8s linear infinite;
}

.orbit.outer {
	width: 100%;
	height: 100%;
}

.orbit.inner {
	width: 60%;
	height: 60%;
	animation-direction: reverse;
	animation-duration: 6s;
}

.satellite {
	position: absolute;
	width: 16rpx;
	height: 16rpx;
	background: #fff;
	border-radius: 50%;
	top: -8rpx;
	left: 50%;
	transform: translateX(-50%);
	box-shadow: 0 0 20rpx #fff;
}

.core {
	width: 60rpx;
	height: 60rpx;
	background: #fff;
	border-radius: 50%;
	position: relative;
	animation: pulse 2s ease-in-out infinite;
}

/* 文字样式 */
.text-container {
	position: relative;
	z-index: 2;
	text-align: center;
	margin-bottom: 100rpx;
}

.title {
	font-size: 64rpx;
	color: #fff;
	font-weight: bold;
	margin-bottom: 20rpx;
	display: block;
	text-shadow: 0 0 20rpx rgba(255, 255, 255, 0.3);
}

.subtitle {
	font-size: 48rpx;
	color: rgba(255, 255, 255, 0.9);
	margin-bottom: 20rpx;
	display: block;
}

.description {
	font-size: 32rpx;
	color: rgba(255, 255, 255, 0.7);
	display: block;
}

/* 按钮样式 */
.button-container {
	position: relative;
	z-index: 2;
	width: 100%;
	max-width: 600rpx;
}

.start-button {
	width: 100%;
	height: 100rpx;
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(10px);
	border-radius: 50rpx;
	border: 2rpx solid rgba(255, 255, 255, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 20rpx;
	transition: all 0.3s ease;
}

.start-button:active {
	transform: scale(0.98);
	background: rgba(255, 255, 255, 0.15);
}

.button-text {
	color: #fff;
	font-size: 32rpx;
}

.button-icon {
	color: #fff;
	font-size: 32rpx;
}

/* 动画 */
@keyframes float {
	0%, 100% {
		transform: translateY(0) scale(1);
		opacity: 0.5;
	}
	50% {
		transform: translateY(-20rpx) scale(1.2);
		opacity: 1;
	}
}

@keyframes rotate {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

@keyframes pulse {
	0% {
		transform: scale(1);
		opacity: 0.8;
	}
	50% {
		transform: scale(1.1);
		opacity: 1;
	}
	100% {
		transform: scale(1);
		opacity: 0.8;
	}
}

/* 响应式适配 */
@media screen and (max-width: 375px) {
	.title {
		font-size: 48rpx;
	}
	
	.subtitle {
		font-size: 36rpx;
	}
	
	.description {
		font-size: 28rpx;
	}
}

@media screen and (min-width: 768px) {
	.logo-container {
		width: 400rpx;
		height: 400rpx;
	}
	
	.title {
		font-size: 80rpx;
	}
	
	.subtitle {
		font-size: 60rpx;
	}
	
	.description {
		font-size: 40rpx;
	}
	
	.start-button {
		height: 120rpx;
		font-size: 40rpx;
	}
}
</style>