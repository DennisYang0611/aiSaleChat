<template>
	<view class="container">
		<!-- 固定的顶部导航 -->
		<view class="fixed-header">
			<view class="header">
				<view class="back-btn" @tap="handleBack">
					<text class="back-icon">←</text>
				</view>
				<text class="header-title">创建训练场景</text>
				<view class="ai-btn" @tap="handleAIGenerate">
					<text class="ai-text" v-if="!isLoading">AI生成</text>
				</view>
			</view>
		</view>

		<!-- 内容区域 -->
		<view class="content-wrapper">
			<!-- 头像区域 -->
			<view class="avatar-area">
				<view class="avatar-wrapper" @tap="handleUploadAvatar">
					<default-avatar></default-avatar>
					<view class="upload-mask">
						<view class="upload-icon">
							<image src="/static/icons/camera.png" mode="aspectFit"></image>
						</view>
						<text class="upload-text">上传头像</text>
					</view>
				</view>
			</view>

			<!-- 表单区域 -->
			<view class="form-area">
				<view class="form-group">
					<text class="form-label">基本信息</text>
					<input
						class="input-box"
						type="text"
						v-model="formData.name"
						placeholder="给AI助手起个名字"
					/>
					<input
						class="input-box"
						type="text"
						v-model="formData.scene"
						placeholder="设定对话场景（如：手机销售）"
					/>
				</view>

				<view class="form-group">
					<text class="form-label">客户画像</text>
					<input
						class="input-box"
						type="text"
						v-model="formData.customerProfile"
						placeholder="描述目标客户特征"
					/>
					<input
						class="input-box"
						type="text"
						v-model="formData.buyingPower"
						placeholder="客户购买能力"
					/>
				</view>

				<view class="form-group">
					<text class="form-label">消费特征</text>
					<input
						class="input-box"
						type="text"
						v-model="formData.consumptionHabits"
						placeholder="客户消费习惯"
					/>
					<input
						class="input-box"
						type="text"
						v-model="formData.consumptionConcepts"
						placeholder="客户消费理念"
					/>
				</view>
			</view>

			<!-- 提交按钮 -->
			<button class="submit-btn" @tap="handleSubmit">
				<text class="btn-text">开始创建</text>
				<text class="btn-icon">→</text>
			</button>
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

		<!-- AI生成加载遮罩 -->
		<view class="ai-loading-mask" v-if="isLoading">
			<view class="ai-loading-content">
				<!-- AI大脑动画 -->
				<view class="ai-brain">
					<view class="brain-core"></view>
					<view class="brain-waves">
						<view class="wave"></view>
						<view class="wave"></view>
						<view class="wave"></view>
					</view>
					<!-- 神经元连接动画 -->
					<view class="neurons">
						<view class="neuron n1"></view>
						<view class="neuron n2"></view>
						<view class="neuron n3"></view>
						<view class="neuron n4"></view>
						<view class="connection c1"></view>
						<view class="connection c2"></view>
						<view class="connection c3"></view>
					</view>
				</view>
				<!-- 加载文字 -->
				<view class="loading-text">
					<text class="main-text">AI正在思考</text>
					<view class="dot-flow">
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
		async handleAIGenerate() {
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
	background: linear-gradient(180deg, #f6f7fb 0%, #ffffff 100%);
	position: relative;
}

.fixed-header {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
	background: rgba(255, 255, 255, 0.98);
	box-shadow: 0 2rpx 20rpx rgba(0, 0, 0, 0.05);
}

.header {
	padding: 88rpx 30rpx 20rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
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
	font-weight: 600;
	color: #333;
}

.ai-btn {
	display: flex;
	align-items: center;
	padding: 10rpx 24rpx;
	background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
	border-radius: 32rpx;
	box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.2);
	transform: scale(0.95);
}

.ai-text {
	color: #fff;
	font-size: 26rpx;
	font-weight: 500;
	letter-spacing: 1px;
}

.ai-btn:active {
	transform: scale(0.9);
	transition: transform 0.2s ease;
}

.content-wrapper {
	padding: 180rpx 40rpx 40rpx;
}

