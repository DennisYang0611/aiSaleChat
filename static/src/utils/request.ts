import { API_BASE_URL, API_TIMEOUT } from "@/config";

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
    const token = uni.getStorageSync("token");

    // 如果是 PATCH 请求，转换为 PUT
    const method = (
      options.method === "PATCH" ? "PUT" : options.method || "GET"
    ) as UniRequestMethod;

    const response = await uni.request({
      url: API_BASE_URL + options.url,
      method,
      data: options.data,
      timeout: API_TIMEOUT,
      header: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
        // 如果是 PATCH 请求，添加自定义标记
        ...(options.method === "PATCH"
          ? { "X-HTTP-Method-Override": "PATCH" }
          : {}),
      },
    });

    if (response.statusCode === 200) {
      return response.data as T;
    }

    const errorData = response.data as ResponseData;
    throw new Error(errorData.message || "请求失败");
  } catch (error: any) {
    if (error.errMsg?.includes("request:fail")) {
      throw new Error("无法连接到服务器，请检查网络连接");
    }
    throw error;
  }
}
