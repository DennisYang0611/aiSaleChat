<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="header">
			<view class="back-btn" @tap="handleBack">
				<text class="back-icon">←</text>
			</view>
			<text class="header-title">编辑训练</text>
			<view class="save-btn" @tap="handleSave">
				<text class="save-text">保存</text>
			</view>
		</view>

		<!-- 提示词区域 -->
		<view class="prompt-area">
			<view class="form-item">
				<text class="form-label">提示词</text>
				<textarea 
					class="prompt-box"
					v-model="promptText"
					placeholder="请输入提示词"
				/>
			</view>
		</view>

		<!-- 评分维度区域 -->
		<view class="dimensions-area">
			<view class="form-item">
				<text class="form-label">评分维度</text>
				<view class="dimensions-list">
					<view 
						class="dimension-item"
						v-for="(item, index) in dimensions"
						:key="index"
					>
						<view class="dimension-content">
							<input 
								class="dimension-name"
								type="text"
								v-model="item.keyword"
								placeholder="维度名称"
							/>
							<view class="score-control">
								<text 
									class="score-btn minus" 
									@tap="handleScoreChange(index, -5)"
								>-</text>
								<input 
									class="score-input"
									type="number"
									v-model="item.score"
									@input="handleScoreInput(index, $event)"
								/>
								<text 
									class="score-btn plus" 
									@tap="handleScoreChange(index, 5)"
								>+</text>
							</view>
						</view>
						<view class="dimension-slider">
							<slider 
								:value="item.score"
								min="0"
								max="100"
								activeColor="#333"
								backgroundColor="#E5E5E5"
								block-size="24"
								@change="handleSliderChange(index, $event)"
							/>
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
import Vue from 'vue';

interface Dimension {
	keyword: string;
	score: number;
}

interface Agent {
	prompt: string;
	dimensions: Dimension[];
	createTime: number;
}

export default Vue.extend({
	data() {
		return {
			currentIndex: -1,
			promptText: '',
			dimensions: [] as Dimension[]
		}
	},
	onLoad() {
		const editData = uni.getStorageSync('currentEditAgent');
		if (editData) {
			this.currentIndex = editData.index;
			this.promptText = editData.data.prompt;
			this.dimensions = editData.data.dimensions;
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
			return this.dimensions.reduce((sum: number, item: Dimension) => sum + Number(item.score), 0);
		}
	},
	methods: {
		handleBack() {
			uni.redirectTo({
				url: '/pages/index/index'
			});
		},
		handleScoreChange(index: number, delta: number) {
			const newScore = Number(this.dimensions[index].score) + delta;
			if (newScore >= 0 && newScore <= 100) {
				this.$set(this.dimensions[index], 'score', newScore);
			}
		},
		handleScoreInput(index: number, event: any) {
			let value = parseInt(event.detail.value);
			if (isNaN(value)) value = 0;
			if (value < 0) value = 0;
			if (value > 100) value = 100;
			this.$set(this.dimensions[index], 'score', value);
		},
		handleSliderChange(index: number, event: any) {
			this.$set(this.dimensions[index], 'score', event.detail.value);
		},
		handleAddDimension() {
			this.dimensions.push({ keyword: '', score: 50 });
		},
		handleSave() {
			if (!this.promptText.trim()) {
				uni.showToast({
					title: '请输入提示词',
					icon: 'none'
				});
				return;
			}

			if (this.dimensions.length === 0) {
				uni.showToast({
					title: '请添加评分维度',
					icon: 'none'
				});
				return;
			}

			const totalScore = this.dimensions.reduce((sum, dim) => sum + dim.score, 0);
			if (totalScore !== 100) {
				uni.showToast({
					title: '评分维度总分必须为100',
					icon: 'none'
				});
				return;
			}

			try {
				const agents = uni.getStorageSync('agents') || [];
				agents[this.currentIndex] = {
					prompt: this.promptText,
					dimensions: this.dimensions,
					createTime: new Date().getTime()
				};
				
				uni.setStorageSync('agents', agents);
				uni.removeStorageSync('currentEditAgent');

				uni.showToast({
					title: '保存成功',
					icon: 'success',
					duration: 1500
				});

				setTimeout(() => {
					uni.navigateBack();
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
	min-height: 100vh;
	background-color: #fff;
	padding: 0 32rpx;
}

/* 头部样式 */
.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 40rpx 0;
	margin-bottom: 20rpx;
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

.save-btn {
	padding: 12rpx 24rpx;
	background: #333;
	border-radius: 30rpx;
}

.save-text {
	color: #fff;
	font-size: 28rpx;
}

/* 提示词区域 */
.prompt-area {
	margin-bottom: 40rpx;
}

.prompt-box {
	height: 200rpx;
	background: #F8F8F8;
	border-radius: 16rpx;
	padding: 20rpx 30rpx;
	font-size: 28rpx;
	width: 100%;
	box-sizing: border-box;
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
	background: #F8F8F8;
	border-radius: 16rpx;
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
}

.score-btn {
	width: 44rpx;
	height: 44rpx;
	background: #333;
	color: #fff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
}

.score-input {
	width: 80rpx;
	text-align: center;
	font-size: 28rpx;
}

.dimension-slider {
	padding: 0 12rpx;
}

.add-dimension {
	margin-top: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	padding: 20rpx 0;
	border: 2rpx dashed #ccc;
	border-radius: 16rpx;
}

.add-icon {
	font-size: 32rpx;
	color: #666;
}

.add-text {
	font-size: 28rpx;
	color: #666;
}

/* 响应式适配 */
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
</style>