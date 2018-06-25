/**
 * Created by Liyang on 2016/10/24.
 */

(function () {
    var module = window.module,
        Cache = module.Cache;

    function log(identity) {
        $.post({
            method: 'POST',
            url: 'http://10.35.1.85:3333/log',
            dataType: 'json',
            contentType: '`application/json`',
            data: JSON.stringify(identity)
        }).fail(function (e) {});
    }

    class Ajax {
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
    if (module) {
        module.Ajax = Ajax;
    } else {
        module = {
            Ajax: Ajax
        }
    }
}());