<template>
	<view class="container">
		<view class="content-wrapper">
			<!-- 顶部导航 -->
			<view class="header">
				<view class="back-btn" @tap="handleBack">
					<text class="back-icon">←</text>
				</view>
				<text class="header-title">创建一个Agent</text>
				<view class="ai-btn" @tap="handleAIGenerate" :class="{ 'generating': isLoading }">
					<text class="ai-text" v-if="!isLoading">AI生成</text>
				</view>
			</view>

			<!-- 头像区域 -->
			<view class="avatar-area">
				<view class="avatar-wrapper" @tap="handleUploadAvatar">
					<default-avatar></default-avatar>
					<view class="upload-mask">
						<view class="upload-icon">+</view>
						<text class="upload-text">上传头像</text>
					</view>
				</view>
			</view>

			<!-- 表单区域 -->
			<view class="form-area">
				<input 
					class="input-box" 
					type="text" 
					v-model="formData.name"
					placeholder="输入机器人的名字"
				/>
				<input 
					class="input-box" 
					type="text" 
					v-model="formData.scene"
					placeholder="输入对话的场景"
				/>
				<input 
					class="input-box" 
					type="text" 
					v-model="formData.customerProfile"
					placeholder="输入客户画像"
				/>
				<input 
					class="input-box" 
					type="text" 
					v-model="formData.buyingPower"
					placeholder="输入购买能力"
				/>
				<input 
					class="input-box" 
					type="text" 
					v-model="formData.consumptionHabits"
					placeholder="输入消费习惯"
				/>
				<input 
					class="input-box" 
					type="text" 
					v-model="formData.consumptionConcepts"
					placeholder="输入消费理念"
				/>
			</view>

			<!-- 提交按钮 -->
			<button class="submit-btn" @tap="handleSubmit">生成提示词</button>
		</view>

		<!-- AI生成遮罩层 -->
		<view class="generating-mask" v-if="isLoading">
			<view class="generating-content">
				<view class="brain-animation">
					<view class="brain-circle"></view>
					<view class="brain-waves">
						<view class="wave"></view>
						<view class="wave"></view>
						<view class="wave"></view>
					</view>
				</view>
				<view class="generating-text">
					<text class="main-text">AI思考中</text>
					<view class="dots-flow">
						<text class="dot"></text>
						<text class="dot"></text>
						<text class="dot"></text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';
import DefaultAvatar from '@/components/DefaultAvatar.vue';

interface AIResponse {
	id: string;
	model: string;
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
	choices: Array<{
		message: {
			role: string;
			content: string;
		};
		finish_reason: string;
		index: number;
	}>;
}

export default Vue.extend({
	components: {
		DefaultAvatar
	},
	data() {
		return {
			formData: {
				name: '',
				scene: '',
				customerProfile: '',
				buyingPower: '',
				consumptionHabits: '',
				consumptionConcepts: ''
			},
			isLoading: false
		}
	},
	methods: {
		handleBack() {
			uni.navigateBack();
		},
		handleAIGenerate() {
			this.isLoading = true;
			
			// 准备请求数据
			const requestData = {
				chatId: Math.random().toString(36).substring(7),
				stream: false,
				detail: false,
				responseChatItemId: 'my_responseChatItemId',
				variables: {
					name: this.formData.name,
					scene: this.formData.scene,
					customerProfile: this.formData.customerProfile,
					buyingPower: this.formData.buyingPower,
					consumptionHabits: this.formData.consumptionHabits,
					consumptionConcepts: this.formData.consumptionConcepts
				},
				messages: [
					{
						role: 'user',
						content: '生成'
					}
				]
			};
			
			// 发起请求
			uni.request({
				url: 'https://api.fastgpt.in/api/v1/chat/completions',
				method: 'POST',
				header: {
					'Authorization': 'Bearer fastgpt-iuAHavBMYZXKIl5mFoitrHHNcuBspxrCrcrA1GdIgKDsGc5kLePDQXZ6Zjrdg',
					'Content-Type': 'application/json'
				},
				data: requestData,
				success: (res: UniApp.RequestSuccessCallbackResult) => {
					try {
						// 解析返回的 content
						const response = res.data as AIResponse;
						const content = response.choices[0].message.content;
						const parsedContent = JSON.parse(content);
						
						// 更新表单数据
						this.formData = {
							...this.formData,
							...parsedContent
						};
						
						uni.showToast({
							title: 'AI生成成功',
							icon: 'success'
						});
					} catch (error) {
						uni.showToast({
							title: '解析响应失败',
							icon: 'none'
						});
					}
				},
				fail: () => {
					uni.showToast({
						title: '请求失败',
						icon: 'none'
					});
				},
				complete: () => {
					this.isLoading = false;
				}
			});
		},
		handleSubmit() {
			// 保存表单数据到本地存储
			uni.setStorageSync('agentFormData', this.formData);
			
			uni.navigateTo({
				url: '/pages/loading/index'
			});
		},
		handleUploadAvatar() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					const tempFilePath = res.tempFilePaths[0];
					// 这里可以添加上传到服务器的逻辑
					uni.showToast({
						title: '头像已更新',
						icon: 'success'
					});
				}
			});
		},
	}
});
</script>

