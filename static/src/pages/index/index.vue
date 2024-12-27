<template>
	<view class="container">
		<!-- 背景效果 -->
		<view class="background">
			<view class="bg-grid"></view>
		</view>

		<scroll-view 
			scroll-y 
			class="scroll-container" 
			@scrolltolower="handleLoadMore"
			@refresherrefresh="handleRefresh"
			:refresher-enabled="true"
			:refresher-triggered="refreshing">
			<!-- 顶部导航 -->
			<view class="header">
				<view class="header-left">
					<view class="user-avatar" @tap="handleUserInfo">
						<image 
							class="avatar-img" 
							:src="userInfo && userInfo.avatar ? userInfo.avatar : defaultAvatar" 
							mode="aspectFill" 
						/>
					</view>
				</view>
				<text class="header-title">销售对练</text>
				<view class="header-right">
					<view class="create-btn" @tap="handleCreate">
						<text class="btn-icon">+</text>
						<text class="btn-text">新建场景</text>
					</view>
				</view>
			</view>

			<!-- 统计卡片 -->
			<view class="agent-card stats">
				<view class="stat-item">
					<text class="stat-value">{{ total }}</text>
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
			<view class="content-wrapper" v-if="agents.length > 0">
				<view class="section-header">
					<text class="section-title">我的训练场景</text>
					<text class="section-subtitle">{{ agents.length }}个场景</text>
				</view>
				<view v-for="(agent, index) in agents" :key="agent.id" class="agent-card" @tap="handleViewRecords(index)">
					<view class="agent-header">
						<view class="agent-info">
							<view class="agent-title">{{ agent.name }}</view>
							<view class="agent-meta">
								<text class="agent-time">创建于 {{ formatTime(agent.createdAt) }}</text>
							</view>
						</view>
						<view class="action-btns">
							<view class="action-btn edit" @tap.stop="handleEdit(index)">
								<text class="action-icon">✎</text>
							</view>
							<view class="action-divider"></view>
							<view class="action-btn delete" @tap.stop="handleDelete(index)">
								<text class="action-icon">×</text>
							</view>
						</view>
					</view>
					<view class="agent-prompt-wrap">
						<text class="agent-prompt truncated">
							{{ agent.description || agent.promptText || formatPrompt(agent.prompt) }}
						</text>
					</view>
					<view class="card-footer">
						<view class="dimensions-wrapper">
							<view class="dimensions-list">
								<view v-for="(item, idx) in getSortedDimensions(agent.ratingDimensions)" :key="idx" class="dimension-tag">
									{{ item.keyword }}
									<text class="dimension-score">{{ item.score }}分</text>
								</view>
							</view>
							<view class="chat-btn-wrapper">
								<view class="chat-btn" @tap.stop="handleStartChat(index)">
									<text class="chat-icon">💬</text>
									<text class="chat-text">开始对话</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-else>
				<text class="empty-icon">📝</text>
				<text class="empty-text">还没有训练场景，快来创建一个吧</text>
			</view>
		</scroll-view>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';
import { request } from '@/utils/request';
import { Agent, AgentListResponse } from '@/types/agent';

