<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="header">
			<view class="nav-left">
				<view class="user-avatar" @tap="handleUserInfo">
					<image 
						class="avatar-img" 
						:src="userAvatar || defaultAvatar" 
						mode="aspectFill"
					/>
				</view>
			</view>
			<view class="nav-center">
				<text class="title">销售对练</text>
				<text class="subtitle">好口才，练出来</text>
			</view>
			<view class="nav-right">
				<view class="create-btn" @tap="handleCreate">
					<text class="create-icon">+</text>
					<text class="create-text">新建</text>
				</view>
			</view>
		</view>

		<!-- 统计卡片 -->
		<view class="stats-card">
			<view class="stat-item">
				<text class="stat-value">{{ agents.length }}</text>
				<text class="stat-label">训练场景</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item">
				<text class="stat-value">0</text>
				<text class="stat-label">今日对话</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item">
				<text class="stat-value">0</text>
				<text class="stat-label">总对话数</text>
			</view>
		</view>

		<!-- Agent列表 -->
		<view class="agent-list" v-if="agents.length > 0">
			<view class="section-header">
				<text class="section-title">我的训练场景</text>
				<text class="section-subtitle">{{ agents.length }}个场景</text>
			</view>
			<view 
				v-for="(agent, index) in agents" 
				:key="index"
				class="agent-item"
			>
				<view class="agent-content">
					<view class="agent-header">
						<view class="agent-title-wrap">
							<text class="agent-title">训练场景 {{ index + 1 }}</text>
							<text class="agent-time">{{ formatTime(agent.createTime) }}</text>
						</view>
						<view class="action-btns">
							<view class="action-btn edit" @tap.stop="handleEdit(index)">
								<text class="action-icon">✎</text>
							</view>
							<view class="action-btn delete" @tap.stop="handleDelete(index)">
								<text class="action-icon">×</text>
							</view>
						</view>
					</view>
					<view 
						class="agent-prompt"
						@tap="handleAgentClick(index)"
					>{{ agent.prompt }}</view>
					<view class="dimension-tags">
						<view 
							v-for="(dim, dimIndex) in agent.dimensions" 
							:key="dimIndex"
							class="dimension-tag"
						>
							{{ dim.keyword }} {{ dim.score }}分
						</view>
					</view>
					<view class="agent-footer">
						<view class="stat-tags">
							<view class="stat-tag">
								<text class="stat-icon iconfont icon-message"></text>
								<text class="stat-text">0次对话</text>
							</view>
							<view class="stat-tag">
								<text class="stat-icon iconfont icon-star"></text>
								<text class="stat-text">0次评分</text>
							</view>
						</view>
						<view class="start-btn" @tap.stop="handleStart(index)">
							<text class="start-icon iconfont icon-play"></text>
							开始对话
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<view class="empty-state" v-else>
			<image class="empty-icon" src="/static/images/empty.png" mode="aspectFit"></image>
			<text class="empty-text">还没有创建Agent</text>
			<text class="empty-subtext">点击右上角按钮开始创建</text>
		</view>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';

interface Dimension {
	keyword: string;
	score: number;
}

interface Agent {
	prompt: string;
	dimensions: Dimension[];
	createTime: number;
	description?: string;
}

export default Vue.extend({
	data() {
		return {
			agents: [] as Agent[],
			userAvatar: ''
		}
	},
	computed: {
		defaultAvatar(): string {
			return `data:image/svg+xml,${encodeURIComponent(`
				<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="80" height="80" fill="#E5E7EB"/>
					<path d="M40 36C44.4183 36 48 32.4183 48 28C48 23.5817 44.4183 20 40 20C35.5817 20 32 23.5817 32 28C32 32.4183 35.5817 36 40 36Z" fill="#9CA3AF"/>
					<path d="M40 40C31.7157 40 25 46.7157 25 55V56C25 57.1046 25.8954 58 27 58H53C54.1046 58 55 57.1046 55 56V55C55 46.7157 48.2843 40 40 40Z" fill="#9CA3AF"/>
				</svg>
			`)}`;
		}
	},
	onShow() {
		// 每次显示页面时重新获取数据
		this.loadAgents();
	},
	methods: {
		async loadAgents() {
			const agents = uni.getStorageSync('agents') || [];
			this.agents = agents;
		},

		handleCreate() {
			uni.navigateTo({
				url: '/pages/agent/create'
			});
		},
		handleAgentClick(index: number) {
			// 可以跳转到详情页或开始对话
			console.log('点击了Agent:', this.agents[index]);
		},
		formatTime(timestamp: number): string {
			const date = new Date(timestamp);
			return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
		},
		handleEdit(index: number) {
			const agent = this.agents[index];
			// 存储当前编辑的 agent 数据
			uni.setStorageSync('currentEditAgent', {
				index,
				data: agent
			});
			uni.navigateTo({
				url: '/pages/training/edit'
			});
		},
		handleDelete(index: number) {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除这个 Agent 吗？',
				success: (res) => {
					if (res.confirm) {
						const agents = [...this.agents];
						agents.splice(index, 1);
						uni.setStorageSync('agents', agents);
						this.agents = agents;
						
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
					}
				}
			});
		},
		handleUserInfo() {
			uni.navigateTo({
				url: '/pages/user/info'
			});
		},
		handleStart(index: number) {
			const agent = this.agents[index];
			// 存储当前对话的 agent 数据
			uni.setStorageSync('currentChatAgent', agent);
			
			uni.navigateTo({
				url: '/pages/chat/index'
			});
		}
	}
});
</script>

