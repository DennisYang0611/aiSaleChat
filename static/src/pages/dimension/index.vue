<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="header">
			<view class="back-btn" @tap="handleBack">
				<text class="back-icon">←</text>
			</view>
			<text class="header-title">选择评分维度</text>
			<view class="action-btns">
				<view class="action-btn" @tap="handleAdd">
					<text class="action-icon">+</text>
				</view>
				<view class="action-btn" @tap="handleAIGenerate">
					<text class="action-text">AI</text>
				</view>
			</view>
		</view>

		<!-- 维度列表 -->
		<view class="dimensions-list">
			<view class="list-header" v-if="dimensions.length > 0">
				<text class="total-score">总分: {{ totalScore }}/100</text>
			</view>
			<view 
				v-for="(dimension, index) in dimensions" 
				:key="index"
				class="dimension-item"
				:class="{ 'animate-in': true }"
				:style="{ animationDelay: `${index * 0.1}s` }"
			>
				<view class="dimension-info">
					<view class="dimension-header">
						<text class="dimension-name">{{ dimension.keyword }}</text>
						<view class="score-input-wrap">
							<input
								type="number"
								class="score-input"
								:value="dimension.score"
								@input="handleScoreChange(index, $event)"
								@blur="handleScoreBlur(index)"
							/>
							<text class="score-unit">分</text>
						</view>
					</view>
					<view class="score-bar">
						<view 
							class="score-progress"
							:style="{ width: `${dimension.score}%` }"
						></view>
					</view>
				</view>
				<view class="delete-btn" @tap.stop="handleDelete(index)">
					<text class="delete-icon">×</text>
				</view>
			</view>
			<view class="empty-state" v-if="dimensions.length === 0">
				<text class="empty-text">点击右上角按钮添加评分维度</text>
			</view>
		</view>
		
		<!-- 底部按钮 -->
		<button 
			class="confirm-btn" 
			@tap="handleConfirm"
			:disabled="dimensions.length === 0 || totalScore !== 100"
			:class="{ 'disabled': dimensions.length === 0 || totalScore !== 100 }"
		>
			{{ confirmButtonText }}
		</button>

		<!-- 添加维度弹窗 -->
		<view class="modal" v-if="showAddModal">
			<view class="modal-mask" @tap="closeModal"></view>
			<view class="modal-content">
				<text class="modal-title">添加评分维度</text>
				<view class="input-group">
					<input 
						class="modal-input"
						v-model="newDimension.keyword"
						placeholder="输入维度名称"
						type="text"
					/>
					<input 
						class="modal-input"
						v-model="newDimension.score"
						placeholder="输入分值(0-100)"
						type="number"
						@input="handleScoreInput"
					/>
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
	</view>
</template>

<script lang="ts">
import Vue from 'vue';

interface Dimension {
	keyword: string;
	score: number;
}

interface AIMessage {
	role: string;
	content: string;
}

interface AIChoice {
	message: AIMessage;
	finish_reason: string;
	index: number;
}

interface AIResponse {
	id: string;
	model: string;
	choices: Array<{
		message: {
			role: string;
			content: string;
		};
		finish_reason: string;
		index: number;
	}>;
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
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
				score: ''
			},
			promptText: uni.getStorageSync('generatedPrompt') || ''
		}
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
				return `超出 ${this.totalScore - 100} 分`;
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
				score: ''
			};
		},
		handleScoreInput(e: any) {
			let value = parseInt(e.detail.value);
			if (isNaN(value)) value = 0;
			if (value < 0) value = 0;
			if (value > 100) value = 100;
			this.newDimension.score = value.toString();
		},
		confirmAdd() {
			if (!this.newDimension.keyword.trim()) {
				uni.showToast({
					title: '请输入维度名称',
					icon: 'none'
				});
				return;
			}
			if (!this.newDimension.score) {
				uni.showToast({
					title: '请输入分值',
					icon: 'none'
				});
				return;
			}

			const totalScore = this.dimensions.reduce((sum, item) => sum + Number(item.score), 0) + Number(this.newDimension.score);
			if (totalScore > 100) {
				uni.showToast({
					title: '总分不能超过100分',
					icon: 'none'
				});
				return;
			}

			this.dimensions.push({
				keyword: this.newDimension.keyword,
				score: Number(this.newDimension.score)
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
						'Authorization': 'Bearer fastgpt-ivclLFAcNWNyOVNvvm8K9LjcoajA5sH8roTienpWDm9pbsKyiSk8aoHXnH7GhV',
						'Content-Type': 'application/json'
					},
					data: {
						messages: [
							{
								role: 'system',
								content: '你是一个销售培训专家。请根据提供的销售场景提示词，生成5个评分维度和对应的分值。分值总和必须等于100。返回格式为JSON数组，每个对象包含keyword和score字段。示例：[{"keyword":"产品知识","score":25},{"keyword":"沟通技巧","score":30}]'
							},
							{
								role: 'user',
								content: `请根据以下销售场景生成评分维度：${this.promptText}`
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
		handleConfirm() {
			if (this.dimensions.length === 0) {
				uni.showToast({
					title: '请添加评分维度',
					icon: 'none'
				});
				return;
			}

			if (this.totalScore !== 100) {
				uni.showToast({
					title: '总分必须等于100分',
					icon: 'none'
				});
				return;
			}

			try {
				// 保存提示词和维度的关联数据
				const agentData = {
					prompt: this.promptText,
					dimensions: this.dimensions,
					createTime: new Date().getTime()
				};

				// 获取现有的 agents 数据
				const agents = uni.getStorageSync('agents') || [];
				agents.push(agentData);
				
				// 更新存储
				uni.setStorageSync('agents', agents);

				uni.showToast({
					title: '保存成功',
					icon: 'success',
					duration: 1500
				});

				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/index/index'
					});
				}, 1500);

			} catch (error) {
				uni.showToast({
					title: '操作失败，请重试',
					icon: 'none'
				});
				console.error('Error in handleConfirm:', error);
			}
		},
		handleScoreChange(index: number, event: any) {
			let value = parseInt(event.detail.value);
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
		}
	}
});
</script>