export default Vue.extend({
	data() {
		return {
			agents: [] as Array<Agent & { isExpanded?: boolean }>,
			page: 1,
			pageSize: 10,
			total: 0,
			loading: false,
			refreshing: false,
			userInfo: null as any,
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
	async onShow() {
		// 获取用户信息
		try {
			const res = await request<any>({
				url: '/user',
				method: 'GET',
				data: {
					page: 1,
					pageSize: 10
				}
			});
			
			if(res.data?.list?.length > 0) {
				this.userInfo = res.data.list[0];
				// 更新本地存储的用户信息
				uni.setStorageSync('userInfo', this.userInfo);
			}
		} catch(error) {
			console.error('获取用户信息失败:', error);
		}
		
		// 加载 agents 列表
		await this.loadAgents();
	},
	methods: {
		async loadAgents(refresh = false) {
			if (refresh) {
				this.page = 1;
			}

			let retryCount = 0;
			const maxRetries = 3;

			try {
				this.loading = true;

				while (retryCount < maxRetries) {
					try {
						const res = await request<AgentListResponse>({
							url: `/agent?page=${this.page}&pageSize=${this.pageSize}`,
							method: 'GET'
						});

						if (res.code === 0) {
							this.agents = res.data.list
								.map(agent => ({
									...agent,
									isExpanded: false
								}))
								// 按创建时间倒序排序
								.sort((a, b) => {
									return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
								});
							this.total = res.data.total;
						}
						break;
					} catch (error) {
						retryCount++;
						if (retryCount === maxRetries) throw error;
						await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
					}
				}
			} catch (error: any) {
				console.error('Load agents error:', error);
				uni.showToast({
					title: error.message || '获取列表失败',
					icon: 'none',
					duration: 3000
				});
			} finally {
				this.loading = false;
				if (refresh) {
					this.refreshing = false;
				}
			}
		},

		handleCreate() {
			uni.navigateTo({
				url: '/pages/agent/create'
			});
		},
		handleViewRecords(index: number) {
			const agent = this.agents[index];
			uni.navigateTo({
				url: `/pages/records/index?agentId=${agent.id}`
			});
		},
		formatTime(time: string): string {
			return new Date(time).toLocaleDateString();
		},
		handleEdit(index: number) {
			const agent = this.agents[index];
			uni.navigateTo({
				url: `/pages/training/edit?agentId=${agent.id}`
			});
		},
		async handleDelete(index: number) {
			const agent = this.agents[index];
			// 添加确认弹窗
			uni.showModal({
				title: '确认删除',
				content: '确定要删除这个训练场景吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							const res = await request<any>({
								url: `/agent/${agent.id}`,
								method: 'DELETE'
							});
							
							if (res.code === 0) {
								this.page = 1;
								await this.loadAgents(true);
								
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});
							} else {
								throw new Error(res.message || '删除失败');
							}
						} catch (error: any) {
							uni.showToast({
								title: error.message || '删除失败',
								icon: 'none'
							});
						}
					}
				}
			});
		},
		handleUserInfo() {
			if(this.userInfo?.id) {
				uni.navigateTo({
					url: `/pages/user/info?id=${this.userInfo.id}`
				});
			} else {
				uni.showToast({
					title: '获取用户信息失败',
					icon: 'none'
				});
			}
		},
		handleStartChat(index: number) {
			const agent = this.agents[index];
			// 将 prompt 和 dimensions 编码后传递给聊天页面
			const params = {
				agentId: agent.id,
				prompt: encodeURIComponent(agent.promptText || ''),
				dimensions: encodeURIComponent(JSON.stringify(agent.ratingDimensions))
			};

			const url = `/pages/chat/index?agentId=${params.agentId}&prompt=${params.prompt}&dimensions=${params.dimensions}`;
			uni.navigateTo({ url });
		},
		isPromptOverflow(prompt: string): boolean {
			return prompt?.length > 100;
		},
		formatPrompt(prompt: string): string {
			return prompt || '暂无描述';
		},
		async handleLoadMore() {
			if (this.loading || this.agents.length >= this.total) return;
			this.page++;
			await this.loadAgents();
		},
		async handleRefresh() {
			this.refreshing = true;
			await this.loadAgents(true);
			this.refreshing = false;
		},
		isPromptLong(text: string): boolean {
			return text?.length > 50;
		},
		togglePrompt(index: number) {
			this.$set(this.agents[index], 'isExpanded', !this.agents[index].isExpanded);
		},
		getSortedDimensions(dimensions: any) {
			if (!Array.isArray(dimensions)) {
				return [];
			}
			return dimensions.slice().sort((a, b) => b.score - a.score);
		}
	}
});
</script>

<style>
.container {
	min-height: 100vh;
	background: #ffffff;
	position: relative;
	overflow: hidden;
}

.background {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
}

.bg-grid {
	position: absolute;
	width: 100%;
	height: 100%;
	background-image: 
		linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
		linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
	background-size: 20px 20px;
}

.header {
	padding: 40rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: relative;
	z-index: 2;
}

.header-left {
	display: flex;
	align-items: center;
}

.user-avatar {
	width: 72rpx;
	height: 72rpx;
	border-radius: 36rpx;
	overflow: hidden;
	background: #f3f4f6;
	border: 2rpx solid rgba(99, 102, 241, 0.1);
	transition: all 0.3s ease;
}

.user-avatar:active {
	transform: scale(0.95);
}

.avatar-img {
	width: 100%;
	height: 100%;
}

.header-title {
	color: #333;
	font-size: 36rpx;
	font-weight: 600;
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
}

.header-right {
	display: flex;
	align-items: center;
}

.create-btn {
	background: linear-gradient(135deg, #818cf8 0%, #8b5cf6 100%);
	padding: 16rpx 28rpx;
	border-radius: 30rpx;
	display: flex;
	align-items: center;
	gap: 8rpx;
	box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.2);
	transition: all 0.3s ease;
}

.create-btn:active {
	transform: scale(0.95);
	box-shadow: 0 2rpx 8rpx rgba(99, 102, 241, 0.15);
}

.create-btn .btn-icon {
	color: #fff;
	font-size: 28rpx;
	font-weight: 600;
}

