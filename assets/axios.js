import axios from "axios";
import qs from "qs";

class Axios {
    constructor (settings) {
        this.url = settings.url;
        this.beforeSend = settings.beforeSend;
        this.success = settings.success;
        this.fail = settings.fail;
        this.data = settings.data;
        this.cache = new Cache();
        this.identity = settings.identity;
        this.datatype = settings.datatype;
        this.contenttype = settings.contenttype;
        this.processData = settings.processData;
        this.iscache = settings.cache;
        this.eachUpload = settings.eachUpload;

        const Axios = axios.create({
            baseURL: "/", 
            timeout: 10000,
            responseType: "json",
            withCredentials: true, // 是否允许带cookie这些
            headers: {
              "Content-Type": "application/json;charset=utf-8"
            }
        });
        
        //添加请求拦截器
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
            console.log('POST传参序列化Error',error.data.error.message)
            return Promise.reject(error.data.error.message);
            }
        );
  
        //返回状态判断(添加响应拦截器)
        Axios.interceptors.response.use(
            res => {
            //对响应数据做些事
            if (res.data && !res.data.success) {
                if(res.data.error.message.message){
                console.log('状态判断Error',res.data.error.message.message)
                }else{
                console.log('状态判断Error',res.data.error.message)
                }
                
                return Promise.reject(res.data.error.message);
            }
            return res;
            },
            error => {    
                //接口回调satus 
                if (error.response.status === 403) {
                    router.push({
                    path: "/error/403"
                    });
                }
                if (error.response.status === 500) {
                    router.push({
                    path: "/error/500"
                    });
                }
                if (error.response.status === 502) {
                    router.push({
                    path: "/error/502"
                    });
                }
                if (error.response.status === 404) {
                    router.push({
                    path: "/error/404"
                    });
                }
            // 返回 response 里的错误信息
            let errorInfo =  error.data.error ? error.data.error.message : error.data;
            return Promise.reject(errorInfo);
            }
        );
    }
    get () {
        var xhr, successFunc, failFunc;
        if (this.beforeSend) {
            this.beforeSend();
        }
        successFunc = this.success;
        failFunc = this.fail;
        this.xhr = xhr = $.get({
            url: this.url
        });
        xhr.then(function (data) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                data = [];
            }
            data  = Array.isArray(data) ? data : [data];
            successFunc && successFunc(data, xhr);
            return data;
        }).fail(function (e) {
            failFunc && failFunc(e)
        });
        // this.log && log(this.identity);
        return this.save(xhr);
    }
    post () {
        var xhr, successFunc, failFunc, eachUpload;
        this.beforeSend && this.beforeSend();
        successFunc = this.success;
        failFunc = this.fail;
        eachUpload = this.eachUpload;
        this.xhr = xhr = $.post({
            url: this.url,
            withCredentials: true,
            data: this.datatype ? JSON.stringify(this.data) : this.data,
            dataType: this.datatype ? 'json' : '',
            contentType: this.contenttype === 'no' ? false : this.contenttype || 'application/x-www-form-urlencoded',
            processData: this.processData !== 'no',
            cache: this.iscache !== 'no',
            xhr: function () {
                var xhr = $.ajaxSettings.xhr();
                eachUpload && eachUpload(xhr);
                return xhr;
            }
        });
        xhr.then(function (data) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                data = [];
            }
            data  = Array.isArray(data) ? data : [data];
            successFunc && successFunc(data, xhr);
            return data;
        }).fail(function (e) {
            failFunc && failFunc(e)
        });
        return this.save(xhr);
    }
    abort (xhr) {
        this.xhr.abort();
    }
    save (xhr) {
        return this.cache.add(xhr);
    }
    getXhr (index) {
        return this.cache.get(index);
    }
}