<style>
.container {
	min-height: 100vh;
	background-color: #fff;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0;
}

.content-wrapper {
	display: flex;
	flex-direction: column;
	min-height: 100%;
	width: 100%;
	padding: 0 40rpx;
	box-sizing: border-box;
	max-width: 800rpx;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 40rpx 0;
	margin-bottom: 40rpx;
	flex-shrink: 0;
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
	background: linear-gradient(45deg, #333, #666);
	border-radius: 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 160rpx;
	position: relative;
	overflow: hidden;
	transition: all 0.3s ease;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.ai-btn.generating {
	opacity: 0.7;
	pointer-events: none;
}

.ai-text {
	color: #FFFFFF;
	font-size: 28rpx;
}

.avatar-area {
	display: flex;
	justify-content: center;
	margin: 20rpx auto 60rpx;
	width: 100%;
	flex-shrink: 0;
}

.form-area {
	margin: 0;
	display: grid;
	gap: 30rpx;
	flex: 1;
	width: 100%;
	min-height: 0;
	overflow-y: auto;
}

.input-box {
	width: 100%;
	height: 100rpx;
	background: #F8F8F8;
	border: none;
	border-radius: 16rpx;
	padding: 0 30rpx;
	font-size: 32rpx;
	transition: all 0.3s ease;
	box-sizing: border-box;
}

.input-box:focus {
	background: #fff;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	transform: translateY(-2rpx);
}

.submit-btn {
	width: 100%;
	height: 100rpx;
	background: linear-gradient(45deg, #333, #666);
	border-radius: 16rpx;
	color: #FFFFFF;
	font-size: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
	transition: all 0.3s ease;
	margin-top: 60rpx;
	margin-bottom: 40rpx;
	flex-shrink: 0;
}

.submit-btn:active {
	transform: translateY(2rpx);
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
}

button::after {
	border: none;
}

.generating-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.7);
	backdrop-filter: blur(8px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
}

.generating-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 40rpx;
}

.brain-animation {
	width: 200rpx;
	height: 200rpx;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.brain-circle {
	width: 80rpx;
	height: 80rpx;
	background: #fff;
	border-radius: 50%;
	animation: pulse 2s ease-in-out infinite;
}

.brain-waves {
	position: absolute;
	width: 100%;
	height: 100%;
}

.wave {
	position: absolute;
	border: 4rpx solid rgba(255, 255, 255, 0.5);
	border-radius: 50%;
	width: 100%;
	height: 100%;
	animation: wave 3s ease-out infinite;
	opacity: 0;
}

.wave:nth-child(2) {
	animation-delay: 1s;
}

.wave:nth-child(3) {
	animation-delay: 2s;
}

.generating-text {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
}

.main-text {
	color: #fff;
	font-size: 36rpx;
	font-weight: 500;
}

.dots-flow {
	display: flex;
	gap: 12rpx;
}

.dots-flow .dot {
	width: 12rpx;
	height: 12rpx;
	background: #fff;
	border-radius: 50%;
	animation: dotFlow 1.5s ease-in-out infinite;
}

.dots-flow .dot:nth-child(2) {
	animation-delay: 0.5s;
}

.dots-flow .dot:nth-child(3) {
	animation-delay: 1s;
}

@keyframes pulse {
	0% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
	}
	70% {
		transform: scale(1);
		box-shadow: 0 0 0 20rpx rgba(255, 255, 255, 0);
	}
	100% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
	}
}

