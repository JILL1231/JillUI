/**
 * Created by yuyajing on 2018/6/25.
 * 
 * 
 * 实现的功能
 * 统一捕获接口报错 : 用的axios内置的interceptors拦截器
 * 
 * 
 * 使用：
 * import request from url
 * 
 * request({
 *     url: '/user/info',
 *     method: 'get',
 *     params: { token }
  })
 */
import axios from "axios";
import qs from "qs";

const Axios = axios.create({
  baseURL: "/",
  timeout: 10000,
  responseType: "json",
  withCredentials: true, // 是否允许带cookie这些
});

//请求拦截
Axios.interceptors.request.use(
  config => {
    // 在发送请求之前,POST传参序列化
    if (
      config.method === "post"
    ) {
      // 序列化
      config.data = qs.stringify(config.data);
    }

    // 若是有做鉴权token , 就给头部带上token
    // 若是需要跨站点,存放到 cookie 会好一点,限制也没那么多,有些浏览环境限制了 localstorage 的使用
    if (localStorage.token) {
      config.headers.Authorization = localStorage.token;
    }
    return config;
  },
  error => {
    // error 的回调信息
    console.log('POST传参序列化Error', error.data.error.message)
    return Promise.reject(error.data.error.message);
  }
);

//响应拦截
Axios.interceptors.response.use(
  res => {
    //对响应数据做些事
    if (res.data && !res.data.success) {
      if (res.data.error.message.message) {
        console.log('状态判断Error', res.data.error.message.message)
      } else {
        console.log('状态判断Error', res.data.error.message)
      }

      return Promise.reject(res.data.error.message);
    }
    return res;
  },
  error => {
    if (error && error.response) {
       //接口回调satus 
      switch (error.response.status) {
        case 400:
          error.message = '错误请求'
          break;
        case 401:
          error.message = '未授权，请重新登录'
          break;
        case 403:
          error.message = '拒绝访问'
          break;
        case 404:
          error.message = '请求错误,未找到该资源'
          break;
        case 405:
          error.message = '请求方法未允许'
          break;
        case 408:
          error.message = '请求超时'
          break;
        case 500:
          error.message = '服务器端出错'
          break;
        case 501:
          error.message = '网络未实现'
          break;
        case 502:
          error.message = '网络错误'
          break;
        case 503:
          error.message = '服务不可用'
          break;
        case 504:
          error.message = '网络超时'
          break;
        case 505:
          error.message = 'http版本不支持该请求'
          break;
        default:
          error.message = `连接错误${error.response.status}`
      }
    } else {
      error.message = "连接到服务器失败"
    }
   // 返回 response 里的错误信息
    message.err(error.message)
    return Promise.reject(error.response);
  }
);

function checkStatus(response) {
  // loading
  // 如果http状态码正常，则直接返回数据
  if (response && (response.status === 200 || response.status === 304 || response.status === 400)) {
    return response
    // 如果不需要除了data之外的数据，可以直接 return response.data
  }
  // 异常状态下，把错误信息返回去
  return {
    status: -404,
    msg: '网络异常'
  }
}

function checkCode(res) {
  // 如果code异常(这里已经包括网络错误，服务器错误，后端抛出的错误)，可以弹出一个错误提示，告诉用户
  if (res.status === -404) {
    alert(res.msg)
  }
  if (res.data && (!res.data.success)) {
    alert(res.data.error_msg)
  }
  return res
}

export default {
  post(url, data) {
    return axios({
      method: 'post',
      url,
      data: qs.stringify(data),
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    }).then(
      (response) => {
        return checkStatus(response)
      }
    ).then(
      (res) => {
        return checkCode(res)
      }
    )
  },
  
}
