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
				@tap="handleAgentClick(index)"
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
					<view class="agent-prompt-wrap">
						<view 
							class="agent-prompt"
							@tap.stop="handlePromptClick(index)"
						>
							<text class="prompt-text">{{ agent.prompt }}</text>
							<view class="prompt-expand" v-if="isPromptOverflow(agent.prompt)">
								<text class="expand-icon">...</text>
							</view>
						</view>
					</view>
					<view class="agent-dimensions">
						<view class="dimension-tags">
							<view 
								v-for="(dimension, dIndex) in agent.dimensions" 
								:key="dIndex"
								class="dimension-tag"
							>
								<text class="dimension-name">{{ dimension.keyword }}</text>
								<text class="dimension-score">{{ dimension.score }}分</text>
							</view>
						</view>
					</view>
					<view class="agent-footer">
						<button class="start-btn" @tap.stop="handleStartChat(index)">
							开始对话
						</button>
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
			// 跳转到成绩单页面
			uni.navigateTo({
				url: '/pages/records/index'
			});
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
		handleStartChat(index: number) {
			const agent = this.agents[index];
			// 将 prompt 和 dimensions 编码后传递给聊天页面
			const params = {
				prompt: encodeURIComponent(agent.prompt),
				dimensions: encodeURIComponent(JSON.stringify(agent.dimensions))
			};
			
			const url = `/pages/chat/index?prompt=${params.prompt}&dimensions=${params.dimensions}`;
			uni.navigateTo({ url });
		},
		isPromptOverflow(prompt: string): boolean {
			return prompt.length > 100; // 可以根据实际需求调整长度
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
	cursor: pointer;
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

.agent-prompt-wrap {
	margin: 24rpx 0;
}

.agent-prompt {
	background: #f8f8f8;
	border-radius: 12rpx;
	padding: 20rpx;
	position: relative;
	line-height: 1.6;
	min-height: 80rpx;
}

.prompt-text {
	font-size: 28rpx;
	color: #333;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 3;
	overflow: hidden;
	text-overflow: ellipsis;
}

.prompt-expand {
	position: absolute;
	right: 20rpx;
	bottom: 20rpx;
	background: #f8f8f8;
	padding-left: 20rpx;
}

.expand-icon {
	font-size: 28rpx;
	color: #666;
}

.agent-dimensions {
	margin: 24rpx 0;
}

.dimension-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.dimension-tag {
	background: #fff;
	border: 1px solid #eee;
	border-radius: 30rpx;
	padding: 8rpx 20rpx;
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.dimension-name {
	font-size: 26rpx;
	color: #333;
}

.dimension-score {
	font-size: 24rpx;
	color: #666;
}

.agent-footer {
	margin-top: 30rpx;
	padding-top: 20rpx;
	border-top: 1px solid #eee;
	text-align: right;
}

.start-btn {
	display: inline-flex;
	height: 64rpx;
	padding: 0 30rpx;
	background: #333;
	color: #fff;
	font-size: 26rpx;
	border-radius: 32rpx;
}

/* 响应式适配 */
@media screen and (min-width: 768px) {
	.agent-item {
		max-width: 800rpx;
		margin: 0 auto 30rpx;
	}
	
	.prompt-text {
		font-size: 30rpx;
	}
	
	.dimension-tag {
		padding: 10rpx 24rpx;
	}
	
	.dimension-name {
		font-size: 28rpx;
	}
	
	.start-btn {
		height: 72rpx;
		font-size: 28rpx;
		padding: 0 40rpx;
	}
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
</style>
