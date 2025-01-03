<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="header">
			<view class="back-btn" @tap="handleBack">
				<text class="back-icon">←</text>
			</view>
			<text class="header-title">填写评分维度</text>
			<view class="ai-btn" @tap="handleAIGenerate">
				<text class="ai-text">AI生成</text>
			</view>
		</view>

		<!-- 总评分显示 -->
		<view class="total-score">
			<text class="total-label">总评分</text>
			<text class="total-value" :class="{ 'over-limit': totalScore > 100 }">
				{{ totalScore }}/100
			</text>
		</view>

		<!-- 评分维度列表 -->
		<view class="dimension-list">
			<view 
				class="dimension-item" 
				v-for="(item, index) in dimensions" 
				:key="index"
			>
				<!-- 关键词输入 -->
				<view class="keyword-area">
					<input 
						class="keyword-input"
						type="text"
						v-model="item.keyword"
						placeholder="输入评分关键词"
					/>
				</view>
				
				<!-- 分值选择 -->
				<view class="score-area">
					<view class="score-header">
						<text class="score-label">分值</text>
						<input 
							class="score-input"
							type="number"
							v-model="item.score"
							@input="handleScoreInput(index, $event)"
							:maxlength="3"
						/>
					</view>
					<view class="slider-container">
						<slider 
							:value="item.score"
							min="0"
							max="100"
							show-value
							activeColor="#333"
							backgroundColor="#E5E5E5"
							block-size="24"
							@change="handleSliderChange(index, $event)"
						/>
					</view>
				</view>
				
				<!-- 操作按钮 -->
				<view class="action-btns">
					<view class="action-btn delete" @tap="handleDelete(index)">
						<text class="icon">🗑</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 添加按钮 -->
		<view class="add-dimension" @tap="handleAdd">
			<text class="add-icon">+</text>
			<text class="add-text">添加评分维度</text>
		</view>

		<!-- 底部按钮 -->
		<button class="submit-btn" @tap="handleConfirm">创建完成</button>

		<!-- 加载遮罩 -->
		<view class="loading-mask" v-if="isThinking">
			<view class="loading-content">
				<view class="dynamic-logo">
					<view class="orbit">
						<view class="dot dot1 animate-dot"></view>
						<view class="dot dot2 animate-dot"></view>
						<view class="dot dot3 animate-dot"></view>
						<view class="dot dot4 animate-dot"></view>
						<view class="circle-line"></view>
					</view>
				</view>
				
				<view class="thinking-text">
					<text>AI正在思考中</text>
					<view class="dots">
						<text class="dot">.</text>
						<text class="dot">.</text>
						<text class="dot">.</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 保存加载动画 -->
		<view class="loading-mask" v-if="isSaving">
			<view class="loading-content">
				<view class="loading-spinner"></view>
				<text class="loading-text">{{ loadingText }}</text>
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

