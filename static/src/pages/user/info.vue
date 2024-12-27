<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="header">
			<view class="back-btn" @tap="handleBack">
				<text class="back-icon">←</text>
			</view>
			<text class="header-title">Personal Info</text>
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
				placeholder="Shawn Samson"
			/>
			<input 
				class="input-box" 
				type="text" 
				v-model="formData.email"
				placeholder="shawnsamson@gmail.com"
			/>
			<input 
				class="input-box" 
				type="text" 
				v-model="formData.phone"
				placeholder="+92 310657770"
			/>
			<input 
				class="input-box" 
				type="text" 
				v-model="formData.gender"
				placeholder="Male"
			/>
			<input 
				class="input-box" 
				type="text" 
				v-model="formData.birth"
				placeholder="2002/16/02"
			/>
			<input 
				class="input-box" 
				type="text" 
				v-model="formData.address"
				placeholder="8502 Preston Rd. Inglewood, Maine 98380"
			/>
		</view>

		<!-- 保存按钮 -->
		<button class="save-btn" @tap="handleSave">Save Changes</button>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';
import DefaultAvatar from '@/components/DefaultAvatar.vue';
import { request } from '@/utils/request';

export default Vue.extend({
	components: {
		DefaultAvatar
	},
	data() {
		return {
			formData: {
				name: '',
				email: '',
				phone: '',
				gender: '',
				birth: '',
				address: ''
			},
			id: ''
		}
	},
	async onLoad(options) {
		this.id = options?.id;
		
		if(!this.id) {
			uni.showToast({
				title: '用户ID不存在',
				icon: 'none'
			});
			return;
		}

		try {
			// 获取用户详细信息
			const res = await request<any>({
				url: `/user/${this.id}`,
				method: 'GET'
			});

			if(res.data) {
				this.formData = {
					name: res.data.name || '',
					email: res.data.email || '',
					phone: res.data.phone || '',
					gender: res.data.gender || '',
					birth: res.data.birth || '',
					address: res.data.address || ''
				};
			}
		} catch(error) {
			console.error('获取用户信息失败:', error);
			uni.showToast({
				title: '获取用户信息失败',
				icon: 'none'
			});
		}
	},
	methods: {
		handleBack() {
			uni.navigateBack();
		},
		async handleSave() {
			try {
				if (!this.id) {
					throw new Error('用户信息不存在');
				}
				await request({
					url: `/user/${this.id}`,
					method: 'PATCH',
					data: {
						name: this.formData.name,
						email: this.formData.email,
						phone: this.formData.phone,
						gender: this.formData.gender,
						birth: this.formData.birth,
						address: this.formData.address
					}
				});
				
				uni.showToast({
					title: '保存成功',
					icon: 'success'
				});
				
				// 更新本地存储的用户信息
				const userInfo = uni.getStorageSync('userInfo');
				uni.setStorageSync('userInfo', {
					...userInfo,
					...this.formData
				});
				
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			} catch (error: any) {
				uni.showToast({
					title: error.message || '保存失败',
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
	flex: 1;
	text-align: center;
	margin-right: 60rpx;
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

.save-btn {
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

/* 响应式布局 */
@media screen and (max-width: 375px) {
	.container {
		padding: 0 24rpx;
	}

	.header-title {
		font-size: 32rpx;
	}

	.avatar {
		width: 120rpx;
		height: 120rpx;
	}

	.input-box {
		height: 90rpx;
		font-size: 28rpx;
	}
}

@media screen and (min-width: 768px) {
	.container {
		padding: 0 60rpx;
		max-width: 800rpx;
		margin: 0 auto;
	}

	.avatar {
		width: 200rpx;
		height: 200rpx;
	}

	.input-box {
		height: 120rpx;
		font-size: 36rpx;
	}

	.save-btn {
		width: 400rpx;
		left: 50%;
		transform: translateX(-50%);
	}
}
</style>