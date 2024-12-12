<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="header">
			<view class="back-btn" @tap="handleBack">
				<text class="back-icon">←</text>
			</view>
			<text class="title">成绩单</text>
		</view>

		<!-- 统计卡片 -->
		<view class="stats-card">
			<view class="stat-item">
				<text class="stat-value">{{ records.length }}</text>
				<text class="stat-label">总对话数</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item">
				<text class="stat-value">{{ averageScore }}分</text>
				<text class="stat-label">平均分数</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item">
				<text class="stat-value">{{ highestScore }}分</text>
				<text class="stat-label">最高分数</text>
			</view>
		</view>

		<!-- 记录列表 -->
		<scroll-view scroll-y class="records-list" v-if="records.length > 0">
			<view 
				v-for="(record, index) in records" 
				:key="index"
				class="record-item"
				@tap="handleRecordClick(record)"
			>
				<view class="record-header">
					<view class="scene-info">
						<text class="scene-name">{{ record.sceneName }}</text>
						<text class="record-time">{{ formatTime(record.createTime) }}</text>
					</view>
					<view class="score-badge">
						<text class="score-value">{{ record.totalScore }}分</text>
					</view>
				</view>

				<view class="dimension-scores">
					<view 
						v-for="(score, scoreIndex) in record.dimensionScores" 
						:key="scoreIndex"
						class="dimension-item"
					>
						<text class="dimension-name">{{ score.name }}</text>
						<view class="score-bar">
							<view 
								class="score-progress"
								:style="{ width: `${score.score}%` }"
							></view>
						</view>
						<text class="dimension-score">{{ score.score }}分</text>
					</view>
				</view>

				<view class="record-footer">
					<view class="tag">
						<text class="tag-icon">💬</text>
						<text class="tag-text">{{ record.messageCount }}条对话</text>
					</view>
					<text class="view-detail">查看详情 ></text>
				</view>
			</view>
		</scroll-view>

		<!-- 空状态 -->
		<view class="empty-state" v-else>
			<image class="empty-icon" src="/static/images/empty-records.png" mode="aspectFit" />
			<text class="empty-text">暂无对话记录</text>
			<text class="empty-subtext">开始练习，提升你的销售技能</text>
		</view>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';

interface DimensionScore {
	name: string;
	score: number;
}

interface Record {
	id: string;
	sceneName: string;
	createTime: number;
	totalScore: number;
	dimensionScores: DimensionScore[];
	messageCount: number;
}

export default Vue.extend({
	data() {
		return {
			records: [] as Record[]
		}
	},
	computed: {
		averageScore(): number {
			if (this.records.length === 0) return 0;
			const total = this.records.reduce((sum: number, record: Record) => sum + record.totalScore, 0);
			return Math.round(total / this.records.length);
		},
		highestScore(): number {
			if (this.records.length === 0) return 0;
			return Math.max(...this.records.map((record: Record) => record.totalScore));
		}
	},
	methods: {
		handleBack() {
			uni.navigateBack();
		},
		loadRecords() {
			const records = uni.getStorageSync('chatRecords') || [];
			this.records = records;
		},
		formatTime(timestamp: number): string {
			const date = new Date(timestamp);
			return date.toLocaleString();
		},
		handleRecordClick(record: Record) {
			uni.navigateTo({
				url: `/pages/score/index?id=${record.id}`
			});
		}
	},
	onShow() {
		this.loadRecords();
	}
});
</script>

<style>
.container {
	min-height: 100vh;
	background: #f8f8f8;
	padding-bottom: 40rpx;
}

.header {
	padding: 88rpx 40rpx 20rpx;
	background: #fff;
	display: flex;
	align-items: center;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.back-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
}

.back-icon {
	font-size: 40rpx;
	color: #333;
}

.title {
	flex: 1;
	text-align: center;
	font-size: 36rpx;
	font-weight: 600;
	color: #333;
	margin-right: 60rpx;
}

.stats-card {
	margin: 30rpx;
	background: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	display: flex;
	justify-content: space-around;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.stat-value {
	font-size: 40rpx;
	font-weight: bold;
	color: #333;
}

.stat-label {
	font-size: 24rpx;
	color: #999;
	margin-top: 8rpx;
}

.stat-divider {
	width: 2rpx;
	background: #eee;
}

.records-list {
	padding: 0 30rpx;
}

.record-item {
	background: #fff;
	border-radius: 20rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
}

.record-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 20rpx;
}

.scene-name {
	font-size: 32rpx;
	font-weight: 500;
	color: #333;
}

.record-time {
	font-size: 24rpx;
	color: #999;
	margin-top: 4rpx;
}

.score-badge {
	background: #333;
	border-radius: 30rpx;
	padding: 8rpx 20rpx;
}

.score-value {
	font-size: 28rpx;
	color: #fff;
	font-weight: 500;
}

.dimension-scores {
	margin: 20rpx 0;
}

.dimension-item {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
}

.dimension-name {
	width: 160rpx;
	font-size: 26rpx;
	color: #666;
}

.score-bar {
	flex: 1;
	height: 12rpx;
	background: #f0f0f0;
	border-radius: 6rpx;
	margin: 0 20rpx;
	overflow: hidden;
}

.score-progress {
	height: 100%;
	background: #333;
	border-radius: 6rpx;
	transition: width 0.3s ease;
}

.dimension-score {
	font-size: 26rpx;
	color: #333;
	width: 60rpx;
	text-align: right;
}

.record-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 20rpx;
	padding-top: 20rpx;
	border-top: 2rpx solid #f5f5f5;
}

.tag {
	display: flex;
	align-items: center;
	gap: 6rpx;
}

.tag-icon {
	font-size: 24rpx;
}

.tag-text {
	font-size: 24rpx;
	color: #999;
}

.view-detail {
	font-size: 24rpx;
	color: #666;
}

.empty-state {
	padding-top: 200rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.empty-icon {
	width: 200rpx;
	height: 200rpx;
	margin-bottom: 40rpx;
}

.empty-text {
	font-size: 32rpx;
	color: #333;
	margin-bottom: 12rpx;
}

.empty-subtext {
	font-size: 26rpx;
	color: #999;
}
</style> 