<style>
.container {
	min-height: 100vh;
	background-color: #fff;
	padding: 40rpx 30rpx;
	box-sizing: border-box;
}

.header {
	display: flex;
	align-items: center;
	margin-bottom: 40rpx;
}

.back-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	font-size: 40rpx;
	color: #333;
}

.header-title {
	flex: 1;
	text-align: center;
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	margin-right: 60rpx;
}

.section-title {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 20rpx;
}

.prompt-section {
	margin-bottom: 40rpx;
}

.prompt-box {
	background: #f8f8f8;
	border-radius: 16rpx;
	padding: 20rpx;
}

.prompt-text {
	font-size: 26rpx;
	color: #333;
	line-height: 1.6;
}

.dimensions-list {
	padding: 20rpx;
	margin: 20rpx 0 120rpx 0;
}

.list-header {
	display: flex;
	justify-content: flex-end;
	margin-bottom: 20rpx;
}

.total-score {
	font-size: 28rpx;
	color: #666;
	background: #f8f8f8;
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
}

.dimension-item {
	background: #fff;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	padding: 24rpx;
	display: flex;
	align-items: center;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	transition: all 0.3s ease;
	animation: slideIn 0.5s ease forwards;
	opacity: 0;
	transform: translateY(20rpx);
}

.dimension-item:active {
	transform: scale(0.98);
}

.dimension-info {
	flex: 1;
	margin-right: 20rpx;
}

.dimension-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.dimension-name {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.dimension-score {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.score-bar {
	height: 6rpx;
	background: #f0f0f0;
	border-radius: 3rpx;
	overflow: hidden;
}

.score-progress {
	height: 100%;
	background: #333;
	border-radius: 3rpx;
	transition: width 0.3s ease;
}

.delete-btn {
	border-radius: 20rpx;
	transition: all 0.3s ease;
}

.delete-btn:active {
	background: #f8f8f8;
}

.delete-icon {
	font-size: 32rpx;
	color: #999;
}

.empty-state {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 200rpx;
	background: #f8f8f8;
	border-radius: 16rpx;
	margin-top: 40rpx;
}

.empty-text {
	font-size: 26rpx;
	color: #999;
}

@keyframes slideIn {
	from {
		opacity: 0;
		transform: translateY(20rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.animate-in {
	animation: slideIn 0.5s ease forwards;
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
	position: fixed;
	bottom: 40rpx;
	left: 30rpx;
	right: 30rpx;
	width: auto;
	opacity: 1;
	transition: all 0.3s ease;
}

.confirm-btn.disabled {
	opacity: 0.6;
	background: #999;
}

button::after {
	border: none;
}

.action-btns {
	display: flex;
	gap: 20rpx;
}

.action-btn {
	width: 60rpx;
	height: 60rpx;
	background: #f8f8f8;
	border-radius: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.action-icon {
	font-size: 36rpx;
	color: #333;
}

.action-text {
	font-size: 24rpx;
	color: #333;
	font-weight: bold;
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
	background: #fff;
	border-radius: 20rpx;
	padding: 40rpx;
}

.modal-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	text-align: center;
	margin-bottom: 40rpx;
}

.input-group {
	margin-bottom: 40rpx;
}

.modal-input {
	height: 80rpx;
	background: #f8f8f8;
	border-radius: 12rpx;
	padding: 0 20rpx;
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
	color: #333;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
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
</style> 