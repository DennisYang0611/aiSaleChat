<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="header">
			<view class="user-btn" @tap="handleUserInfo">
				<default-avatar></default-avatar>
			</view>
			<view class="logo-area">
				<view class="logo">
					<view class="logo-ring outer">
						<view class="dot"></view>
					</view>
					<view class="logo-ring inner">
						<view class="dot"></view>
					</view>
					<view class="center-dot"></view>
					<view class="pulse-ring"></view>
				</view>
			</view>
			<view class="add-btn" @tap="handleAdd">
				<text class="add-icon">＋</text>
			</view>
		</view>

		<!-- 标题 -->
		<view class="title-area">
			<text class="title">选择你的训练</text>
		</view>

		<!-- 训练列表 -->
		<view class="training-list">
			<view class="training-item" 
				v-for="(item, index) in trainingList" 
				:key="index"
				@tap="handleStart(item)"
			>
				<view class="item-left">
					<view class="avatar">
						<default-avatar></default-avatar>
					</view>
					<text class="number">{{item.number}}</text>
				</view>
				<view class="item-right">
					<view class="action-btn" @tap="handleEdit(item)">
						<text class="icon">✎</text>
					</view>
					<view class="action-btn" @tap="handleDelete(item)">
						<text class="icon delete-icon">🗑</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部创建按钮 -->
		<view class="bottom-area" @tap="handleAdd">
			<text class="bottom-text">创建新的 Agent</text>
		</view>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';
import DefaultAvatar from '@/components/DefaultAvatar.vue';

export default Vue.extend({
	components: {
		DefaultAvatar
	},
	data() {
		return {
			trainingList: [
				{ id: 1, number: '1' },
				{ id: 2, number: '1' },
				{ id: 3, number: '1' },
				{ id: 4, number: '123' }
			]
		}
	},
	methods: {
		handleAdd() {
			uni.navigateTo({
				url: '/pages/agent/create'
			});
		},
		handleEdit(item: any) {
			uni.navigateTo({
				url: `/pages/training/edit?id=${item.id}`
			});
		},
		handleDelete(item: any) {
			uni.showModal({
				title: '提示',
				content: '确定要删除这个训练吗？',
				success: (res) => {
					if (res.confirm) {
						this.trainingList = this.trainingList.filter(i => i.id !== item.id);
					}
				}
			});
		},
		handleStart(item: any) {
			uni.navigateTo({
				url: `/pages/chat/index?id=${item.id}`
			});
		},
		handleUserInfo() {
			uni.navigateTo({
				url: '/pages/user/info'
			});
		}
	}
});
</script>

<style>
.container {
	min-height: 100vh;
	background-color: #fff;
	padding: 0 24rpx;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 40rpx 0;
}

.logo-area {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 80rpx;
	height: 80rpx;
}

.logo {
	width: 100%;
	height: 100%;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.logo-ring {
	position: absolute;
	border: 4rpx solid #333;
	border-radius: 50%;
	animation: rotate 8s linear infinite;
}

.logo-ring.outer {
	width: 100%;
	height: 100%;
	animation-direction: normal;
}

.logo-ring.inner {
	width: 60%;
	height: 60%;
	animation-direction: reverse;
	animation-duration: 6s;
}

.logo-ring .dot {
	position: absolute;
	width: 12rpx;
	height: 12rpx;
	background: #333;
	border-radius: 50%;
	top: -6rpx;
	left: 50%;
	transform: translateX(-50%);
}

.center-dot {
	width: 16rpx;
	height: 16rpx;
	background: #333;
	border-radius: 50%;
	position: relative;
	z-index: 2;
}

.pulse-ring {
	position: absolute;
	width: 100%;
	height: 100%;
	border: 4rpx solid #333;
	border-radius: 50%;
	opacity: 0;
	animation: pulse 2s ease-out infinite;
}

.add-btn {
	width: 50rpx;
	height: 50rpx;
	background-color: #fff;
	border-radius: 25rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
	cursor: pointer;
}

.add-icon {
	font-size: 40rpx;
	color: #333;
	font-weight: bold;
}

.title-area {
	margin: 40rpx 0;
}

.title {
	font-size: 48rpx;
	font-weight: bold;
	color: #333;
}

.training-list {
	margin-top: 20rpx;
	padding: 0 20rpx;
}

.training-item {
	background-color: #F8F8F8;
	border-radius: 20rpx;
	padding: 40rpx;
	margin-bottom: 20rpx;
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	height: 160rpx;
	position: relative;
}

.item-left {
	display: flex;
	align-items: center;
	gap: 24rpx;
	flex: 1;
	position: absolute;
	top: 40rpx;
	left: 40rpx;
}

.avatar {
	width: 88rpx;
	height: 88rpx;
	border-radius: 44rpx;
	overflow: hidden;
	background-color: #F0F3FF;
}

.number {
	font-size: 32rpx;
	color: #333;
	font-weight: 500;
}

.item-right {
	display: flex;
	gap: 16rpx;
	margin-left: 40rpx;
	position: absolute;
	top: 40rpx;
	right: 40rpx;
}

.action-btn {
	width: 64rpx;
	height: 64rpx;
	border-radius: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #fff;
	box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
}

.icon {
	font-size: 32rpx;
	color: #666;
}

.delete-icon {
	color: #FF3B30;
}

.bottom-area {
	position: fixed;
	bottom: 50rpx;
	left: 0;
	right: 0;
	text-align: center;
	cursor: pointer;
}

.bottom-text {
	font-size: 34rpx;
	color: #333;
	font-weight: 600;
}

@keyframes rotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

@keyframes pulse {
	0% {
		transform: scale(0.8);
		opacity: 0.8;
	}
	100% {
		transform: scale(1.5);
		opacity: 0;
	}
}

.user-btn {
	width: 60rpx;
	height: 60rpx;
	border-radius: 30rpx;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
