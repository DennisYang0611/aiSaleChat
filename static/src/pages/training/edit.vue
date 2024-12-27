<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="header">
			<view class="header-left">
				<view class="back-btn" @tap="handleBack">
					<text class="back-icon">←</text>
				</view>
				<text class="header-title">编辑训练场景</text>
			</view>
			<view class="header-right">
				<view class="save-btn" @tap="handleSave">
					<text class="save-text">保存</text>
				</view>
			</view>
		</view>

		<!-- 基本信息区域 -->
		<view class="basic-info">
			<view class="avatar-section">
				<image class="avatar" :src="agent.avatar" mode="aspectFill" @tap="handleChangeAvatar" />
				<text class="avatar-tip">点击更换头像</text>
			</view>
			
			<view class="form-item">
				<text class="form-label">场景名称</text>
				<input class="form-input" v-model="agent.name" placeholder="请输入场景名称" />
			</view>
			
			<view class="form-item">
				<text class="form-label">场景简介</text>
				<textarea class="form-textarea" v-model="agent.description" placeholder="请输入场景简介" />
			</view>
		</view>

		<!-- 提示词区域 -->
		<view class="prompt-area">
			<view class="form-item">
				<text class="form-label">提示词</text>
				<textarea class="form-textarea" v-model="agent.promptText" placeholder="请输入提示词" />
			</view>
		</view>

		<!-- 评分维度区域 -->
		<view class="dimensions-area">
			<view class="form-item">
				<text class="form-label">评分维度</text>
				<view class="dimensions-list">
					<view class="dimension-item" v-for="(item, index) in agent.ratingDimensions" :key="index">
						<view class="dimension-content">
							<input class="dimension-name" type="text" v-model="item.keyword" placeholder="维度名称" />
							<view class="score-control">
								<text class="score-btn minus" @tap="handleScoreChange(index, -5)">-</text>
								<input class="score-input" type="number" v-model="item.score"
									@input="handleScoreInput(index, $event)" />
								<text class="score-btn plus" @tap="handleScoreChange(index, 5)">+</text>
							</view>
						</view>
						<view class="dimension-slider">
							<slider :value="item.score" min="0" max="100" activeColor="#8b5cf6" backgroundColor="rgba(99, 102, 241, 0.1)" block-size="24"
								@change="handleSliderChange(index, $event)" />
						</view>
					</view>
				</view>

				<!-- 添加维度按钮 -->
				<view class="add-dimension" @tap="handleAddDimension">
					<text class="add-icon">+</text>
					<text class="add-text">添加评分维度</text>
				</view>
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

interface Agent {
	name: string;
	avatar: string;
	description: string;
	promptText: string;
	ratingDimensions: Dimension[];
}

