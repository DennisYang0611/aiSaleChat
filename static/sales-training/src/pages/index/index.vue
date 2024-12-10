<template>
  <view class="welcome-container">
    <view class="logo">
      <image src="/static/logo.svg" mode="aspectFit" class="logo-image"></image>
    </view>
    <view class="welcome-text">
      <text class="title">欢迎使用</text>
      <text class="subtitle">销售对练系统</text>
    </view>
    <text class="hint-text">点击使用开始使用即可开启</text>
    <button class="start-button" @click="handleStart">开始使用</button>
  </view>
</template>

<script setup lang="ts">
const handleStart = () => {
  // 这里添加点击后的跳转逻辑
  uni.showToast({
    title: '开始使用',
    icon: 'none'
  })
}
</script>

<style lang="scss">
.welcome-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
  background-color: #ffffff;
  
  .logo {
    margin-top: 160rpx;
    width: 160rpx;
    height: 160rpx;
    
    .logo-image {
      width: 100%;
      height: 100%;
    }
  }
  
  .welcome-text {
    margin-top: 60rpx;
    text-align: center;
    
    .title {
      font-size: 40rpx;
      color: #333;
      display: block;
      font-weight: 400;
    }
    
    .subtitle {
      font-size: 40rpx;
      color: #333;
      margin-top: 24rpx;
      display: block;
      font-weight: 400;
    }
  }
  
  .hint-text {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: #999;
  }
  
  .start-button {
    position: fixed;
    bottom: 40rpx;
    left: 32rpx;
    right: 32rpx;
    height: 96rpx;
    line-height: 96rpx;
    background-color: #1a1a1a;
    color: #ffffff;
    border-radius: 16rpx;
    font-size: 32rpx;
    font-weight: 400;
    
    &:active {
      opacity: 0.9;
    }
  }
}
</style> 