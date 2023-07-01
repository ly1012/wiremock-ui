import { nanoid, isEmpty } from '@/lib/helper'
import $enum from '@/service/const/stubEnum'
import { type IStubMapping } from '@/service/api/StubMappings'
import { type MatchNodeData } from './renderModel'


/**
 * 将后端接口返回的 API 数据格式转换为前端渲染需要的数据格式。包括以下处理：
 * 
 * 1. 对 API Data 中不存在的字段进行初始化。
 * 2. 通过 metadata.render 挂载前端渲染需要的字段。
 */
export const apiDataToRenderData = (item: IStubMapping) => {
    const $ = isEmpty
    if ($(item.metadata)) item.metadata = {};
    if ($(item.metadata.wmui)) item.metadata.wmui = {}
    if ($(item.metadata.render)) item.metadata.render = {}
    if ($(item.metadata.render.request)) item.metadata.render.request = {}
    if ($(item.metadata.render.response)) item.metadata.render.response = {}

    // 1. General Info
    // id uuid 不需要处理
    if ($(item.name)) item.name = '请输入 Stub Mapping 名称'
    if ($(item.metadata.wmui.description)) item.metadata.wmui.description = ''
    if ($(item.metadata.wmui.createTime)) item.metadata.wmui.createTime = ''
    if ($(item.metadata.wmui.updateTime)) item.metadata.wmui.updateTime = ''
    if ($(item.priority)) item.priority = 5
    item.persistent = true
    if ($(item.scenarioName)) item.scenarioName = ''
    if ($(item.requiredScenarioState)) item.requiredScenarioState = ''
    if ($(item.newScenarioState)) item.newScenarioState = ''

    // 2. Request
    // Request Method & URL
    if ($(item.request.method)) item.request.method = 'ANY'
    item.metadata.render.request.urlMatchType = (item.request.url && 'url') || (item.request.urlPattern && 'urlPattern')
        || (item.request.urlPath && 'urlPath') || (item.request.urlPathPattern && 'urlPathPattern') || 'any';
    item.metadata.render.request.url = item.request.url || item.request.urlPattern || item.request.urlPath || item.request.urlPathPattern || '';
    // Query Params
    if ($(item.request.queryParameters)) item.request.queryParameters = {};
    item.metadata.render.request.queryParameters = apiDataToRenderDataWithMatch(item.request.queryParameters)

    // Request Headers
    item.metadata.render.request.authType = (item.request.basicAuthCredentials && 'basicAuth') || 'none'
    if ($(item.request.basicAuthCredentials)) item.request.basicAuthCredentials = {
        username: '',
        password: ''
    }
    if ($(item.request.headers)) item.request.headers = {};
    item.metadata.render.request.headers = apiDataToRenderDataWithMatch(item.request.headers)
    if ($(item.request.cookies)) item.request.cookies = {};
    item.metadata.render.request.cookies = apiDataToRenderDataWithMatch(item.request.cookies)
    // Request Body
    item.metadata.render.request.bodyType = (item.request.bodyPatterns && 'raw') || (item.request.multipartPatterns && 'form-data')
        || (item.request.formParameters && 'x-www-form-urlencoded') || 'none'
    if ($(item.request.bodyPatterns)) item.request.bodyPatterns = [];
    item.metadata.render.request.bodyPatterns = apiDataToRenderDataWithMatch(item.request.bodyPatterns)
    if ($(item.request.multipartPatterns)) item.request.multipartPatterns = []
    item.metadata.render.request.multipartPatterns = []
    for (let multipartPattern of (item.request.multipartPatterns || [])) {
        item.metadata.render.request.multipartPatterns.push({
            matchingType: multipartPattern.matchingType,
            headers: apiDataToRenderDataWithMatch(multipartPattern.headers),
            bodyPatterns: apiDataToRenderDataWithMatch(multipartPattern.bodyPatterns)
        })
    }
    if ($(item.request.formParameters)) item.request.formParameters = {}
    item.metadata.render.request.formParameters = apiDataToRenderDataWithMatch(item.request.formParameters)

    // Request Custom Matcher
    if ($(item.request.customMatcher)) item.request.customMatcher = {
        name: '',
        parameters: {}
    }

    // 3. Response
    // 3.1 General Info
    item.metadata.render.response.responseType = (item.response.proxyBaseUrl && 'proxy') || (item.response.fault && 'fault')
        || ((item.response.body || item.response.jsonBody || item.response.base64Body || item.response.bodyFileName) && 'direct')
        || 'none'
    item.metadata.render.response.delayType = (item.response.fixedDelayMilliseconds && 'fixedDelayMilliseconds')
        || (item.response.chunkedDribbleDelay && 'chunkedDribbleDelay')
        || (item.response.delayDistribution && item.response.delayDistribution.type === 'lognormal' && 'lognormal')
        || (item.response.delayDistribution && item.response.delayDistribution.type === 'uniform' && 'uniform')
        || 'none'

    if ($(item.response.chunkedDribbleDelay)) item.response.chunkedDribbleDelay = {
        numberOfChunks: 1,
        totalDuration: 0
    }
    if ($(item.response.fixedDelayMilliseconds)) item.response.fixedDelayMilliseconds = 0
    if ($(item.response.delayDistribution)) item.response.delayDistribution = {
        type: 'uniform',
        lower: 0,
        upper: 0
    }
    if ($(item.response.fromConfiguredStub)) item.response.fromConfiguredStub = true
    // 3.2 Response Type：Normal Response
    // Response Status Line
    if ($(item.response.status)) item.response.status = 200
    if ($(item.response.statusMessage)) item.response.statusMessage = ''
    // Response Headers
    if ($(item.response.headers)) item.response.headers = {}
    if ($(item.metadata.render.response.direct)) item.metadata.render.response.direct = {}
    if ($(item.metadata.render.response.direct.headers)) item.metadata.render.response.direct.headers = []
    const tmpResponseHeaders = item.response.headers || {}
    Object.keys(tmpResponseHeaders).forEach(key => {
        const headerValue = tmpResponseHeaders[key]
        if (headerValue && Object.prototype.toString.call(headerValue) === '[object Array]') {  //多值 Header
            for (let val of headerValue) {
                item.metadata.render.response.direct.headers.push({
                    key: key,
                    value: val
                })
            }
        } else {        //单值 Header
            item.metadata.render.response.direct.headers.push({
                key: key,
                value: headerValue
            })
        }
    });
    // Response Body
    item.metadata.render.response.direct.bodyType = item.metadata.wmui.responseBodyType
        || (item.response.jsonBody && 'json')
        || (item.response.base64Body && 'base64')
        || (item.response.bodyFileName && 'bodyFileName')
        || (item.response.body && getTextType(item.response.body))
        || 'none'
    if (item.response.jsonBody) item.response.body = JSON.stringify(item.response.jsonBody)
    if ($(item.response.body)) item.response.body = ''
    // if ($(item.response.jsonBody)) item.response.jsonBody = {}
    if ($(item.response.base64Body)) item.response.base64Body = ''
    if ($(item.response.bodyFileName)) item.response.bodyFileName = ''
    // Response Template
    if ($(item.response.transformers)) item.response.transformers = []
    if ($(item.response.transformerParameters)) item.response.transformerParameters = {}
    // 3.3 Response Type：Fault Response
    if ($(item.response.fault)) item.response.fault = 'EMPTY_RESPONSE';
    // 3.4 Response Type：Proxy
    if ($(item.response.proxyBaseUrl)) item.response.proxyBaseUrl = ''
    if ($(item.response.additionalProxyRequestHeaders)) item.response.additionalProxyRequestHeaders = {}
    if ($(item.metadata.render.response.proxy)) item.metadata.render.response.proxy = {}
    if ($(item.metadata.render.response.proxy.headers)) item.metadata.render.response.proxy.headers = []
    const tmpProxyHeaders = item.response.additionalProxyRequestHeaders || {}
    Object.keys(tmpProxyHeaders).forEach(key => {
        item.metadata.render.response.proxy.headers.push({
            key: key,
            value: tmpProxyHeaders[key] && tmpProxyHeaders[key].toString()
        })
    });

    // 4. PostServeActions
    if ($(item.postServeActions)) {
        item.postServeActions = []
    }
    item.metadata.render.postServeActions = [];
    (item.postServeActions || []).forEach((webhook, index) => {
        item.metadata.render.postServeActions[index] = {
            parameters: {
                headers: []
            }
        }
        const headers = webhook.parameters.headers || {}
        Object.keys(headers).forEach(key => {
            // 对象转数组
            item.metadata.render.postServeActions[index].parameters.headers.push({
                key: key,
                value: headers[key] && headers[key].toString()
            })
            // 根据 Content-Type 判断 Body 数据格式
            if (key.toLowerCase() === 'content-type') {
                const value = headers[key]
                item.metadata.render.postServeActions[index].parameters.bodyType = (function () {
                    const map = new Map([
                        ['application/json', 'json'],
                        ['application/xml', 'xml'],
                        ['text/html', 'html'],
                        ['text/plain', 'text']
                    ])
                    for (let [cmp, type] of map.entries()) {
                        if (value.includes(cmp)) return type
                    }
                    return 'text'
                })()
            }
        });

        item.metadata.render.postServeActions[index].parameters.delayType = (webhook.parameters.delay && webhook.parameters.delay.type) || 'none'
        if($(webhook.parameters.delay)) webhook.parameters.delay = {
            type: 'fixed'
        }
        if($(webhook.parameters.delay!.milliseconds)) webhook.parameters.delay!.milliseconds = 0
        if($(webhook.parameters.delay!.median)) webhook.parameters.delay!.median = 0
        if($(webhook.parameters.delay!.sigma)) webhook.parameters.delay!.sigma = 0
        if($(webhook.parameters.delay!.lower)) webhook.parameters.delay!.lower = 0
        if($(webhook.parameters.delay!.upper)) webhook.parameters.delay!.upper = 0

    });
    return item
}

