<template>
	<view class="container">
		<!-- 背景效果 -->
		<view class="background">
			<view class="bg-grid"></view>
			<view class="bg-gradient"></view>
		</view>

		<!-- 顶部导航 -->
		<view class="header">
			<view class="back-btn" @tap="handleBack">
				<text class="back-icon">←</text>
			</view>
			<text class="header-title">评分维度设置</text>
		</view>

		<!-- 主要内容区 -->
		<view class="content-wrapper">
			<!-- 操作按钮 -->
			<view class="action-buttons">
				<view class="action-btn primary" @tap="handleAIGenerate">
					<text class="btn-icon">🤖</text>
					<text class="btn-text">AI生成</text>
				</view>
				<view class="action-btn" @tap="handleAdd">
					<text class="btn-icon">+</text>
					<text class="btn-text">手动添加</text>
				</view>
			</view>

			<!-- 维度列表 -->
			<view class="dimensions-container">
				<!-- 总分统计 -->
				<view class="total-score">
					<text class="total-label">当前总分</text>
					<text class="total-value" :class="{ 'warning': totalScore > 100, 'success': totalScore === 100 }">
						{{ totalScore > 100 ? totalScore : totalScore }}分
					</text>
				</view>

				<view class="dimension-card" v-for="(dim, index) in dimensions" :key="index">
					<view class="dimension-content">
						<view class="dimension-header">
							<text class="dimension-title">{{ dim.keyword }}</text>
							<text class="dimension-score">{{ dim.score }}分</text>
						</view>
						<view class="score-slider">
							<slider 
								:value="dim.score" 
								@change="(e) => handleScoreChange(index, e)"
								min="0" 
								max="100"
								show-value
								activeColor="#6366f1"
								backgroundColor="rgba(99, 102, 241, 0.1)"
							/>
						</view>
					</view>
				</view>
			</view>

			<!-- 底部确认按钮 -->
			<view class="bottom-btn">
				<button class="confirm-btn" @tap="handleConfirm">
					<text class="btn-text">{{ confirmButtonText }}</text>
					<text class="btn-icon">→</text>
				</button>
			</view>
		</view>

		<!-- 添加维度弹窗 -->
		<view class="modal" v-if="showAddModal">
			<view class="modal-mask" @tap="closeModal"></view>
			<view class="modal-content">
				<text class="modal-title">添加评分维度</text>
				<view class="input-group">
					<input class="modal-input" v-model="newDimension.keyword" placeholder="输入维度名称" type="text" />
					<input class="modal-input" v-model="newDimension.score" placeholder="输入分值(0-100)" type="number"
						@input="handleScoreInput" />
				</view>
				<view class="modal-btns">
					<button class="modal-btn cancel" @tap="closeModal">取消</button>
					<button class="modal-btn confirm" @tap="confirmAdd">确定</button>
				</view>
			</view>
		</view>

		<!-- 加载遮罩 -->
		<view class="loading-mask" v-if="isLoading">
			<view class="loading-content">
				<view class="loading-icon"></view>
				<text class="loading-text">AI生成中...</text>
			</view>
		</view>

		<!-- 保存遮罩 -->
		<view class="save-mask" v-if="saving">
			<view class="save-content">
				<view class="loading-icon"></view>
				<text class="save-tip">正在生成场景描述...</text>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
import { request } from '@/utils/request';
import Vue from 'vue';

interface Dimension {
	keyword: string;
	score: number;
}

// AI接口返回的数据结构
interface AIResponse {
	choices: Array<{
		message: {
			content: string;
		};
	}>;
}

// 后端接口返回的数据结构
interface ApiResponse {
	code: number;
	message?: string;
	data?: {
		dimensions?: Array<Dimension>;
		description?: string;
		[key: string]: any;
	};
}

// 后端返回的数据结构
interface AgentResponse {
	code: number;
	message: string;
	data: {
		list: Array<{
			id: string;
			ratingDimensions: {
				[key: string]: number;
			} | Array<{
				keyword: string;
				score: number;
			}>;
		}>;
	};
}