export default Vue.extend({
	data() {
		return {
			agentId: '',
			agent: {
				name: '',
				avatar: '',
				description: '',
				promptText: '',
				ratingDimensions: [] as Dimension[]
			} as Agent
		}
	},
	async onLoad(options) {
		this.agentId = options?.agentId;
		const { data: editData } = await request<any>({
			url: '/agent/' + this.agentId,
			method: 'GET'
		});
		if (editData) {
			this.agent = editData;
		} else {
			uni.showToast({
				title: '获取数据失败',
				icon: 'none'
			});
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);
		}
	},
	computed: {
		totalScore(): number {
			return this.agent.ratingDimensions.reduce((sum: number, item: Dimension) => sum + Number(item.score), 0);
		}
	},
	methods: {
		
		handleBack() {
			uni.redirectTo({
				url: '/pages/index/index'
			});
		},
		handleScoreChange(index: number, delta: number) {
			const newScore = Number(this.agent.ratingDimensions[index].score) + delta;
			if (newScore >= 0 && newScore <= 100) {
				this.$set(this.agent.ratingDimensions, index, {
					...this.agent.ratingDimensions[index],
					score: newScore
				});
			}
		},
		handleScoreInput(index: number, event: any) {
			let value = parseInt(event.detail.value);
			if (isNaN(value)) value = 0;
			if (value < 0) value = 0;
			if (value > 100) value = 100;
			this.$set(this.agent.ratingDimensions, index, {
				...this.agent.ratingDimensions[index],
				score: value
			});
		},
		handleSliderChange(index: number, event: any) {
			this.$set(this.agent.ratingDimensions, index, {
				...this.agent.ratingDimensions[index],
				score: event.detail.value
			});
		},
		handleAddDimension() {
			this.agent.ratingDimensions.push({ keyword: '', score: 50 });
		},
		handleChangeAvatar() {
			uni.chooseImage({
				count: 1,
				success: (res) => {
					const tempFilePath = res.tempFilePaths[0];
					// 这里可以添加上传图片的逻辑
					this.agent.avatar = tempFilePath;
				}
			});
		},
		async handleSave() {
			console.log(this.agent.ratingDimensions);

			if (!this.agent.name.trim()) {
				uni.showToast({
					title: '请输入场景名称',
					icon: 'none'
				});
				return;
			}

			if (!this.agent.promptText.trim()) {
				uni.showToast({
					title: '请输入提示词',
					icon: 'none'
				});
				return;
			}

			if (this.agent.ratingDimensions.length === 0) {
				uni.showToast({
					title: '请添加评分维度',
					icon: 'none'
				});
				return;
			}

			const totalScore = this.agent.ratingDimensions.reduce((sum: number, dim: Dimension) => sum + dim.score, 0);
			if (totalScore !== 100) {
				uni.showToast({
					title: '评分维度总分必须为100',
					icon: 'none'
				});
				return;
			}

			try {
				await request({
					url: '/agent/' + this.agentId,
					method: 'PATCH',
					data: this.agent
				});

				uni.showToast({
					title: '保存成功',
					icon: 'success',
					duration: 1500
				});

				setTimeout(() => {
					// uni.navigateBack();
				}, 1500);
			} catch (error) {
				console.error('保存失败:', error);
				uni.showToast({
					title: '保存失败',
					icon: 'none'
				});
			}
		}
	}
});
</script>

<style>
/* 基础样式 */
.container {
	background: #ffffff;
	min-height: 100vh;
	padding: 40rpx;
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

/* 头部样式 */
.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 40rpx;
}

.header-left {
	display: flex;
	align-items: center;
}

.header-right {
	display: flex;
	align-items: center;
}

.back-btn {
	width: 72rpx;
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(99, 102, 241, 0.05);
	border-radius: 12rpx;
	margin-right: 20rpx;
}

.back-icon {
	color: #6366f1;
	font-size: 36rpx;
}

.header-title {
	color: #333;
	font-size: 36rpx;
	font-weight: 600;
}

.save-btn {
	padding: 12rpx 24rpx;
	background: linear-gradient(135deg, #818cf8 0%, #8b5cf6 100%);
	border-radius: 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.2);
	transition: all 0.3s ease;
	min-width: 120rpx;
	text-align: center;
}

.save-btn:active {
	transform: scale(0.95);
	box-shadow: 0 2rpx 8rpx rgba(99, 102, 241, 0.15);
}

.save-text {
	color: #fff;
	font-size: 28rpx;
	font-weight: 500;
}

/* 提示词区域 */
.prompt-area {
	margin-bottom: 40rpx;
}

.prompt-box {
	height: 200rpx;
	background: #ffffff;
	border-radius: 16rpx;
	padding: 20rpx 30rpx;
	font-size: 28rpx;
	width: 100%;
	box-sizing: border-box;
	border: 1px solid rgba(99, 102, 241, 0.15);
}

/* 评分维度区域 */
.dimensions-area {
	margin-bottom: 100rpx;
	background: #fff;
}

.dimensions-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	width: 100%;
}

