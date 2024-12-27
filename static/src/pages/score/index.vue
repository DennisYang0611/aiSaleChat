<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="header">
			<text class="title">完成培训</text>
			<text class="subtitle">AI导师评分结果</text>
		</view>

		<!-- 总分展示 -->
		<view class="score-display">
			<view class="score-circle">
				<text class="score-number">{{ scoreData.score }}</text>
				<text class="score-label">总分</text>
			</view>
		</view>

		<!-- 评分区域 -->
		<view class="score-tabs">
			<view v-for="(tab, index) in tabs" :key="index" class="tab-item" :class="{ active: currentTab === index }"
				@tap="handleTabChange(index)">
				<text class="tab-text">{{ tab }}</text>
			</view>
		</view>

		<!-- 内容区域 -->
		<swiper class="content-swiper" :current="currentTab" @change="handleSwiperChange">
			<!-- 综合评价 -->
			<swiper-item>
				<scroll-view scroll-y class="scroll-content">
					<view class="analysis-grid">
						<!-- 优势分析 -->
						<view class="analysis-card">
							<view class="card-header">
								<view class="header-icon advantage">
									<text class="icon">✓</text>
								</view>
								<text class="header-title">优势分析</text>
							</view>
							<view class="card-content">
								<text class="content-text">{{ trainingRecord.ratings.advantage }}</text>
							</view>
						</view>

						<!-- 不足之处 -->
						<view class="analysis-card">
							<view class="card-header">
								<view class="header-icon insufficient">
									<text class="icon">!</text>
								</view>
								<text class="header-title">不足之处</text>
							</view>
							<view class="card-content">
								<text class="content-text">{{ scoreData.insufficient }}</text>
							</view>
						</view>

						<!-- 改进建议 -->
						<view class="analysis-card">
							<view class="card-header">
								<view class="header-icon suggestion">
									<text class="icon">↗</text>
								</view>
								<text class="header-title">改进建议</text>
							</view>
							<view class="card-content">
								<text class="content-text">{{ scoreData.suggestion }}</text>
							</view>
						</view>
					</view>
				</scroll-view>
			</swiper-item>

			<!-- 对话记录 -->
			<swiper-item>
				<scroll-view scroll-y class="scroll-content">
					<view class="chat-loading">
						<text class="loading-text">加载对话记录中...</text>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>

		<!-- 底部按钮 -->
		<view class="footer">
			<button class="btn btn-retry" @tap="handleRetry">重新练习</button>
			<button class="btn btn-back" @tap="handleBack">返回首页</button>
		</view>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';
import { request } from '@/utils/request';

interface ScoreData {
	score: number;
	advantage: string;
	insufficient: string;
	suggestion: string;
}

interface TrainingRecord {
	id: string;
	agentId: string;
	userId: string;
	messages: Array<{
		role: string;
		content: string;
	}>;
	ratings: {
		advantage: string;
		insufficient: string;
		suggestion: string;
		score: any;
	};
	createdAt: string;
	updatedAt: string;
}

interface TrainingRecordListResponse {
	code: number;
	message: string;
	data: TrainingRecord;
}

export default Vue.extend({
	data() {
		return {
			currentTab: 0,
			tabs: ['综合评价', '对话记录'],
			scoreData: {
				score: 0,
				advantage: '',
				insufficient: '',
				suggestion: ''
			} as ScoreData,
			isLoading: true,
			trainingRecord: {
				ratings: {
					advantage: '',
					insufficient: '',
					suggestion: '',
					score: {}
				}
			}
		}
	},
	async onLoad(options: any) {
		// 从页面参数中获取训练记录ID
		const trainingRecordId = options?.trainingRecordId;
		if (!trainingRecordId) {
			uni.showToast({
				title: '未找到训练记录ID',
				icon: 'none'
			});
			return;
		}

		// 获取训练记录
		try {
			const res = await request<TrainingRecordListResponse>({
				url: `/agent/trainingRecord/${trainingRecordId}`,
				method: 'GET',
			});

			if (res.code === 0) {
				// 获取最新的训练记录
				console.log(222, res.data);
				this.trainingRecord = res.data
			}
		} catch (error) {
			console.error('获取训练记录失败:', error);
			uni.showToast({
				title: '获取训练记录失败',
				icon: 'none'
			});
		}
	},
	methods: {
		handleTabChange(index: number) {
			this.currentTab = index;
		},
		handleSwiperChange(e: any) {
			this.currentTab = e.detail.current;
		},
		handleRetry() {
			// 重新练习逻辑
		},
		handleBack() {
			uni.reLaunch({
				url: '/pages/index/index'
			});
		},
		parseScoreResult(result: any) {
			// ... 解析评分结果的代码
		}
	}
});
</script>

