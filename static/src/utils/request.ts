import { API_BASE_URL, API_TIMEOUT } from "@/config";
const isDev = process.env.NODE_ENV === "development";

// uni.request 支持的请求方法类型
type UniRequestMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "OPTIONS"
  | "HEAD"
  | "TRACE"
  | "CONNECT";
// 我们支持的请求方法类型
type RequestMethod = UniRequestMethod | "PATCH";

interface RequestOptions {
  url: string;
  method?: RequestMethod;
  data?: any;
  header?: any;
}

interface ResponseData {
  message?: string;
  [key: string]: any;
}

export async function request<T>(options: RequestOptions): Promise<T> {
  try {
    console.log("test");
    const token = uni.getStorageSync("token");
    console.log("Request:", {
      url: API_BASE_URL + options.url,
      method: options.method,
      data: options.data,
      token: token ? "exists" : "none",
    });

    const method = (options.method || "GET") as UniRequestMethod;

    console.log(options.data);
    const response = await uni.request({
      url: API_BASE_URL + options.url,
      method: method,
      data: options.data,
      timeout: API_TIMEOUT,
      header: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
        ...(options.method === "PATCH"
          ? { "X-HTTP-Method-Override": "PATCH" }
          : {}),
      },
    });

    console.log("Response:", {
      statusCode: response.statusCode,
      data: response.data,
      header: response.header,
    });

    if (response.statusCode === 200) {
      return response.data as T;
    }

    switch (response.statusCode) {
      case 401:
        uni.removeStorageSync("token");
        uni.reLaunch({ url: "/pages/login/index" });
        throw new Error("登录已过期，请重新登录");
      case 403:
        throw new Error("没有权限访问");
      case 404:
        throw new Error("请求的资源不存在");
      case 500:
        throw new Error("服务器内部错误");
      default:
        const errorData = response.data as ResponseData;
        throw new Error(errorData.message || "请求失败");
    }
  } catch (error: any) {
    console.error("Request error:", {
      message: error.message,
      errMsg: error.errMsg,
      stack: error.stack,
    });

    if (error.errMsg?.includes("request:fail")) {
      if (error.errMsg.includes("timeout")) {
        throw new Error("请求超时，请检查网络连接");
      }
      if (error.errMsg.includes("ssl")) {
        throw new Error("SSL证书验证失败");
      }
      const errorMessage = isDev
        ? `无法连接到服务器(${API_BASE_URL})，请检查：\n1. 后端服务是否启动\n2. 网络连接是否正常\n3. 端口是否正确`
        : "网络连接失败，请稍后重试";
      throw new Error(errorMessage);
    }
    throw error;
  }
}
