 <template>
	<view class="container">
		<view class="logo-area">
			<view class="logo animate-logo">
				<view class="circle animate-dot"></view>
				<view class="circle top-right animate-dot"></view>
				<view class="circle bottom-right animate-dot"></view>
				<view class="circle bottom-left animate-dot"></view>
				<view class="connect-lines"></view>
			</view>
			<text class="logo-text">销售对练系统</text>
		</view>
		
		<view class="title-area">
			<text class="title">One account</text>
			<text class="subtitle">Many Possibilities</text>
		</view>
		
		<view class="form-area">
			<input 
				class="input-box" 
				type="text" 
				placeholder="showsamson@gmail.com"
				v-model="email"
			/>
			<input 
				class="input-box" 
				type="password" 
				placeholder="******"
				v-model="password"
			/>
			
			<view class="remember-area">
				<label class="checkbox">
					<checkbox :checked="rememberMe" @tap="toggleRemember" />
					<text>Remember me</text>
				</label>
				<text class="forgot-link" @tap="handleForgot">Forgot Password?</text>
			</view>
		</view>
		
		<view class="button-area">
			<button class="sign-in-btn" @tap="handleSignIn">Sign In</button>
			<button class="google-btn" @tap="handleGoogleSignIn">
				<image src="/static/google-icon.png" class="google-icon" />
				Continue with Google
			</button>
		</view>
		
		<view class="signup-area">
			<text>Not a member yet? </text>
			<text class="signup-link" @tap="handleSignUp">Sign Up</text>
		</view>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';
import { request } from '@/utils/request';

interface LoginResponse {
	token: string;
	message?: string;
	user?: {
		id: number;
		email: string;
		name: string;
	}
}

export default Vue.extend({
	data() {
		return {
			email: '',
			password: '',
			rememberMe: false
		}
	},
	methods: {
		toggleRemember() {
			this.rememberMe = !this.rememberMe;
		},
		async handleSignIn() {
			if(!this.email || !this.password) {
				uni.showToast({
					title: '请输入邮箱和密码',
					icon: 'none'
				});
				return;
			}

			uni.showLoading({
				title: '登录中...'
			});
			
			try {
				const res = await request<LoginResponse>({
					url: '/auth/login',
					method: 'POST',
					data: {
						email: this.email,
						password: this.password
					}
				});

				uni.setStorageSync('token', res.token);
				
				if(res.user) {
					uni.setStorageSync('userInfo', res.user);
				}
				
				uni.showToast({
					title: '登录成功',
					icon: 'success',
					duration: 1500
				});
				
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/index/index'
					});
				}, 1500);
			} catch(error) {
				console.error('登录失败:', error);
				uni.showToast({
					title: (error as Error).message || '登录失败,请重试',
					icon: 'none',
					duration: 1500
				});
			} finally {
				uni.hideLoading();
			}
		},
		handleGoogleSignIn() {
			console.log('谷歌登录');
		},
		handleForgot() {
			console.log('忘记密码');
		},
		handleSignUp() {
			uni.navigateTo({
				url: '/pages/signup/index'
			});
		}
	}
});
</script>

<style>
.container {
	padding: 60rpx 40rpx;
	min-height: 100vh;
	background-color: #fff;
}

.logo-area {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 60rpx;
}

.logo {
	width: 80rpx;
	height: 80rpx;
	position: relative;
	margin-bottom: 20rpx;
}

.circle {
	position: absolute;
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background-color: #000;
	left: 0;
	top: 0;
}

.top-right {
	left: auto;
	right: 0;
}

.bottom-right {
	left: auto;
	right: 0;
	top: auto;
	bottom: 0;
}

.bottom-left {
	top: auto;
	bottom: 0;
}

.connect-lines {
	position: absolute;
	width: 100%;
	height: 100%;
	border: 3rpx solid #000;
	border-radius: 40rpx;
}

.logo-text {
	font-size: 28rpx;
	color: #333;
}

.title-area {
	margin-bottom: 60rpx;
}

.title {
	font-size: 48rpx;
	font-weight: bold;
	color: #333;
	display: block;
}

.subtitle {
	font-size: 48rpx;
	font-weight: bold;
	color: #333;
}

.form-area {
	margin-bottom: 60rpx;
}

.input-box {
	width: 100%;
	height: 90rpx;
	border: 2rpx solid #E5E5E5;
	border-radius: 16rpx;
	margin-bottom: 30rpx;
	padding: 0 30rpx;
	font-size: 32rpx;
}

.remember-area {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 20rpx;
}

.checkbox {
	display: flex;
	align-items: center;
	font-size: 28rpx;
}

.forgot-link {
	color: #FF6B00;
	font-size: 28rpx;
}

.button-area {
	margin-bottom: 60rpx;
}

.sign-in-btn {
	width: 100%;
	height: 90rpx;
	background-color: #333;
	color: #fff;
	border-radius: 16rpx;
	line-height: 90rpx;
	margin-bottom: 30rpx;
	font-size: 32rpx;
}

.google-btn {
	width: 100%;
	height: 90rpx;
	background-color: #fff;
	border: 2rpx solid #E5E5E5;
	border-radius: 16rpx;
	line-height: 90rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
}

.google-icon {
	width: 40rpx;
	height: 40rpx;
	margin-right: 20rpx;
}

.signup-area {
	text-align: center;
	font-size: 28rpx;
}

.signup-link {
	color: #FF6B00;
}

button::after {
	border: none;
}

.animate-logo {
	animation: rotate 20s linear infinite;
}

.animate-dot {
	animation: breath 2s ease-in-out infinite;
}

@keyframes rotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

@keyframes breath {
	0% {
		transform: scale(1);
		opacity: 0.8;
	}
	50% {
		transform: scale(1.2);
		opacity: 1;
	}
	100% {
		transform: scale(1);
		opacity: 0.8;
	}
}

/* 让连接线保持不动 */
.connect-lines {
	animation: anti-rotate 20s linear infinite;
}

@keyframes anti-rotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(-360deg);
	}
}

/* 小屏幕适配 (< 375px) */
@media screen and (max-width: 375px) {
  .container {
    padding: 0 24rpx;
  }

  .logo-area {
    margin-bottom: 40rpx;
  }

  .logo {
    width: 60rpx;
    height: 60rpx;
  }

  .title {
    font-size: 40rpx;
  }

  .subtitle {
    font-size: 40rpx;
  }

  .input-box {
    height: 80rpx;
    font-size: 28rpx;
  }

  .remember-area {
    font-size: 24rpx;
  }
}

/* 平板适配 (768px - 1024px) */
@media screen and (min-width: 768px) {
  .container {
    padding: 0 60rpx;
    max-width: 800rpx;
    margin: 0 auto;
  }

  .logo {
    width: 100rpx;
    height: 100rpx;
  }

  .title, .subtitle {
    font-size: 56rpx;
  }

  .input-box {
    height: 100rpx;
    font-size: 32rpx;
    margin-bottom: 40rpx;
  }

  .button-area {
    margin-top: 60rpx;
  }

  .sign-in-btn, .google-btn {
    height: 120rpx;
    font-size: 36rpx;
  }
}

/* 大屏桌面适配 */
@media screen and (min-width: 1024px) {
  .container {
    max-width: 1000rpx;
  }

  .form-area {
    width: 600rpx;
    margin: 0 auto;
  }

  .button-area {
    width: 600rpx;
    margin: 60rpx auto;
  }
}
</style>