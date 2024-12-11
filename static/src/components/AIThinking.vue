<template>
	<view class="thinking-mask" v-if="visible">
		<view class="thinking-content">
			<!-- AI大脑动画 -->
			<view class="brain-animation">
				<view class="neural-network">
					<view class="node n1"></view>
					<view class="node n2"></view>
					<view class="node n3"></view>
					<view class="node n4"></view>
					<view class="node n5"></view>
					<view class="node n6"></view>
					<view class="connection c1"></view>
					<view class="connection c2"></view>
					<view class="connection c3"></view>
					<view class="connection c4"></view>
					<view class="connection c5"></view>
				</view>
			</view>
			
			<!-- 文字动画 -->
			<view class="thinking-text">
				<text>AI正在思考中</text>
				<view class="dots">
					<text class="dot">.</text>
					<text class="dot">.</text>
					<text class="dot">.</text>
				</view>
			</view>
		</view>
		
		<button class="cancel-btn" @tap="handleCancel">取消生成</button>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	name: 'AIThinking',
	props: {
		visible: {
			type: Boolean,
			default: false
		}
	},
	methods: {
		handleCancel() {
			this.$emit('cancel');
		}
	}
});
</script>

<style>
.thinking-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(255, 255, 255, 0.98);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
}

.thinking-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 40rpx;
}

.brain-animation {
	width: 300rpx;
	height: 300rpx;
	position: relative;
}

.neural-network {
	width: 100%;
	height: 100%;
	position: relative;
}

.node {
	position: absolute;
	width: 20rpx;
	height: 20rpx;
	background: #333;
	border-radius: 50%;
	animation: pulse 2s ease-in-out infinite;
}

.n1 { top: 20%; left: 20%; animation-delay: 0s; }
.n2 { top: 20%; right: 20%; animation-delay: 0.4s; }
.n3 { top: 50%; left: 10%; animation-delay: 0.8s; }
.n4 { top: 50%; right: 10%; animation-delay: 1.2s; }
.n5 { bottom: 20%; left: 30%; animation-delay: 1.6s; }
.n6 { bottom: 20%; right: 30%; animation-delay: 2s; }

.connection {
	position: absolute;
	height: 4rpx;
	background: #333;
	opacity: 0.3;
	animation: glow 2s ease-in-out infinite;
}

.c1 { width: 60%; top: 25%; left: 20%; transform: rotate(0deg); animation-delay: 0.2s; }
.c2 { width: 40%; top: 40%; left: 15%; transform: rotate(45deg); animation-delay: 0.6s; }
.c3 { width: 50%; top: 60%; right: 15%; transform: rotate(-45deg); animation-delay: 1s; }
.c4 { width: 45%; bottom: 25%; left: 30%; transform: rotate(0deg); animation-delay: 1.4s; }
.c5 { width: 40%; bottom: 35%; right: 25%; transform: rotate(45deg); animation-delay: 1.8s; }

.thinking-text {
	display: flex;
	align-items: center;
	gap: 8rpx;
	font-size: 32rpx;
	color: #333;
}

.dots {
	display: flex;
}

.dot {
	animation: dotFade 1.5s ease-in-out infinite;
	opacity: 0;
}

.dot:nth-child(1) { animation-delay: 0s; }
.dot:nth-child(2) { animation-delay: 0.5s; }
.dot:nth-child(3) { animation-delay: 1s; }

@keyframes pulse {
	0% {
		transform: scale(1);
		opacity: 0.5;
	}
	50% {
		transform: scale(1.5);
		opacity: 1;
	}
	100% {
		transform: scale(1);
		opacity: 0.5;
	}
}

@keyframes glow {
	0% {
		opacity: 0.2;
	}
	50% {
		opacity: 0.8;
	}
	100% {
		opacity: 0.2;
	}
}

@keyframes dotFade {
	0% { opacity: 0; }
	50% { opacity: 1; }
	100% { opacity: 0; }
}

.cancel-btn {
	position: fixed;
	bottom: 40rpx;
	left: 40rpx;
	right: 40rpx;
	height: 100rpx;
	background: #333;
	border-radius: 16rpx;
	color: #fff;
	font-size: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0.9;
}
</style> 