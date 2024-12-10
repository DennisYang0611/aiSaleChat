interface BaseResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

interface ListResponse<T = unknown> extends BaseResponse {
  data: {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export const successRes = <T>(
  data: T,
  message = "操作成功"
): BaseResponse<T> => {
  return {
    code: 0,
    message,
    data,
  };
};

export const failRes = (message = "操作失败", code = -1): BaseResponse => {
  return {
    code,
    message,
  };
};

export const listRes = <T>(
  list: T[],
  total: number,
  page: number,
  pageSize: number,
  message = "查询成功"
): ListResponse<T> => {
  return {
    code: 0,
    message,
    data: {
      list,
      total,
      page,
      pageSize,
    },
  };
};