.dimension-item {
	background: rgba(99, 102, 241, 0.05);
	border: 1px solid rgba(99, 102, 241, 0.1);
	border-radius: 12rpx;
	padding: 24rpx;
	width: 100%;
	box-sizing: border-box;
}

.dimension-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.dimension-name {
	flex: 1;
	height: 60rpx;
	font-size: 28rpx;
	margin-right: 20rpx;
}

.score-control {
	display: flex;
	align-items: center;
	gap: 16rpx;
	background: #fff;
	border-radius: 30rpx;
	padding: 8rpx 16rpx;
	border: 1px solid rgba(99, 102, 241, 0.15);
}

.score-btn {
	width: 44rpx;
	height: 44rpx;
	background: linear-gradient(135deg, #818cf8 0%, #8b5cf6 100%);
	color: #fff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	box-shadow: 0 2rpx 4rpx rgba(99, 102, 241, 0.15);
	transition: all 0.3s ease;
}

.score-btn:active {
	transform: scale(0.9);
	opacity: 0.9;
}

.score-input {
	width: 80rpx;
	text-align: center;
	font-size: 28rpx;
	color: #333;
}

.dimension-slider {
	padding: 0 12rpx;
	margin: 0 8rpx;
}

/* 自定义滑块样式 */
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

/* 未选中的轨道颜色 */
.uni-slider {
	margin: 12rpx 0 !important;
}

.uni-slider-wrapper {
	height: 4rpx !important;
}

.add-dimension {
	margin-top: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	padding: 20rpx 0;
	border: 2rpx dashed rgba(99, 102, 241, 0.3);
	border-radius: 16rpx;
	background: rgba(99, 102, 241, 0.02);
	transition: all 0.3s ease;
}

.add-dimension:active {
	background: rgba(99, 102, 241, 0.05);
}

.add-icon {
	font-size: 32rpx;
	color: #6366f1;
}

.add-text {
	font-size: 28rpx;
	color: #6366f1;
}

/* 标题和标签文字 */
.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 20rpx;
}

.dimension-label {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 12rpx;
}

/* 错误提示 */
.error-text {
	color: #ef4444;
	font-size: 24rpx;
	margin-top: 8rpx;
}

/* 总分提示 */
.total-score {
	font-size: 28rpx;
	color: #666;
	margin-top: 20rpx;
	text-align: right;
}

.total-score.warning {
	color: #ef4444;
}

.total-score.success {
	color: #10b981;
}

/* 响应式样式保持不变 */
@media screen and (max-width: 375px) {
	.container {
		padding: 0 24rpx;
	}

	.header-title {
		font-size: 32rpx;
	}
}

@media screen and (min-width: 768px) {
	.container {
		max-width: 1200rpx;
		margin: 0 auto;
	}

	.dimensions-list {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 30rpx;
	}
}

.basic-info {
	margin-bottom: 40rpx;
	padding: 24rpx;
	background: rgba(99, 102, 241, 0.02);
	border-radius: 16rpx;
	border: 1px solid rgba(99, 102, 241, 0.1);
}

.avatar-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 24rpx;
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	margin-bottom: 12rpx;
	border: 2rpx solid rgba(99, 102, 241, 0.2);
	background: #fff;
}

.avatar-tip {
	font-size: 24rpx;
	color: #666;
}

.form-input {
	width: 100%;
	height: 80rpx;
	background: #ffffff;
	border-radius: 12rpx;
	padding: 0 24rpx;
	font-size: 28rpx;
	box-sizing: border-box;
	border: 1px solid rgba(99, 102, 241, 0.15);
}

.form-textarea {
	width: 100%;
	height: 160rpx;
	background: #ffffff;
	border-radius: 12rpx;
	padding: 20rpx 24rpx;
	font-size: 28rpx;
	box-sizing: border-box;
	border: 1px solid rgba(99, 102, 241, 0.15);
}

.form-label {
	font-size: 28rpx;
	color: #333;
	margin-bottom: 16rpx;
	display: block;
}
</style>