@keyframes wave {
	0% {
		transform: scale(0);
		opacity: 1;
	}
	100% {
		transform: scale(1);
		opacity: 0;
	}
}

@keyframes dotFlow {
	0%, 100% {
		transform: translateY(0);
		opacity: 0.5;
	}
	50% {
		transform: translateY(-10rpx);
		opacity: 1;
	}
}

.avatar-wrapper {
	position: relative;
	width: 200rpx;
	height: 200rpx;
	border-radius: 50%;
	overflow: hidden;
	cursor: pointer;
	transition: all 0.3s ease;
	margin: 0 auto;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.avatar-wrapper:active {
	transform: scale(0.95);
}

.upload-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4));
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	opacity: 0;
	transition: opacity 0.3s ease;
}

.avatar-wrapper:hover .upload-mask {
	opacity: 1;
}

.upload-icon {
	font-size: 40rpx;
	color: #fff;
	margin-bottom: 8rpx;
}

.upload-text {
	font-size: 24rpx;
	color: #fff;
}

/* 移动端优化 */
@media screen and (max-width: 375px) {
	.container {
		padding: 0;
		background: linear-gradient(to bottom, #fff, #f8f8f8);
	}

	.content-wrapper {
		padding: 0 30rpx;
	}

	.header {
		padding: 30rpx 0;
		margin-bottom: 20rpx;
	}

	.avatar-area {
		margin: 10rpx auto 40rpx;
	}

	.avatar-wrapper {
		width: 180rpx;
		height: 180rpx;
	}

	.form-area {
		gap: 20rpx;
	}

	.input-box {
		height: 100rpx;
		font-size: 30rpx;
		background: rgba(248, 248, 248, 0.8);
		backdrop-filter: blur(10px);
	}

	.submit-btn {
		height: 100rpx;
		font-size: 32rpx;
		margin-top: 40rpx;
		margin-bottom: 30rpx;
		background: linear-gradient(45deg, #2c2c2c, #4a4a4a);
	}
}

/* 平板和桌面端优化 */
@media screen and (min-width: 768px) {
	.content-wrapper {
		padding: 40rpx;
	}

	.form-area {
		grid-template-columns: repeat(2, 1fr);
		gap: 32rpx;
		margin: 0 auto;
		max-width: 1200rpx;
	}

	.avatar-wrapper {
		width: 240rpx;
		height: 240rpx;
	}

	.input-box {
		height: 110rpx;
		font-size: 34rpx;
		background: rgba(248, 248, 248, 0.9);
	}

	.submit-btn {
		height: 110rpx;
		font-size: 34rpx;
		max-width: 600rpx;
		margin: 80rpx auto 40rpx;
	}
}

/* 适配不同高度的屏幕 */
@media screen and (min-height: 700px) and (max-width: 767px) {
	.container {
		padding: 20rpx 0;
	}

	.avatar-area {
		margin: 30rpx auto 50rpx;
	}

	.avatar-wrapper {
		width: 140rpx;
		height: 140rpx;
	}

	.form-area {
		gap: 25rpx;
	}

	.input-box {
		height: 90rpx;
		font-size: 26rpx;
	}

	.submit-btn {
		margin-top: 50rpx;
		margin-bottom: 40rpx;
	}
}

/* 超小屏幕适配 */
@media screen and (max-height: 600px) {
	.avatar-area {
		margin: 10rpx auto 30rpx;
	}

	.avatar-wrapper {
		width: 140rpx;
		height: 140rpx;
	}

	.form-area {
		gap: 15rpx;
	}

	.input-box {
		height: 90rpx;
	}

	.submit-btn {
		height: 90rpx;
		margin-top: 30rpx;
		margin-bottom: 20rpx;
	}
}
</style> 