export default Vue.extend({
	data() {
		return {
			dimensions: [] as Dimension[],
			showAddModal: false,
			isLoading: false,
			newDimension: {
				keyword: '',
				score: 0
			},
			promptText: uni.getStorageSync('generatedPrompt') || '',
			saving: false
		}
	},

	async created() {
		await this.loadDimensions();
	},

	computed: {
		totalScore(): number {
			return this.dimensions.reduce((sum, item) => sum + Number(item.score), 0);
		},
		confirmButtonText(): string {
			if (this.dimensions.length === 0) {
				return '请添加评分维度';
			}
			if (this.totalScore < 100) {
				return `还差 ${100 - this.totalScore} 分`;
			}
			if (this.totalScore > 100) {
				return `超出 ${this.totalScore - 100} 分，请调整`;
			}
			return '确认使用这些维度';
		}
	},
	methods: {
		handleBack() {
			uni.navigateBack();
		},
		handleAdd() {
			this.showAddModal = true;
		},
		closeModal() {
			this.showAddModal = false;
			this.newDimension = {
				keyword: '',
				score: 0
			};
		},
		handleScoreInput(e: any) {
			let value = parseInt(e.detail.value);
			if (isNaN(value)) value = 0;
			if (value < 0) value = 0;
			if (value > 100) value = 100;
			this.newDimension.score = value;
		},
		confirmAdd() {
			if (!this.newDimension.keyword.trim()) {
				uni.showToast({
					title: '请输入维度名称',
						icon: 'none'
				});
				return;
			}
			if (this.newDimension.score <= 0) {
				uni.showToast({
					title: '请输入分值',
					icon: 'none'
				});
				return;
			}

			const totalScore = this.dimensions.reduce((sum, item) => sum + Number(item.score), 0) + this.newDimension.score;
			if (totalScore > 100) {
				uni.showToast({
					title: '总分不能超过100分',
					icon: 'none'
				});
				return;
			}

			this.dimensions.push({
				keyword: this.newDimension.keyword,
				score: this.newDimension.score
			});
			this.closeModal();
		},
		handleDelete(index: number) {
			this.dimensions.splice(index, 1);
		},
		async handleAIGenerate() {
			if (!this.promptText) {
				uni.showToast({
					title: '未获取到提示词',
					icon: 'none'
				});
				return;
			}

			this.isLoading = true;

			try {
				const response = await uni.request({
					url: 'https://api.fastgpt.in/api/v1/chat/completions',
					method: 'POST',
					header: {
						'Authorization': 'Bearer fastgpt-dxg9VTnNUgRF25NLUVKd1ZgZOMoq6933VEGHEAbLeaJFykSSzdPvb6Pxk',
						'Content-Type': 'application/json'
					},
					data: {
						chatId: Math.random().toString(36).substring(7),
						stream: false,
						detail: false,
						responseChatItemId: 'dimension_' + Date.now(),
						variables: {
							prompt: this.promptText
						},
						messages: [
							{
								role: 'user',
								content: '根据提供的销售场景提示词，生成5个评分维度和对应的分值。分值总和必须等于100。返回格式为JSON数组，每个对象包含keyword和score字段。示例：[{"keyword":"产品知识","score":25},{"keyword":"沟通技巧","score":30}]'
							}
						]
					}
				});

				// 类型断言确保 response.data 是 AIResponse 类型
				const aiResponse = response.data as AIResponse;
				if (!aiResponse.choices?.[0]?.message?.content) {
					throw new Error('AI返回数据格式错误');
				}

				const content = aiResponse.choices[0].message.content;
				let dimensions = [];
				try {
					// 尝试直接解析
					dimensions = JSON.parse(content);
				} catch (e) {
					// 如果直接解析失败，尝试从文本中提取JSON部分
					const match = content.match(/\[[\s\S]*\]/);
					if (match) {
						dimensions = JSON.parse(match[0]);
					} else {
						throw new Error('无法解析AI返回的维度数据');
					}
				}

				// 验证数据格式
				if (!Array.isArray(dimensions) ||
					!dimensions.every(d => typeof d.keyword === 'string' && typeof d.score === 'number')) {
					throw new Error('AI返回的数据格式不正确');
				}

				// 更新维度列表
				this.dimensions = dimensions;

				// 验证总分
				const total = dimensions.reduce((sum, d) => sum + d.score, 0);
				if (total !== 100) {
					uni.showToast({
						title: 'AI生成的分值总和不等于100，已自动调整',
						icon: 'none'
					});
					// 自动调整分值
					const factor = 100 / total;
					this.dimensions = dimensions.map(d => ({
						...d,
						score: Math.round(d.score * factor)
					}));
				}

			} catch (error) {
				console.error('AI生成维度失败:', error);
				uni.showToast({
					title: error instanceof Error ? error.message : 'AI生成失败，请重试',
					icon: 'none'
				});
			} finally {
				this.isLoading = false;
			}
		},
		async handleConfirm() {
			if (this.dimensions.length === 0) {
				uni.showToast({
					title: '请添加评分维度',
					icon: 'none'
				});
				return;
			}

			if (this.totalScore !== 100) {
				let message = this.totalScore > 100 
					? `总分超出${this.totalScore - 100}分，请调整` 
					: `总分不足，还差${100 - this.totalScore}分`;
				
				uni.showToast({
					title: message,
					icon: 'none'
				});
				return;
			}

			try {
				this.saving = true;
				
				// 调用 AI 生成描述
				const description = await this.generateAIDescription();
				
				// 直接更新 agent
				const agentId = uni.getStorageSync('agentId');
				if (!agentId) {
					throw new Error('未找到场景ID');
				}
				
				const res = await request<ApiResponse>({
					url: `/agent/${agentId}`,
					method: 'PATCH',
					data: {
						ratingDimensions: this.dimensions,
						description: description
					}
				});

				if (res.code === 0) {
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					});
					
					// 等待所有请求完成后再返回
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/index/index'
						});
					}, 1500);
				} else {
					throw new Error(res.message || '保存失败');
				}
			} catch (error) {
				console.error('保存失败:', error);
				uni.showToast({
					title: error instanceof Error ? error.message : '保存失败',
					icon: 'none'
				});
			} finally {
				this.saving = false;
			}
		},
		handleScoreChange(index: number, event: any) {
			let value = parseInt(event.detail?.value || 0);
			if (isNaN(value)) value = 0;
			if (value < 0) value = 0;
			if (value > 100) value = 100;

			this.$set(this.dimensions[index], 'score', value);
		},
		handleScoreBlur(index: number) {
			const currentScore = this.dimensions[index].score;
			const otherScoresTotal = this.totalScore - currentScore;

			if (otherScoresTotal + currentScore > 100) {
				// 如果总分超过100，自动调整当前分值
				const newScore = 100 - otherScoresTotal;
				if (newScore >= 0) {
					this.$set(this.dimensions[index], 'score', newScore);
				}
				uni.showToast({
					title: '已自动调整分值',
					icon: 'none'
				});
			}
		},
		randomBinary() {
			return Math.random() > 0.5 ? '1' : '0';
		},
		// 加载维度数据
		async loadDimensions() {
			const agentId = uni.getStorageSync('agentId');
			if (!agentId) {
				uni.showToast({
					title: '未找到场景ID',
					icon: 'none'
				});
				return;
			}

			try {
				const response = await request<AgentResponse>({
					url: `/agent/${agentId}`,
					method: 'GET'
				});

				if (response.code === 0 && response.data?.list?.[0]) {
					const agent = response.data.list[0];
					if (agent.ratingDimensions) {
						// 处理不同格式的 ratingDimensions
						if (Array.isArray(agent.ratingDimensions)) {
							// 如果是数组格式，直接使用
							this.dimensions = agent.ratingDimensions.map(dim => ({
								keyword: dim.keyword,
								score: Number(dim.score)
							}));
						} else {
							// 如果是对象格式，转换为数组
							this.dimensions = Object.entries(agent.ratingDimensions as Record<string, number>).map(([keyword, score]) => ({
								keyword,
								score: Number(score)
							}));
						}

						// 按分值从大到小排序
						this.dimensions.sort((a, b) => b.score - a.score);
					}
				}
			} catch (error) {
				console.error('加载维度失败:', error);
				uni.showToast({
					title: '加载维度失败',
					icon: 'none'
				});
			}
		},
		async generateAIDescription() {
			try {
				const response = await uni.request({
					url: 'https://api.fastgpt.in/api/v1/chat/completions',
					method: 'POST',
					header: {
						'Authorization': 'Bearer fastgpt-rlTG3EPU1QgI2wYd6dtG91crBfQNWBPDX6jg6Nqw31HghYLoIglEzwvdaX61ouXiY',
						'Content-Type': 'application/json'
					},
					data: {
						chatId: `desc_${Date.now()}`,
						stream: false,
						detail: false,
						responseChatItemId: 'my_responseChatItemId',
						variables: {
							prompt: this.promptText || '这是一个销售训练场景',
							dimension: JSON.stringify(this.dimensions || [
								{ score: 30, keyword: "产品知识" },
								{ score: 25, keyword: "沟通技巧" },
								{ score: 20, keyword: "市场趋势分析" },
								{ score: 15, keyword: "客户需求理解" },
								{ score: 10, keyword: "情感营销能力" }
							])
						},
						messages: [
							{
								role: 'user',
								content: '根据提供的销售场景提示词和评分维度，生成一段场景描述。描述应该包含场景特点和重点关注的能力维度。'
							}
						]
					}
				});

				if (response.statusCode === 200 && response.data) {
					const aiResponse = response.data as {
						choices: Array<{
							message: {
								role: string;
								content: string;
							};
						}>;
					};
					
					const description = aiResponse.choices?.[0]?.message?.content;
					if (!description) {
						throw new Error('生成描述失败');
					}
					return description;
				}
				throw new Error('AI 接口返回异常');
			} catch (error) {
				console.error('生成描述失败:', error);
				throw error;
			}
		},
		async handleSave() {
			try {
				this.saving = true;
				
				// 调用 AI 生成描述
				const description = await this.generateAIDescription();
				
				// 保存到后端
				const res = await request<ApiResponse>({
					url: '/dimension',
					method: 'POST',
					data: {
						dimensions: this.dimensions,
						description
					}
				});

				if (res.code === 0) {
					// 获取完整的 agent 信息并更新
					const agentRes = await request<ApiResponse>({
						url: '/agent',
						method: 'GET'
					});
					
					if (agentRes.code === 0 && agentRes.data) {
						// 更新 agent 的维度和描述信息
						await request({
							url: `/agent/${agentRes.data.id}`,
							method: 'PATCH',
							data: {
								ratingDimensions: this.dimensions,
								description: description
							}
						});
					}

					uni.showToast({
						title: '保存成功',
						icon: 'success'
					});
					
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				}
			} catch (error) {
				console.error('保存失败:', error);
				uni.showToast({
					title: '保存失败',
					icon: 'none'
				});
			} finally {
				this.saving = false;
			}
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
	position: relative;
	z-index: 2;
}

