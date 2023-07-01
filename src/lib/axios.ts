import { h } from 'vue'
import { storeToRefs } from 'pinia';
import { ElMessage } from "element-plus";
import http from 'axios';

import { useShareStatesStore } from '@/stores/UseShareStatesStore';

const { currentProjectId, currentMockUrl } = storeToRefs(useShareStatesStore())

let loading: any;
let loadCount = 0;

/**
 * 单个 HTTP 请求
 */
export const httpSingle = (opts: any) => {
    return http(opts);
};

/**
 * 批量请求，统一响应
 */
export const httpAll = (...reqArray: any[]) => {
    return http.all(reqArray).then(http.spread((...resArray) => {
        return resArray;
    }))
};

http.interceptors.request.use(
    config => {
        return config;
    },
    err => {
        return Promise.reject(err);
    }
);

http.interceptors.response.use(
    response => {
        const { data = {}, config = {} } = response;
        return data;
    },
    error => {
        console.log(error)
        return Promise.reject(error);
    }
);

export class ErrorHandler {

    error: any = null
    isDone = false


    constructor(error: any) {
        this.error = error
    }

    static create(error: any) {
        return new ErrorHandler(error)
            .handle(defaultHandler.networkErrorHandler)
            .handle(defaultHandler.jsonParseErrorHanlder)
    }

    handle(handler: (err: any) => boolean) {
        if (!this.isDone) {
            this.isDone = handler(this.error)
        }
        return this
    }

    end(){
        this.handle(defaultHandler.lastErrorHandler)
    }

}

const defaultHandler = {
    networkErrorHandler(err: any) {
        if (err.code && err.code === 'ERR_NETWORK') {
            ElMessage({
                type: 'error',
                message: `服务器 ${currentMockUrl.value} 离线，请确认服务器正常启动`,
            })
            currentProjectId.value = ''
            currentMockUrl.value = ''
            return true
        }
        return false
    },
    jsonParseErrorHanlder(err: any) {
        try {
            const err2: any = {}
            err2.title = err.response.data.errors[0].title
            err2.pointer = "pointer: " + err.response.data.errors[0].source.pointer
            err2.detail = "reason: " + err.response.data.errors[0].detail.split(';')[0]
            ElMessage({
                type: 'error',
                message: h('div', null, [
                    h('p', null, err2.title),
                    h('p', null, err2.pointer),
                    h('p', null, err2.detail),
                ]),
            })
            return true
        } catch {
            return false
        }
    },
    lastErrorHandler(err: any) {
        ElMessage({
            type: 'error',
            message: err.message,
        })
        return true
    }

}