<style>
.container {
	min-height: 100vh;
	background: #f5f7fa;
	padding: 0 0 40rpx 0;
}

.header {
	padding: 88rpx 30rpx 20rpx;
	background: #fff;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
}

.nav-left {
	width: 80rpx;
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}

.user-avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 40rpx;
	overflow: hidden;
	background: #f0f0f0;
	border: 2rpx solid #eee;
}

.avatar-img {
	width: 100%;
	height: 100%;
	background-size: cover;
	background-position: center;
}

.online-status {
	font-size: 20rpx;
	color: #22c55e;
	background: rgba(34, 197, 94, 0.1);
	padding: 2rpx 12rpx;
	border-radius: 20rpx;
	white-space: nowrap;
}

.nav-center {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
	padding: 0 20rpx;
}

.title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	line-height: 1.2;
}

.subtitle {
	font-size: 24rpx;
	color: #999;
	margin-top: 4rpx;
	letter-spacing: 2rpx;
}

.nav-right {
	width: 80rpx;
	display: flex;
	justify-content: flex-end;
}

.create-btn {
	width: 120rpx;
	height: 60rpx;
	background: #333;
	border-radius: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
}

.create-icon {
	font-size: 32rpx;
	color: #fff;
}

.create-text {
	position: absolute;
	bottom: -36rpx;
	left: 50%;
	transform: translateX(-50%);
	font-size: 24rpx;
	color: #fff;
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

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 30rpx;
	margin: 40rpx 0 20rpx;
}

.section-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.section-subtitle {
	font-size: 24rpx;
	color: #999;
	background: #f5f7fa;
	padding: 4rpx 16rpx;
	border-radius: 20rpx;
}

.agent-list {
	padding: 0;
}

.agent-item {
	margin: 0 30rpx 24rpx;
	background: #fff;
	border-radius: 20rpx;
	overflow: hidden;
	transition: all 0.3s ease;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.agent-item:active {
	transform: scale(0.98);
}

.agent-content {
	padding: 24rpx;
}

.agent-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.agent-title-wrap {
	display: flex;
	flex-direction: column;
}

.agent-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.agent-time {
	font-size: 24rpx;
	color: #999;
	margin-top: 8rpx;
}

.agent-prompt {
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
	margin: 20rpx 0;
	padding: 16rpx;
	background: #f8fafc;
	border-radius: 12rpx;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	cursor: pointer;
	transition: opacity 0.3s ease;
}

.agent-prompt:active {
	opacity: 0.7;
}

.dimension-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin: 20rpx 0;
}

.dimension-tag {
	font-size: 24rpx;
	color: #666;
	background: #f8fafc;
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
	border: 1rpx solid #eee;
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

.action-btns {
	display: flex;
	gap: 12rpx;
}

.action-btn {
	width: 48rpx;
	height: 48rpx;
	border-radius: 24rpx;
	background: #f8f8f8;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
}

.action-btn:active {
	transform: scale(0.9);
}

.action-btn.edit {
	color: #333;
}

.action-btn.delete {
	color: #ff3b30;
}

.action-icon {
	font-size: 28rpx;
}

.agent-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 24rpx;
	padding-top: 24rpx;
	border-top: 2rpx solid #f8fafc;
}

.stat-tags {
	display: flex;
	gap: 20rpx;
}

.stat-tag {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 6rpx 12rpx;
	background: #f8fafc;
	border-radius: 16rpx;
}

.stat-icon {
	font-size: 28rpx;
	color: #666;
}

.stat-text {
	font-size: 24rpx;
	color: #666;
}

.start-btn {
	padding: 12rpx 24rpx;
	background: #333;
	color: #fff;
	font-size: 24rpx;
	border-radius: 30rpx;
	display: flex;
	align-items: center;
	gap: 8rpx;
	transition: all 0.3s ease;
}

.start-btn:active {
	transform: scale(0.95);
	opacity: 0.9;
}

.start-icon {
	font-size: 24rpx;
}
</style>