.header-title {
	color: #333;
	font-size: 36rpx;
	font-weight: 600;
}

.back-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

.back-icon {
	font-size: 40rpx;
	color: #333;
}

.content-wrapper {
	position: relative;
	z-index: 2;
	padding: 0 40rpx;
}

.action-buttons {
	display: flex;
	gap: 20rpx;
	margin-bottom: 40rpx;
}

.action-btn {
	flex: 1;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #ffffff;
	border: 1px solid rgba(99, 102, 241, 0.1);
	border-radius: 12rpx;
	color: #333;
	gap: 10rpx;
	transition: all 0.3s ease;
}

.action-btn:active {
	transform: scale(0.98);
}

.action-btn.primary {
	background: linear-gradient(135deg, #818cf8 0%, #8b5cf6 100%);
	color: #fff;
	border: none;
	box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.2);
}

.dimension-card {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 24rpx;
	border: 1px solid rgba(99, 102, 241, 0.15);
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
	transition: all 0.3s ease;
}

.dimension-card:hover {
	transform: translateY(-2rpx);
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.dimension-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.dimension-title {
	color: #333;
	font-size: 32rpx;
	font-weight: 500;
}

.dimension-score {
	background: linear-gradient(135deg, #818cf8 0%, #8b5cf6 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	font-size: 28rpx;
	font-weight: 600;
}

.confirm-btn {
	background: linear-gradient(135deg, #818cf8 0%, #8b5cf6 100%);
	border: none;
	color: #fff;
	padding: 24rpx 48rpx;
	border-radius: 12rpx;
	font-size: 32rpx;
	margin-top: 60rpx;
	box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.2);
	transition: all 0.3s ease;
}

.confirm-btn:active {
	transform: scale(0.98);
}

.modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 100;
}

.modal-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
}