<style>
.container {
	min-height: 100vh;
	background: #fff;
	display: flex;
	flex-direction: column;
}

.header {
	padding: 88rpx 40rpx 40rpx;
	text-align: center;
}

.title {
	font-size: 36rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 8rpx;
}

.subtitle {
	font-size: 28rpx;
	color: #666;
}

.score-display {
	display: flex;
	justify-content: center;
	padding: 40rpx 0;
}

.score-circle {
	width: 200rpx;
	height: 200rpx;
	border-radius: 50%;
	background: #333;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
}

.score-number {
	font-size: 64rpx;
	color: #fff;
	font-weight: bold;
}

.score-label {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.8);
	margin-top: 8rpx;
}

.content-text {
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
}

.score-tabs {
	display: flex;
	justify-content: space-around;
	padding: 0 40rpx;
	border-bottom: 1rpx solid #eee;
}

.tab-item {
	padding: 20rpx 0;
	position: relative;
}

.tab-text {
	font-size: 28rpx;
	color: #666;
}

.tab-item.active .tab-text {
	color: #333;
	font-weight: 500;
}

.tab-item.active::after {
	content: '';
	position: absolute;
	bottom: -2rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 40rpx;
	height: 4rpx;
	background: #333;
	border-radius: 2rpx;
}

.content-swiper {
	flex: 1;
	height: 0;
}

.scroll-content {
	height: 100%;
	padding: 40rpx;
}

.score-section {
	margin-bottom: 40rpx;
}

.section-header {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

.ai-avatar,
.chart-icon,
.list-icon {
	width: 48rpx;
	height: 48rpx;
	margin-right: 12rpx;
}

.section-label {
	font-size: 30rpx;
	font-weight: 500;
	color: #333;
}

.section-content {
	background: #f8f8f8;
	border-radius: 16rpx;
	padding: 30rpx;
	min-height: 160rpx;
}

.loading {
	display: flex;
	align-items: center;
	justify-content: center;
}

.loading-text {
	font-size: 28rpx;
	color: #999;
}

.footer {
	padding: 30rpx 40rpx;
	display: flex;
	gap: 20rpx;
}

.btn {
	flex: 1;
	height: 88rpx;
	border-radius: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
}

.btn-retry {
	background: #333;
	color: #fff;
}

.btn-back {
	background: #f8f8f8;
	color: #333;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

/* 适配暗黑模式 */
@media (prefers-color-scheme: dark) {
	.container {
		background: #1c1c1e;
	}

	.title {
		color: #fff;
	}

	.subtitle,
	.tab-text {
		color: #999;
	}

	.section-content {
		background: #2c2c2e;
	}

	.btn-retry {
		background: #fff;
		color: #333;
	}

	.btn-back {
		background: #2c2c2e;
		color: #fff;
	}
}

/* 分析网格布局 */
.analysis-grid {
	display: flex;
	gap: 20rpx;
	padding: 20rpx;
	overflow-x: auto;
	/* 在小屏幕上允许横向滚动 */
	-webkit-overflow-scrolling: touch;
}

/* 分析卡片 */
.analysis-card {
	flex: 1;
	min-width: 300rpx;
	/* 确保在小屏幕上有合适的宽度 */
	background: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	overflow: hidden;
}

/* 卡片头部 */
.card-header {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 20rpx;
	border-bottom: 2rpx solid #f5f5f5;
}

.header-icon {
	width: 48rpx;
	height: 48rpx;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.header-icon.advantage {
	background: #e8f5e9;
	color: #4caf50;
}

.header-icon.insufficient {
	background: #ffebee;
	color: #f44336;
}

.header-icon.suggestion {
	background: #e3f2fd;
	color: #2196f3;
}

.icon {
	font-size: 28rpx;
	font-weight: bold;
}

.header-title {
	font-size: 28rpx;
	font-weight: 500;
	color: #333;
}

/* 卡片内容 */
.card-content {
	padding: 20rpx;
	height: 300rpx;
	overflow-y: auto;
}

.content-text {
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
	.analysis-grid {
		padding: 16rpx;
		gap: 16rpx;
	}

	.analysis-card {
		min-width: 280rpx;
	}
}

/* 滚动条美化 */
.analysis-grid::-webkit-scrollbar {
	height: 6rpx;
}

.analysis-grid::-webkit-scrollbar-track {
	background: #f5f5f5;
}

.analysis-grid::-webkit-scrollbar-thumb {
	background: #ddd;
	border-radius: 3rpx;
}
</style>