.create-btn .btn-text {
	color: #fff;
	font-size: 28rpx;
	font-weight: 500;
}

.content-wrapper {
	position: relative;
	z-index: 2;
	padding: 0 40rpx;
}

.agent-card {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	border: 1px solid rgba(99, 102, 241, 0.15);
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
	transition: all 0.3s ease;
}

.agent-card:hover {
	transform: translateY(-2rpx);
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.agent-header {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

.agent-avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 40rpx;
	margin-right: 20rpx;
	border: 2rpx solid rgba(99, 102, 241, 0.1);
}

.agent-info {
	flex: 1;
}

.agent-title {
	color: #333;
	font-size: 32rpx;
	font-weight: 500;
	margin-bottom: 8rpx;
}

.agent-meta {
	display: flex;
	align-items: center;
}

.agent-time {
	color: #666;
	font-size: 24rpx;
	line-height: 1.4;
}

.agent-prompt-wrap {
	position: relative;
	margin: 16rpx 0;
}

.agent-prompt {
	color: #666;
	font-size: 28rpx;
	line-height: 1.6;
	display: -webkit-box;
	word-break: break-all;
	overflow: hidden;
	text-overflow: ellipsis;
	min-height: 80rpx;
}

.agent-prompt.truncated {
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.prompt-expand {
	margin-top: 8rpx;
	text-align: right;
}

.expand-text {
	color: #8b5cf6;
	font-size: 24rpx;
	padding: 4rpx 12rpx;
	background: rgba(139, 92, 246, 0.05);
	border-radius: 4rpx;
	display: inline-block;
}

.expand-text:active {
	opacity: 0.8;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 40rpx;
}

.empty-icon {
	font-size: 80rpx;
	margin-bottom: 20rpx;
	color: rgba(99, 102, 241, 0.2);
}

.empty-text {
	color: #666;
	font-size: 28rpx;
	text-align: center;
}

.card-footer {
	display: flex;
	flex-direction: column;
	margin-top: 16rpx;
}

.dimensions-wrapper {
	position: relative;
	width: 100%;
}

.dimensions-list {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.dimension-tag {
	padding: 6rpx 12rpx;
	border-radius: 8rpx;
	background: rgba(99, 102, 241, 0.05);
	color: #6366f1;
	font-size: 22rpx;
	transition: all 0.3s ease;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.chat-btn-wrapper {
	margin-top: 20rpx;
	display: flex;
	justify-content: flex-end;
}

.chat-btn {
	background: linear-gradient(135deg, #818cf8 0%, #8b5cf6 100%);
	padding: 12rpx 24rpx;
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	gap: 4rpx;
	box-shadow: 0 2rpx 8rpx rgba(99, 102, 241, 0.2);
	transition: all 0.3s ease;
}

.chat-btn:active {
	transform: scale(0.95);
	box-shadow: 0 2rpx 4rpx rgba(99, 102, 241, 0.15);
}

.chat-icon {
	color: #fff;
	font-size: 24rpx;
}

.chat-text {
	color: #fff;
	font-size: 24rpx;
	font-weight: 500;
}

/* 添加统计卡片样式 */
.stats {
	display: flex;
	justify-content: space-around;
	align-items: center;
	margin: 20rpx 40rpx;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.stat-value {
	font-size: 36rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 8rpx;
}

.stat-label {
	font-size: 24rpx;
	color: #666;
}

.stat-divider {
	width: 2rpx;
	height: 40rpx;
	background: rgba(99, 102, 241, 0.1);
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 40rpx 0 20rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.section-subtitle {
	font-size: 24rpx;
	color: #666;
	background: rgba(99, 102, 241, 0.05);
	padding: 4rpx 16rpx;
	border-radius: 20rpx;
}

.action-btns {
	display: flex;
	gap: 24rpx;
	align-items: center;
}

.action-divider {
	width: 2rpx;
	height: 24rpx;
	background: rgba(99, 102, 241, 0.1);
}

.action-btn {
	width: 56rpx;
	height: 56rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 8rpx;
	transition: all 0.3s ease;
}

.action-btn.edit {
	background: rgba(99, 102, 241, 0.05);
	border: 1px solid rgba(99, 102, 241, 0.1);
}

.action-btn.delete {
	background: rgba(239, 68, 68, 0.05);
	border: 1px solid rgba(239, 68, 68, 0.1);
}

.action-btn.edit .action-icon {
	color: #6366f1;
	font-size: 32rpx;
}

.action-btn.delete .action-icon {
	color: #ef4444;
	font-size: 32rpx;
}

.action-btn:active {
	transform: scale(0.95);
	opacity: 0.9;
}

.scroll-container {
	height: calc(100vh - 40rpx);
}
</style>