export default Vue.extend({
	data() {
		return {
			promptText: '',
			dimensions: [] as Dimension[],
			isThinking: false,
			thinkingTimer: null as any,
			isSaving: false,
			loadingText: '正在生成简介...'
		}
	},
	onLoad() {
		// 获取评分数据
		const evaluationData = uni.getStorageSync('evaluationData');
		if (evaluationData) {
			this.promptText = evaluationData.promptText;
			// 确保至少有一个维度
			this.dimensions = evaluationData.dimensions.length > 0 
				? evaluationData.dimensions 
				: [{ keyword: '', score: 50 }];
			// 清理数据
			uni.removeStorageSync('evaluationData');
		} else {
			// 如果没有数据，初始化一个默认维度
			this.dimensions = [{ keyword: '', score: 50 }];
		}
	},
	computed: {
		totalScore(): number {
			return this.dimensions.reduce((sum, item) => sum + Number(item.score), 0);
		}
	},
	beforeDestroy() {
		if (this.thinkingTimer) {
			clearTimeout(this.thinkingTimer);
		}
	},
	methods: {
		handleBack() {
				uni.navigateBack();
		},
		handleAIGenerate() {
			this.isThinking = true;
			this.thinkingTimer = setTimeout(() => {
				// 直接更新当前页面的维度数据
				this.dimensions = [
					{ keyword: '语言表达', score: 40 },
					{ keyword: '专业知识', score: 35 },
					{ keyword: '应变能力', score: 25 }
				];
				this.isThinking = false;
				this.thinkingTimer = null;
				
				// 显示生成成功提示
				uni.showToast({
					title: 'AI生成成功',
					icon: 'success',
					duration: 2000
				});
			}, 2000);
		},
		handleThinkingCancel() {
			if (this.thinkingTimer) {
				clearTimeout(this.thinkingTimer);
				this.thinkingTimer = null;
			}
			this.isThinking = false;
		},
		handleAdd() {
			this.dimensions.push({ keyword: '', score: 50 });
		},
		handleScoreInput(index: number, event: any) {
			let value = parseInt(event.detail.value);
			if (isNaN(value)) value = 0;
			if (value < 0) value = 0;
			if (value > 100) value = 100;
			
			const oldValue = this.dimensions[index].score;
			const diff = value - oldValue;
			const newTotal = this.totalScore + diff;
			
			if (newTotal > 100) {
				uni.showToast({
					title: '总分不能超过100分',
					icon: 'none'
				});
				return;
			}
			
			this.$set(this.dimensions[index], 'score', value);
		},
		handleSliderChange(index: number, event: any) {
			const value = event.detail.value;
			
			// 计算如果修改这个值，总分是否会超过100
			const oldValue = this.dimensions[index].score;
			const diff = value - oldValue;
			const newTotal = this.totalScore + diff;
			
			if (newTotal > 100) {
				uni.showToast({
					title: '总分不能超过100分',
					icon: 'none'
				});
				return;
			}
			
			this.dimensions[index].score = value;
		},
		handleDelete(index: number) {
			if (this.dimensions.length > 1) {
				this.dimensions.splice(index, 1);
			} else {
				uni.showToast({
					title: '至少保留一个评分维度',
					icon: 'none'
				});
			}
		},
		async generateDescription() {
			try {
				const dimensionsText = this.dimensions
					.map(d => `${d.keyword}(${d.score}分)`)
					.join('、');

				const response = await uni.request({
					url: 'https://api.fastgpt.in/api/v1/chat/completions',
					method: 'POST',
					header: {
						'Authorization': 'Bearer fastgpt-wYCt6yx1YLzlRinJeJXeF07SebGRpxFXMVltL2IXSwUmfgr8vGdrX',
						'Content-Type': 'application/json'
					},
					data: {
						chatId: Math.random().toString(36).substring(7),
						stream: false,
						detail: false,
						responseChatItemId: 'my_responseChatItemId',
						variables: {
							prompt: this.promptText,
							dimension: dimensionsText
						},
						messages: [
							{
								role: 'user',
								content: `请根据以下信息生成一段简短的训练场景简介（50字以内）：\n角色信息：${this.promptText}\n评分维度：${dimensionsText}\n要求：简明扼要地描述训练目标和关键点。`
							}
						]
					}
				});

				if (response.statusCode === 200 && response.data) {
					const aiResponse = response.data as any;
					console.log('API返回数据:', aiResponse); // 调试用
					if (aiResponse.choices?.[0]?.message?.content) {
						return aiResponse.choices[0].message.content.trim();
					}
					if (typeof aiResponse === 'string') {
						return aiResponse.trim();
					}
				}
				throw new Error('生成简介失败');
			} catch (error) {
				console.error('生成简介错误:', error);
				throw error;
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
				uni.showToast({
					title: '总分必须等于100分',
					icon: 'none'
				});
				return;
			}

			try {
				this.isSaving = true;
				this.loadingText = '正在生成简介...';

				// 生成简介
				const description = await this.generateDescription();

				this.loadingText = '正在保存...';

				// 保存提示词和维度的关联数据
				const agentData = {
					prompt: this.promptText,
					dimensions: this.dimensions,
					description: description,
					createTime: new Date().getTime()
				};

				console.log('保存的数据:', agentData); // 调试用

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
				this.isSaving = false;
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
	padding: 0 32rpx;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 40rpx 0;
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

.header-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.ai-btn {
	padding: 12rpx 24rpx;
	background: #333;
	border-radius: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.ai-text {
	color: #FFFFFF;
	font-size: 28rpx;
}

.dimension-list {
	padding: 20rpx 0;
}

.dimension-item {
	background: #F8F8F8;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
}

.keyword-area {
	margin-bottom: 20rpx;
}

.keyword-input {
	height: 60rpx;
	font-size: 32rpx;
	color: #333;
}

.score-area {
	margin-bottom: 20rpx;
}

.score-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.score-label {
	font-size: 28rpx;
	color: #666;
}

.score-input {
	width: 100rpx;
	height: 60rpx;
	background: #fff;
	border: 2rpx solid #E5E5E5;
	border-radius: 8rpx;
	text-align: center;
	font-size: 28rpx;
}

.slider-container {
	padding: 0 12rpx;
}

.action-btns {
	display: flex;
	justify-content: flex-end;
}

.action-btn {
	width: 60rpx;
	height: 60rpx;
	background: #fff;
	border-radius: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.icon {
	font-size: 32rpx;
	color: #FF3B30;
}

.add-dimension {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 30rpx 0;
	gap: 12rpx;
}

.add-icon {
	font-size: 32rpx;
	color: #333;
}

.add-text {
	font-size: 28rpx;
	color: #333;
}

.submit-btn {
	position: fixed;
	bottom: 40rpx;
	left: 40rpx;
	right: 40rpx;
	height: 100rpx;
	background: #333;
	border-radius: 16rpx;
	color: #fff;
	font-size: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

button::after {
	border: none;
}

.total-score {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 30rpx;
	background: #F8F8F8;
	border-radius: 16rpx;
	margin-bottom: 30rpx;
}

.total-label {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.total-value {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.total-value.over-limit {
	color: #FF3B30;
}

/* 加载遮罩样式 */
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
	z-index: 999;
}

.loading-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
}

.dynamic-logo {
	width: 300rpx;
	height: 300rpx;
	position: relative;
}

.orbit {
	width: 100%;
	height: 100%;
	position: relative;
	animation: orbit-rotate 8s linear infinite;
}

.dot {
	position: absolute;
	width: 24rpx;
	height: 24rpx;
	background-color: #000;
	border-radius: 50%;
}

.dot1 { top: 0; left: 50%; transform: translateX(-50%); }
.dot2 { right: 0; top: 50%; transform: translateY(-50%); }
.dot3 { bottom: 0; left: 50%; transform: translateX(-50%); }
.dot4 { left: 0; top: 50%; transform: translateY(-50%); }

.animate-dot {
	animation: dot-pulse 2s ease-in-out infinite;
}

.circle-line {
	position: absolute;
	width: 100%;
	height: 100%;
	border: 4rpx solid #000;
	border-radius: 50%;
	animation: pulse 2s ease-in-out infinite;
}

.thinking-text {
	display: flex;
	align-items: center;
	gap: 8rpx;
	font-size: 32rpx;
	color: #333;
}

.dots {
	display: flex;
}

.dots .dot {
	position: static;
	width: auto;
	height: auto;
	background: none;
	animation: dotFade 1.5s ease-in-out infinite;
	opacity: 0;
}

.dots .dot:nth-child(1) { animation-delay: 0s; }
.dots .dot:nth-child(2) { animation-delay: 0.5s; }
.dots .dot:nth-child(3) { animation-delay: 1s; }

@keyframes orbit-rotate {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

@keyframes dot-pulse {
	0% { transform: scale(1); opacity: 0.5; }
	50% { transform: scale(1.5); opacity: 1; }
	100% { transform: scale(1); opacity: 0.5; }
}

@keyframes pulse {
	0% { transform: scale(1); opacity: 0.5; }
	50% { transform: scale(1.1); opacity: 1; }
	100% { transform: scale(1); opacity: 0.5; }
}

@keyframes dotFade {
	0% { opacity: 0; }
	50% { opacity: 1; }
	100% { opacity: 0; }
}

/* 小屏幕适配 (< 375px) */
@media screen and (max-width: 375px) {
	.container {
		padding: 0 24rpx;
	}

	.header-title {
		font-size: 32rpx;
	}

	.ai-btn {
		padding: 10rpx 20rpx;
	}

	.dimension-item {
		padding: 24rpx;
	}

	.score-input {
		width: 80rpx;
		height: 56rpx;
	}

	.action-btn {
		width: 56rpx;
		height: 56rpx;
	}
}

/* 大屏幕适配 (> 768px) */
@media screen and (min-width: 768px) {
	.container {
		padding: 0 60rpx;
		max-width: 1200rpx;
		margin: 0 auto;
	}

	.header-title {
		font-size: 40rpx;
	}

	.dimension-item {
		padding: 40rpx;
	}

	.keyword-input {
		font-size: 36rpx;
	}

	.score-input {
		width: 120rpx;
		height: 70rpx;
	}

	.slider-container {
		padding: 0 20rpx;
	}
}

/* iPad 和平板适配 */
@media screen and (min-width: 768px) and (max-width: 1024px) {
	.dimension-list {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 30rpx;
	}

	.dimension-item {
		margin-bottom: 0;
	}
}

/* 大屏桌面适配 */
@media screen and (min-width: 1024px) {
	.dimension-list {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 40rpx;
	}

	.dimension-item {
		margin-bottom: 0;
	}

	.submit-btn {
		width: 400rpx;
		left: 50%;
		transform: translateX(-50%);
	}
}

/* 加载遮罩响应式 */
@media screen and (max-width: 375px) {
	.dynamic-logo {
		width: 240rpx;
		height: 240rpx;
	}

	.thinking-text {
		font-size: 28rpx;
	}
}

@media screen and (min-width: 768px) {
	.dynamic-logo {
		width: 400rpx;
		height: 400rpx;
	}

	.thinking-text {
		font-size: 36rpx;
	}
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
	z-index: 999;
}

.loading-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
}

.loading-spinner {
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
</style> 