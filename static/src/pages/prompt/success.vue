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
				<text class="subtitle">文本框</text>
			</view>
			
			<!-- 确认按钮 -->
			<button class="confirm-btn" @tap="handleConfirm">确认</button>
		</view>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	methods: {
		handleClose() {
			uni.reLaunch({
				url: '/pages/evaluation/index'
			});
		},
		handleConfirm() {
			uni.reLaunch({
				url: '/pages/evaluation/index'
			});
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
	padding: 0 40rpx;
}

.modal-content {
	width: 100%;
	background-color: #fff;
	border-radius: 24rpx;
	padding: 60rpx 40rpx;
	position: relative;
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
	width: 300rpx;
	height: 300rpx;
	margin: 0 auto 40rpx;
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
	margin-bottom: 60rpx;
}

.title {
	font-size: 36rpx;
	color: #333;
	font-weight: bold;
}

.subtitle {
	font-size: 28rpx;
	color: #666;
	padding: 20rpx;
	background-color: #F8F8F8;
	border-radius: 12rpx;
	width: 100%;
	text-align: center;
}

.confirm-btn {
	width: 100%;
	height: 100rpx;
	background: #333;
	border-radius: 16rpx;
	color: #fff;
	font-size: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

button::after {
	border: none;
}

/* 小屏幕适配 (< 375px) */
@media screen and (max-width: 375px) {
  .modal-content {
    padding: 40rpx 30rpx;
  }

  .success-icon {
    width: 240rpx;
    height: 240rpx;
  }

  .title {
    font-size: 32rpx;
  }

  .subtitle {
    font-size: 24rpx;
  }

  .confirm-btn {
    height: 90rpx;
    font-size: 28rpx;
  }
}

/* 平板适配 (768px - 1024px) */
@media screen and (min-width: 768px) {
  .modal-content {
    max-width: 800rpx;
    margin: 0 auto;
  }

  .success-icon {
    width: 400rpx;
    height: 400rpx;
  }

  .title {
    font-size: 44rpx;
  }

  .subtitle {
    font-size: 32rpx;
    padding: 30rpx;
  }

  .confirm-btn {
    width: 400rpx;
    height: 120rpx;
    font-size: 36rpx;
    margin: 0 auto;
  }
}

/* 大屏桌面适配 */
@media screen and (min-width: 1024px) {
  .modal-content {
    max-width: 1000rpx;
  }

  .success-icon {
    width: 500rpx;
    height: 500rpx;
  }
}
</style> 