// 兼容性回退，默认根据 metadata 上记录的类型判断
const getTextType = (text: string) => {
    try {
        JSON.parse(text)
        return 'json'
    } catch {
        // XML HTML 无法准确区分，使用其他方案：metadata 上记录 Response Body Text Type
        return 'text'
    }
}

/**
 * 将 API 数据中的匹配数据（Query Params/Headers/Cookies/BodyPatterns）转换为前端渲染数据
 * @param apiDataWithMatch API Data(Match)
 * @returns Render Data(Match)
 */
export function apiDataToRenderDataWithMatch(apiDataWithMatch: any): MatchNodeData[] {
    let res: MatchNodeData[] = []
    if (Object.prototype.toString.call(apiDataWithMatch) === '[object Object]') {
        // Query Params/Headers/Cookies 转换：遍历字段
        for (let name in apiDataWithMatch) {
            const item: MatchNodeData[] = convertChildren(apiDataWithMatch[name], null)
            item[0].key = name
            res = [...res, ...item]
        }
    } else {
        // BodyPatterns 转换
        res = convertChildren(apiDataWithMatch, null)
    }
    // BodyPatterns
    return res
}

// 子级转换
function convertChildren(subPredicateData: any, parentPredicate: string | null): MatchNodeData[] {
    const res: MatchNodeData[] = []
    // 规范数据格式：子匹配数据统一转为数组。比如 and 子匹配为数组，matchesJsonPath 子匹配为对象。
    let predicateDatas = []
    if (Object.prototype.toString.call(subPredicateData) === '[object Object]') {
        predicateDatas.push(subPredicateData)
    } else {
        predicateDatas = subPredicateData
    }
    // 对匹配数据进行格式转换
    for (let predicateData of predicateDatas) {
        res.push(convertSinglePredicateData(predicateData, parentPredicate))
    }
    return res
}

