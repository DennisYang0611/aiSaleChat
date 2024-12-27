<template>
	<view class="container">
		<view class="header">
			<view class="back-btn" @tap="handleBack">
				<text class="back-icon">←</text>
			</view>
			<text class="header-title">创建训练</text>
			<view class="placeholder"></view>
		</view>

		<view class="form-area">
			<view class="form-item">
				<text class="label">训练名称</text>
				<input 
					class="input" 
					type="text" 
					v-model="formData.name"
					placeholder="请输入训练名称"
				/>
			</view>
			
			<view class="form-item">
				<text class="label">训练描述</text>
				<textarea 
					class="textarea" 
					v-model="formData.description"
					placeholder="请输入训练描述"
				/>
			</view>
		</view>

		<button class="submit-btn" @tap="handleSubmit">创建训练</button>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	data() {
		return {
			formData: {
				name: '',
				description: ''
			}
		}
	},
	methods: {
		handleBack() {
			uni.navigateBack();
		},
		handleSubmit() {
			// 这里添加创建训练的逻辑
			console.log('创建训练', this.formData);
			uni.navigateBack();
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
	justify-content: center;
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

.placeholder {
	width: 60rpx;
}

.form-area {
	margin-top: 40rpx;
}

.form-item {
	margin-bottom: 40rpx;
}

.label {
	font-size: 32rpx;
	color: #333;
	margin-bottom: 20rpx;
	display: block;
}

.input {
	width: 100%;
	height: 90rpx;
	border: 2rpx solid #E5E5E5;
	border-radius: 16rpx;
	padding: 0 30rpx;
	font-size: 32rpx;
}

.textarea {
	width: 100%;
	height: 200rpx;
	border: 2rpx solid #E5E5E5;
	border-radius: 16rpx;
	padding: 20rpx 30rpx;
	font-size: 32rpx;
}

.submit-btn {
	position: fixed;
	bottom: 40rpx;
	left: 40rpx;
	right: 40rpx;
	height: 90rpx;
	background-color: #333;
	color: #fff;
	border-radius: 16rpx;
	line-height: 90rpx;
	font-size: 32rpx;
}

button::after {
	border: none;
}
</style> 