<template>
	<view class="container">
		<view class="header">
			<text class="title">选择评分维度</text>
		</view>

		<view class="dimensions-list">
			<view v-for="(dimension, index) in selectedDimensions" :key="index" class="dimension-item">
				<text class="dimension-name">{{ dimension.keyword }}</text>
				<text class="dimension-score">{{ dimension.score }}分</text>
			</view>
		</view>

		<button class="confirm-btn" @tap="handleConfirm">确认</button>
	</view>
</template>

<script lang="ts">
import { request } from '@/utils/request';
import Vue from 'vue';

interface Dimension {
	keyword: string;
	score: number;
}

export default Vue.extend({
	data() {
		return {
			promptText: '',
			selectedDimensions: [] as Dimension[]
		}
	},
	onLoad() {
		// 获取保存的提示词
		const prompt = uni.getStorageSync('generatedPrompt');
		if (prompt) {
			this.promptText = prompt;
			// 初始化默认维度
			this.selectedDimensions = [
				{ keyword: '语言表达', score: 40 },
				{ keyword: '专业知识', score: 35 },
				{ keyword: '应变能力', score: 25 }
			];
		} else {
			// 如果没有提示词，返回上一页
			uni.showToast({
				title: '未获取到提示词',
				icon: 'none'
			});
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);
		}
	},
	methods: {
		async handleConfirm() {
			// 检查是否有维度
			if (this.selectedDimensions.length === 0) {
				uni.showToast({
					title: '请至少选择一个评分维度',
					icon: 'none'
				});
				return;
			}

			try {
				// 将提示词和选择的维度一起传递到评分页面
				uni.setStorageSync('evaluationData', {
					promptText: this.promptText,
					dimensions: this.selectedDimensions
				});



				uni.redirectTo({
					url: '/pages/evaluation/index'
				});

				// 清理不再需要的数据
				uni.removeStorageSync('agentFormData');
				uni.removeStorageSync('generatedPrompt');
			} catch (error) {
				uni.showToast({
					title: '操作失败，请重试',
					icon: 'none'
				});
				console.error('Error in handleConfirm:', error);
			}
		}
	}
});
</script>

<style>
.container {
	min-height: 100vh;
	background-color: #fff;
	padding: 40rpx;
}

.header {
	margin-bottom: 40rpx;
}

.title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.dimensions-list {
	margin-bottom: 60rpx;
}

.dimension-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	background: #f8f8f8;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
}

.dimension-name {
	font-size: 28rpx;
	color: #333;
}

.dimension-score {
	font-size: 28rpx;
	color: #666;
}

.confirm-btn {
	width: 100%;
	height: 100rpx;
	background: #333;
	color: #fff;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	margin-top: auto;
}
</style>