// 转换单个匹配数据
function convertSinglePredicateData(singlePredicateData: any, parentPredicate: string | null): MatchNodeData {
    const item: MatchNodeData = {
        id: nanoid(),
        key: null,
        predicate: '',
        parentPredicate: parentPredicate,
        value: null,
        extra: {
            tmpParamKeys: [],
            tmpParams: []
        },
        params: [],
        children: []
    }
    // 兼容性处理：matchesJsonPath 或 matchesXPath 直接相互嵌套，服务端会自动增加一级 submatcher 节点，这里去掉该节点
    if (singlePredicateData.submatcher) {
        const predicate = Object.keys(singlePredicateData.submatcher)[0]
        singlePredicateData[predicate] = singlePredicateData.submatcher[predicate]
        delete singlePredicateData.submatcher
    }
    // 遍历一个匹配的节点数据
    for (let key in singlePredicateData) {
        const value = singlePredicateData[key]
        if ($enum.ALL_PREDICATE_COLLECTION.includes(key)) {    // predicate
            item.predicate = key
            if (['[object String]', '[object Boolean]'].includes(Object.prototype.toString.call(value))) {
                item.value = value
                if (key === 'absent') {       //el-input 不支持绑定 boolean 类型变量，此处做下类型转换
                    item.extra.strValue = value.toString()
                }
            } else {
                item.children = convertChildren(value, key)
            }
        } if (key === 'expression') {                  // key(expression)
            item.key = value
        } else {                                       // params
            const param: any = {
                enabled: true,
                key: key
            }
            if (key === 'xPathNamespaces') {
                param.value = []
                for (let namespaceName in value) {
                    param.value.push({
                        key: namespaceName,
                        value: value[namespaceName]
                    })
                }
            } else if (!$enum.CHECKBOX_PARAM_COLLECTION.includes(key)) {
                param.value = value
            }
            item.extra.tmpParamKeys.push(key)
            item.extra.tmpParams.push(param)
        }
    }
    // 填充缺失的 param 并排序
    for (let paramKey of ($enum.PREDICATE_PARAMS_COLLETION.get(item.predicate) || [])) {
        const index = item.extra.tmpParamKeys.indexOf(paramKey)
        if (index !== -1) {
            item.params!.push(item.extra.tmpParams[index])
        } else {
            const param: any = {
                enabled: false,
                key: paramKey
            }
            switch (paramKey) {
                case 'expectedOffset':
                    param.value = 0;
                    break;
                case 'expectedOffsetUnit':
                    param.value = 'months';
                    break;
                case 'truncateExpected':
                case 'truncateActual':
                    param.value = 'first day of month';
                    break;
                case 'actualFormat':
                    param.value = 'yyyy-MM-dd HH:mm:ss';
                    break;
                case 'placeholderOpeningDelimiterRegex':
                    param.value = '\\[\\[';
                    break;
                case 'placeholderClosingDelimiterRegex':
                    param.value = ']]';
                    break;
                case 'exemptedComparisons':
                case 'xPathNamespaces':
                    param.value = [];
                    break;
                default:
                    break;
            }
            item.params!.push(param)
        }
    }
    // 渲染需要的参数，API 数据中不存在该参数
    if (['matchesJsonPath', 'matchesXPath'].includes(item.predicate)) {
        const param: any = {
            enabled: true,
            key: 'subPredicate'
        }
        if (item.value !== null) param.enabled = false
        item.params!.unshift(param)
    }
    delete item.extra.tmpParamKeys
    delete item.extra.tmpParams
    return item
}

