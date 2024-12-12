<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="header">
			<text class="title">完成培训</text>
			<text class="subtitle">AI导师正在评分</text>
		</view>

		<!-- 评分状态 -->
		<view class="score-status">
			<view class="loading-spinner"></view>
			<text class="status-text">评分中...</text>
		</view>

		<!-- 评分区域 -->
		<view class="score-tabs">
			<view 
				v-for="(tab, index) in tabs" 
				:key="index"
				class="tab-item"
				:class="{ active: currentTab === index }"
				@tap="handleTabChange(index)"
			>
				<text class="tab-text">{{ tab }}</text>
			</view>
		</view>

		<!-- 内容区域 -->
		<swiper class="content-swiper" :current="currentTab" @change="handleSwiperChange">
			<!-- 综合评价 -->
			<swiper-item>
				<scroll-view scroll-y class="scroll-content">
					<view class="score-section">
						<view class="section-header">
							<image class="ai-avatar" src="/static/images/ai-avatar.png" mode="aspectFit" />
							<text class="ai-label">AI点评：</text>
						</view>
						<view class="section-content loading">
							<text class="loading-text">点评中...</text>
						</view>
					</view>

					<view class="score-section">
						<view class="section-header">
							<image class="chart-icon" src="/static/images/chart.png" mode="aspectFit" />
							<text class="section-label">能力分析：</text>
						</view>
						<view class="section-content loading">
							<text class="loading-text">分析中...</text>
						</view>
					</view>

					<view class="score-section">
						<view class="section-header">
							<image class="list-icon" src="/static/images/list.png" mode="aspectFit" />
							<text class="section-label">得分明细：</text>
						</view>
						<view class="section-content loading">
							<text class="loading-text">统计中...</text>
						</view>
					</view>
				</scroll-view>
			</swiper-item>

			<!-- 关键话术 -->
			<swiper-item>
				<scroll-view scroll-y class="scroll-content">
					<view class="keywords-loading">
						<text class="loading-text">分析关键话术中...</text>
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

export default Vue.extend({
	data() {
		return {
			currentTab: 0,
			tabs: ['综合评价', '关键话术', '对话记录']
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

.score-status {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 60rpx 0;
}

.loading-spinner {
	width: 80rpx;
	height: 80rpx;
	border: 4rpx solid #f3f3f3;
	border-top: 4rpx solid #333;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin-bottom: 20rpx;
}

.status-text {
	font-size: 28rpx;
	color: #666;
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

.ai-avatar, .chart-icon, .list-icon {
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
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

/* 适配暗黑模式 */
@media (prefers-color-scheme: dark) {
	.container {
		background: #1c1c1e;
	}

	.title {
		color: #fff;
	}

	.subtitle, .tab-text {
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
</style> 