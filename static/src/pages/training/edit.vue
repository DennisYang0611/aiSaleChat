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

		<!-- 基本信息区域 -->
		<view class="basic-info">
			<!-- 头像 -->
			<view class="avatar-area" @tap="handleChangeAvatar">
				<default-avatar></default-avatar>
				<view class="change-avatar">
					<text class="change-text">更换头像</text>
				</view>
			</view>
			
			<!-- 名称和简介 -->
			<view class="info-form">
				<view class="form-item">
					<text class="form-label">训练名称</text>
					<input 
						class="input-box"
						type="text"
						v-model="formData.name"
						placeholder="请输入训练名称"
					/>
				</view>
				<view class="form-item">
					<text class="form-label">训练简介</text>
					<textarea 
						class="textarea-box"
						v-model="formData.description"
						placeholder="请输入训练简介"
					/>
				</view>
			</view>
		</view>

		<!-- 提示词区域 -->
		<view class="prompt-area">
			<view class="form-item">
				<text class="form-label">提示词</text>
				<textarea 
					class="prompt-box"
					v-model="formData.prompt"
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
						v-for="(item, index) in formData.dimensions"
						:key="index"
					>
						<view class="dimension-content">
							<input 
								class="dimension-name"
								type="text"
								v-model="item.name"
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
import DefaultAvatar from '@/components/DefaultAvatar.vue';

export default Vue.extend({
	components: {
		DefaultAvatar
	},
	data() {
		return {
			formData: {
				name: '',
				description: '',
				prompt: '',
				dimensions: [
					{ name: '', score: 50 }
				]
			}
		}
	},
	computed: {
		totalScore(): number {
			return this.formData.dimensions.reduce((sum, item) => sum + Number(item.score), 0);
		}
	},
	methods: {
		handleBack() {
			uni.reLaunch({
				url: '/pages/index/index'
			});
		},
		handleChangeAvatar() {
			uni.chooseImage({
				count: 1,
				success: (res) => {
					console.log('选择图片', res.tempFilePaths[0]);
					// 这里处理头像上传逻辑
				}
			});
		},
		handleScoreChange(index: number, delta: number) {
			const newScore = Number(this.formData.dimensions[index].score) + delta;
			if (newScore >= 0 && newScore <= 100) {
				this.formData.dimensions[index].score = newScore;
			}
		},
		handleScoreInput(index: number, event: any) {
			let value = parseInt(event.detail.value);
			if (isNaN(value)) value = 0;
			if (value < 0) value = 0;
			if (value > 100) value = 100;
			this.formData.dimensions[index].score = value;
		},
		handleSliderChange(index: number, event: any) {
			this.formData.dimensions[index].score = event.detail.value;
		},
		handleAddDimension() {
			this.formData.dimensions.push({ name: '', score: 50 });
		},
		handleSave() {
			// 验证总分是否超过100
			if (this.totalScore > 100) {
				uni.showToast({
					title: '总分不能超过100分',
					icon: 'none'
				});
				return;
			}
			
			console.log('保存训练', this.formData);
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

/* 基本信息区域 */
.basic-info {
	background: #F8F8F8;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 40rpx;
}

.avatar-area {
	width: 160rpx;
	height: 160rpx;
	margin: 0 auto 30rpx;
	position: relative;
	border-radius: 80rpx;
	overflow: hidden;
}

.change-avatar {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 50rpx;
	background: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
}

.change-text {
	color: #fff;
	font-size: 24rpx;
}

.info-form {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.form-item {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.form-label {
	font-size: 28rpx;
	color: #666;
	padding-left: 4rpx;
}

.input-box {
	height: 90rpx;
	background: #fff;
	border-radius: 16rpx;
	padding: 0 30rpx;
	font-size: 32rpx;
	width: 100%;
	box-sizing: border-box;
}

.textarea-box {
	height: 180rpx;
	background: #fff;
	border-radius: 16rpx;
	padding: 20rpx 30rpx;
	font-size: 32rpx;
	width: 100%;
	box-sizing: border-box;
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
	
	.avatar-area {
		width: 120rpx;
		height: 120rpx;
	}
}

@media screen and (min-width: 768px) {
	.container {
		max-width: 1200rpx;
		margin: 0 auto;
	}
	
	.basic-info {
		display: flex;
		gap: 40rpx;
		align-items: flex-start;
	}
	
	.avatar-area {
		margin: 0;
	}
	
	.info-form {
		flex: 1;
	}
	
	.dimensions-list {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 30rpx;
	}
}
</style>