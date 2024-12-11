<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="header">
			<view class="back-btn" @tap="handleBack">
				<text class="back-icon">←</text>
			</view>
			<text class="header-title">Chat Hub</text>
		</view>

		<!-- 聊天内容区域 -->
		<scroll-view
			class="chat-content"
			scroll-y="true"
			:scroll-top="scrollTop"
			:scroll-with-animation="true"
			@scrolltoupper="loadMoreMessages"
		>
			<view class="message-list">
				<view
					v-for="(message, index) in messages"
					:key="index"
					:class="['message-item', message.type === 'user' ? 'user' : 'assistant']"
				>
					<view class="avatar">
						<default-avatar v-if="message.type === 'assistant'"></default-avatar>
						<view class="user-avatar" v-else>You</view>
					</view>
					<view class="message-content">
						<text>{{ message.content }}</text>
						<view class="share-btn" v-if="message.type === 'assistant'" @tap="handleShare(message)">
							<text class="share-icon">↗</text>
						</view>
					</view>
				</view>
				<view class="stop-generating" v-if="isGenerating" @tap="handleStop">
					<text>Stop generating...</text>
				</view>
			</view>
		</scroll-view>

		<!-- 输入区域 -->
		<view class="input-area">
			<input
				class="message-input"
				type="text"
				v-model="inputMessage"
				placeholder="Ask anything"
				:disabled="isGenerating"
				@confirm="handleSend"
			/>
			<view class="send-btn" @tap="handleSend" :class="{ disabled: isGenerating }">
				<text class="send-icon">↑</text>
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
			messages: [
				{
					type: 'assistant',
					content: 'Hello! how may I help you today?'
				}
			],
			inputMessage: '',
			scrollTop: 0,
			isGenerating: false
		}
	},
	methods: {
		handleBack() {
			uni.navigateBack();
		},
		handleSend() {
			if (!this.inputMessage.trim() || this.isGenerating) return;

			// 添加用户消息
			this.messages.push({
				type: 'user',
				content: this.inputMessage
			});

			// 清空输入
			const userMessage = this.inputMessage;
			this.inputMessage = '';

			// 滚动到底部
			this.scrollToBottom();

			// 模拟AI回复
			this.isGenerating = true;
			setTimeout(() => {
				this.messages.push({
					type: 'assistant',
					content: `This is a response to: ${userMessage}`
				});
				this.isGenerating = false;
				this.scrollToBottom();
			}, 1000);
		},
		handleStop() {
			this.isGenerating = false;
		},
		handleShare(message: any) {
			uni.showToast({
				title: '已复制到剪贴板',
				icon: 'none'
			});
		},
		loadMoreMessages() {
			console.log('加载更多消息');
		},
		scrollToBottom() {
			setTimeout(() => {
				const query = uni.createSelectorQuery().in(this);
				query.select('.message-list').boundingClientRect(data => {
					// this.scrollTop = data.height;
				}).exec();
			}, 100);
		}
	}
});
</script>

<style>
.container {
	min-height: 100vh;
	background-color: #fff;
	display: flex;
	flex-direction: column;
}

.header {
	display: flex;
	align-items: center;
	padding: 40rpx 32rpx;
	background: #fff;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
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
	flex: 1;
	text-align: center;
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	margin-right: 60rpx;
}

.chat-content {
	flex: 1;
	padding: 140rpx 32rpx 180rpx;
}

.message-list {
	display: flex;
	flex-direction: column;
	gap: 40rpx;
}

.message-item {
	display: flex;
	gap: 20rpx;
	max-width: 80%;
}

.message-item.assistant {
	align-self: flex-start;
}

.message-item.user {
	align-self: flex-end;
	flex-direction: row-reverse;
}

.avatar {
	width: 80rpx;
	height: 80rpx;
	flex-shrink: 0;
}

.user-avatar {
	width: 100%;
	height: 100%;
	background: #333;
	border-radius: 50%;
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
}

.message-content {
	background: #F8F8F8;
	padding: 24rpx;
	border-radius: 24rpx;
	font-size: 28rpx;
	color: #333;
	position: relative;
}

.user .message-content {
	background: #333;
	color: #fff;
}

.share-btn {
	position: absolute;
	right: -60rpx;
	top: 50%;
	transform: translateY(-50%);
	width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.share-icon {
	font-size: 32rpx;
	color: #999;
}

.stop-generating {
	align-self: center;
	padding: 16rpx 32rpx;
	background: #F8F8F8;
	border-radius: 30rpx;
	font-size: 24rpx;
	color: #666;
}

.input-area {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 32rpx;
	background: #fff;
	display: flex;
	gap: 20rpx;
	align-items: center;
}

.message-input {
	flex: 1;
	height: 80rpx;
	background: #F8F8F8;
	border-radius: 40rpx;
	padding: 0 32rpx;
	font-size: 28rpx;
}

.send-btn {
	width: 80rpx;
	height: 80rpx;
	background: #333;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.send-btn.disabled {
	opacity: 0.5;
}

.send-icon {
	color: #fff;
	font-size: 32rpx;
}
</style>