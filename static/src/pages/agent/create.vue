<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="header">
			<view class="back-btn" @tap="handleBack">
				<text class="back-icon">←</text>
			</view>
			<text class="header-title">创建一个Agent</text>
			<view class="ai-btn" @tap="handleAIGenerate">
				<text class="ai-text">AI生成</text>
			</view>
		</view>

		<!-- 头像区域 -->
		<view class="avatar-area">
			<default-avatar></default-avatar>
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
				v-model="formData.purchasing"
				placeholder="输入用户的购买力"
			/>
			<input 
				class="input-box" 
				type="text" 
				v-model="formData.intention"
				placeholder="输入用户的消费意愿"
			/>
			<input 
				class="input-box" 
				type="text" 
				v-model="formData.psychology"
				placeholder="输入用户的消费理念"
			/>
			<input 
				class="input-box" 
				type="text" 
				v-model="formData.personality"
				placeholder="输入你期望的客户性格（交流难度）"
			/>
		</view>

		<!-- 提交按钮 -->
		<button class="submit-btn" @tap="handleSubmit">生成提示词</button>
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
				scene: '',
				purchasing: '',
				intention: '',
				psychology: '',
				personality: ''
			}
		}
	},
	methods: {
		handleBack() {
			uni.navigateBack();
		},
		handleAIGenerate() {
			// 这里添加AI生成的逻辑
			console.log('AI生成');
		},
		handleSubmit() {
			uni.navigateTo({
				url: '/pages/loading/index'
			});
		}
	}
});
</script>

<style>
.container {
	min-height: 100vh;
	background-color: #fff;
	padding: 0 40rpx;
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

.avatar-area {
	display: flex;
	justify-content: center;
	margin: 40rpx 0 60rpx;
	width: 160rpx;
	height: 160rpx;
}

.form-area {
	margin-bottom: 60rpx;
}

.input-box {
	width: 100%;
	height: 100rpx;
	background: #FFFFFF;
	border: 2rpx solid #E5E5E5;
	border-radius: 16rpx;
	margin-bottom: 30rpx;
	padding: 0 30rpx;
	font-size: 32rpx;
}

.submit-btn {
	position: fixed;
	bottom: 40rpx;
	left: 40rpx;
	right: 40rpx;
	height: 100rpx;
	background: #333333;
	border-radius: 16rpx;
	color: #FFFFFF;
	font-size: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

button::after {
	border: none;
}
</style> 