.modal-content {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 600rpx;
	background: #ffffff;
	border-radius: 12rpx;
	padding: 40rpx;
	box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.1);
}

.modal-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	text-align: center;
	margin-bottom: 30rpx;
}

.input-group {
	margin-bottom: 40rpx;
}

.modal-input {
	background: #f5f5f5;
	border: 1px solid rgba(99, 102, 241, 0.1);
	color: #333;
	border-radius: 8rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
}

.modal-btns {
	display: flex;
	gap: 20rpx;
}

.modal-btn {
	flex: 1;
	height: 80rpx;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
}

.modal-btn.cancel {
	background: #f8f8f8;
	color: #666;
}

.modal-btn.confirm {
	background: #333;
	color: #fff;
}

.loading-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(255, 255, 255, 0.9);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 100;
}

.loading-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
}

.loading-icon {
	width: 60rpx;
	height: 60rpx;
	border: 4rpx solid #f3f3f3;
	border-top: 4rpx solid #333;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

.loading-text {
	font-size: 28rpx;
	color: #6366f1;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

.score-input-wrap {
	display: flex;
	align-items: center;
	background: #f8f8f8;
	border-radius: 8rpx;
	padding: 4rpx 12rpx;
}

.score-input {
	width: 60rpx;
	text-align: right;
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
	margin-right: 4rpx;
}

.score-unit {
	font-size: 24rpx;
	color: #666;
}

/* 滑块样式优化 */
.score-slider {
	margin-top: 20rpx;
}

.score-slider slider {
	margin: 0;
	width: 100%;
}

.score-slider .uni-slider-handle {
	width: 28rpx;
	height: 28rpx;
	background: #8b5cf6;
}

.score-slider .uni-slider-track {
	background: linear-gradient(to right, #818cf8, #8b5cf6);
}

/* 总分统计样式 */
.total-score {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 30rpx;
	background: linear-gradient(to right, rgba(129, 140, 248, 0.05), rgba(139, 92, 246, 0.05));
	border-radius: 12rpx;
	margin-bottom: 30rpx;
	border: 1px solid rgba(99, 102, 241, 0.15);
}

.total-label {
	font-size: 28rpx;
	color: #666;
}

.total-value {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	background: linear-gradient(135deg, #818cf8 0%, #8b5cf6 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.total-value.warning {
	color: #ef4444;
	background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.total-value.success {
	color: #10b981;
	background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

/* 优化滑块样式 */
.wx-slider-handle {
	width: 28rpx !important;
	height: 28rpx !important;
	background: #8b5cf6 !important;
	border: 2rpx solid #fff !important;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1) !important;
}

.wx-slider-track {
	background: linear-gradient(to right, #818cf8, #8b5cf6) !important;
}

/* 保存遮罩 */
.save-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(255, 255, 255, 0.9);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.save-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
}

.loading-icon {
	width: 80rpx;
	height: 80rpx;
	border: 4rpx solid rgba(99, 102, 241, 0.1);
	border-top-color: #8b5cf6;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

.save-tip {
	font-size: 28rpx;
	color: #666;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}
</style>