.form-group {
	margin-bottom: 40rpx;
}

.form-label {
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 20rpx;
	display: block;
}

.input-box {
	width: 100%;
	height: 100rpx;
	background: #fff;
	border-radius: 16rpx;
	padding: 0 30rpx;
	margin-bottom: 20rpx;
	font-size: 28rpx;
	border: 2rpx solid #eef0f6;
	transition: all 0.3s ease;
}

.input-box:focus {
	border-color: #6366f1;
	box-shadow: 0 0 0 2rpx rgba(99, 102, 241, 0.1);
}

.submit-btn {
	width: 100%;
	height: 100rpx;
	background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
	border-radius: 16rpx;
	color: #fff;
	font-size: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 60rpx;
	box-shadow: 0 8rpx 20rpx rgba(99, 102, 241, 0.2);
	transition: all 0.3s ease;
}

.submit-btn:active {
	transform: scale(0.98);
	box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.15);
}

.btn-text {
	margin-right: 12rpx;
}

.btn-icon {
	font-size: 32rpx;
	font-weight: bold;
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

/* 适配 iPhone 刘海屏 */
@supports (padding-top: constant(safe-area-inset-top)) {
	.header {
		padding-top: calc(88rpx + constant(safe-area-inset-top));
	}
	.content-wrapper {
		padding-top: calc(180rpx + constant(safe-area-inset-top));
	}
}

@supports (padding-top: env(safe-area-inset-top)) {
	.header {
		padding-top: calc(88rpx + env(safe-area-inset-top));
	}
	.content-wrapper {
		padding-top: calc(180rpx + env(safe-area-inset-top));
	}
}

/* AI加载遮罩样式 */
.ai-loading-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(255, 255, 255, 0.98);
	backdrop-filter: blur(10px);
	z-index: 999;
	display: flex;
	align-items: center;
	justify-content: center;
}

.ai-loading-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 40rpx;
}

/* AI大脑动画 */
.ai-brain {
	width: 240rpx;
	height: 240rpx;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.brain-core {
	width: 80rpx;
	height: 80rpx;
	background: linear-gradient(135deg, #6366f1, #8b5cf6);
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
	border: 4rpx solid rgba(99, 102, 241, 0.3);
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

/* 神经元动画 */
.neurons {
	position: absolute;
	width: 100%;
	height: 100%;
}

.neuron {
	position: absolute;
	width: 12rpx;
	height: 12rpx;
	background: #6366f1;
	border-radius: 50%;
	animation: glow 1.5s ease-in-out infinite;
}

.connection {
	position: absolute;
	height: 2rpx;
	background: linear-gradient(90deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
	transform-origin: left center;
	animation: connect 2s ease-in-out infinite;
}

/* 加载文字样式 */
.loading-text {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.main-text {
	font-size: 32rpx;
	color: #333;
	font-weight: 500;
}

.dot-flow {
	display: flex;
	gap: 8rpx;
}

.dot {
	width: 8rpx;
	height: 8rpx;
	background: #6366f1;
	border-radius: 50%;
	animation: dotFlow 1.5s ease-in-out infinite;
}

.dot:nth-child(2) {
	animation-delay: 0.5s;
}

.dot:nth-child(3) {
	animation-delay: 1s;
}

/* 动画关键帧 */
@keyframes pulse {
	0% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
	}
	70% {
		transform: scale(1);
		box-shadow: 0 0 0 20rpx rgba(99, 102, 241, 0);
	}
	100% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
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

@keyframes glow {
	0%, 100% {
		opacity: 0.3;
		transform: scale(1);
	}
	50% {
		opacity: 1;
		transform: scale(1.2);
	}
}

@keyframes connect {
	0%, 100% {
		opacity: 0.3;
		transform: scaleX(0.8);
	}
	50% {
		opacity: 1;
		transform: scaleX(1);
	}
}

@keyframes dotFlow {
	0%, 100% {
		transform: translateY(0);
		opacity: 0.5;
	}
	50% {
		transform: translateY(-6rpx);
		opacity: 1;
	}
}
</style>