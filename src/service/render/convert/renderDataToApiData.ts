import { type IStubMapping } from '@/service/api/StubMappings'
import $enum from '@/service/const/stubEnum'
import { type MatchNodeData } from './renderModel'

export const renderDataToApiData = (item: IStubMapping) => {
    const res: IStubMapping = {
        metadata: {},
        request: {},
        response: {}
    }
    // 1. General Info
    if (item.id) res.id = item.id
    if (item.uuid) res.uuid = item.uuid
    if (item.name) res.name = item.name
    if (item.priority) res.priority = item.priority
    res.persistent = true
    res.metadata.wmui = JSON.parse(JSON.stringify(item.metadata.wmui))
    if (item.scenarioName) res.scenarioName = item.scenarioName
    if (item.requiredScenarioState) res.requiredScenarioState = item.requiredScenarioState
    if (item.newScenarioState) res.newScenarioState = item.newScenarioState


    // 2. Request
    // 2.1 Request METHOD URL QueryParams
    if (item.request.method) res.request.method = item.request.method
    switch (item.metadata.render.request.urlMatchType) {
        case 'url':
            res.request.url = item.metadata.render.request.url
            break;
        case 'urlPattern':
            res.request.urlPattern = item.metadata.render.request.url
            break;
        case 'urlPath':
            res.request.urlPath = item.metadata.render.request.url
            break;
        case 'urlPathPattern':
            res.request.urlPathPattern = item.metadata.render.request.url
        default:
            break;
    }
    if (item.metadata.render.request.queryParameters && item.metadata.render.request.queryParameters.length) {
        res.request.queryParameters = renderDataToApiDataWithMatch(item.metadata.render.request.queryParameters, {})
    }
    // 2.2 Request Headers
    if (item.metadata.render.request.authType === 'basicAuth') {
        res.request.basicAuthCredentials = JSON.parse(JSON.stringify(item.request.basicAuthCredentials))
    }
    if (item.metadata.render.request.headers && item.metadata.render.request.headers.length) {
        res.request.headers = renderDataToApiDataWithMatch(item.metadata.render.request.headers, {})
    }
    if (item.metadata.render.request.cookies && item.metadata.render.request.cookies.length) {
        res.request.cookies = renderDataToApiDataWithMatch(item.metadata.render.request.cookies, {})
    }
    // 2.3 Request Body
    switch (item.metadata.render.request.bodyType) {
        case 'raw':
            res.request.bodyPatterns = renderDataToApiDataWithMatch(item.metadata.render.request.bodyPatterns, [])
            break;
        case 'form-data':
            res.request.multipartPatterns = []
            for (let multipartPattern of (item.metadata.render.request.multipartPatterns || [])) {
                res.request.multipartPatterns.push({
                    matchingType: multipartPattern.matchingType,
                    headers: renderDataToApiDataWithMatch(multipartPattern.headers, {}),
                    bodyPatterns: renderDataToApiDataWithMatch(multipartPattern.bodyPatterns, [])
                })
            }
            break;
        case 'x-www-form-urlencoded':
            res.request.formParameters = renderDataToApiDataWithMatch(item.metadata.render.request.formParameters, {})
            break;
        default:
            break;
    }
    if (item.request.customMatcher && item.request.customMatcher.name) {
        res.request.customMatcher = JSON.parse(JSON.stringify(item.request.customMatcher))
    }

    // 3. Response
    switch (item.metadata.render.response.responseType) {
        case 'proxy':
            res.response.proxyBaseUrl = item.response.proxyBaseUrl
            const headers: {
                [key: string]: string
            } = {}
            for (let header of item.metadata.render.response.proxy.headers) {
                headers[header.key] = header.value
            }
            res.response.additionalProxyRequestHeaders = headers
            break;
        case 'fault':
            res.response.fault = item.response.fault
            break;
        case 'direct':
            res.response.status = item.response.status
            res.response.statusMessage = item.response.statusMessage
            if (item.metadata.render.response.direct.headers && item.metadata.render.response.direct.headers.length) {
                const headers: {
                    [key: string]: string | Array<string>
                } = {}
                for (let header of item.metadata.render.response.direct.headers) {
                    if (headers[header.key]) {
                        if (typeof (headers[header.key]) === 'string') {
                            headers[header.key] = [headers[header.key], header.value]
                        } else {
                            headers[header.key] = [...headers[header.key], header.value]
                        }
                    } else {
                        headers[header.key] = header.value
                    }
                }
                res.response.headers = headers
            }
            switch (item.metadata.render.response.direct.bodyType) {
                case 'json':
                    res.metadata.wmui.responseBodyType = 'json'
                    try{
                        res.response.jsonBody = JSON.parse(item.response.body || '{}')
                    } catch {
                        res.response.jsonBody = {}
                    }
                    break;
                case 'xml':
                    res.metadata.wmui.responseBodyType = 'xml'
                    res.response.body = item.response.body
                    break;
                case 'html':
                    res.metadata.wmui.responseBodyType = 'html'
                    res.response.body = item.response.body
                    break;
                case 'text':
                    res.metadata.wmui.responseBodyType = 'text'
                    res.response.body = item.response.body
                    break;
                case 'base64':
                    res.metadata.wmui.responseBodyType = 'base64'
                    res.response.base64Body = item.response.base64Body
                    break;
                case 'bodyFileName':
                    res.metadata.wmui.responseBodyType = 'bodyFileName'
                    res.response.bodyFileName = item.response.bodyFileName
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }
    switch (item.metadata.render.response.delayType) {
        case 'fixedDelayMilliseconds':
            res.response.fixedDelayMilliseconds = item.response.fixedDelayMilliseconds
            break;
        case 'chunkedDribbleDelay':
            res.response.chunkedDribbleDelay = JSON.parse(JSON.stringify(item.response.chunkedDribbleDelay))
            break;
        case 'lognormal':
            res.response.delayDistribution = {
                type: 'lognormal',
                median: item.response.delayDistribution?.median,
                sigma: item.response.delayDistribution?.sigma
            }
            break;
        case 'uniform':
            res.response.delayDistribution = {
                type: 'uniform',
                lower: item.response.delayDistribution?.lower,
                upper: item.response.delayDistribution?.upper
            }
            break;
        default:
            break;
    }
    res.response.fromConfiguredStub = item.response.fromConfiguredStub
    if (item.response.transformers && item.response.transformers.length) {
        res.response.transformers = item.response.transformers
    }
    if (item.response.transformerParameters && Object.keys(item.response.transformerParameters).length) {
        res.response.transformerParameters = item.response.transformerParameters
    }

    res.postServeActions = [];
    // 4. PostServeActions
    (item.postServeActions || []).forEach((webhook, index) => {
        const tmpItem: any = {}
        tmpItem.name = webhook.name
        tmpItem.parameters = {}
        tmpItem.parameters.method = webhook.parameters.method
        tmpItem.parameters.url = webhook.parameters.url
        if (item.metadata.render.postServeActions[index].parameters.headers.length) {
            tmpItem.parameters.headers = {}
            for (let header of item.metadata.render.postServeActions[index].parameters.headers) {
                tmpItem.parameters.headers[header.key] = header.value
            }
        }
        tmpItem.parameters.body = webhook.parameters.body
        tmpItem.parameters.delay = {}
        switch (item.metadata.render.postServeActions[index].parameters.delayType) {
            case 'fixed':
                tmpItem.parameters.delay.type = 'fixed'
                tmpItem.parameters.delay.milliseconds = webhook.parameters.delay!.milliseconds
                break;
            case 'lognormal':
                tmpItem.parameters.delay.type = 'lognormal'
                tmpItem.parameters.delay.median = webhook.parameters.delay!.median
                tmpItem.parameters.delay.sigma = webhook.parameters.delay!.sigma
                break;
            case 'uniform':
                tmpItem.parameters.delay.type = 'uniform'
                tmpItem.parameters.delay.lower = webhook.parameters.delay!.lower
                tmpItem.parameters.delay.upper = webhook.parameters.delay!.upper
                break;
            default:
                delete tmpItem.parameters.delay
                break;
        }
        res.postServeActions!.push(tmpItem)
    });

    return res
}

export function renderDataToApiDataWithMatch(renderDataWithMatch: MatchNodeData[], result: any): any {
    if (Object.prototype.toString.call(result) === '[object Object]') {
        for (let item of renderDataWithMatch) {
            if (item.key) {
                result[item.key] = convertChildren([item])?.[0]
            }
        }
    } else {
        result = convertChildren(renderDataWithMatch)
    }
    return result
}

function convertChildren(items: Array<any>) {
    const res: Array<any> = []
    for (let item of items) {
        res.push(convertSinglePredicateData(item))
    }
    return res
}

function convertSinglePredicateData(item: any) {
    const res: any = {}
    if (['matchesJsonPath', 'matchesXPath'].includes(item.parentPredicate)) {
        res.expression = item.key
    }
    if (item.children && item.children.length) {
        const children = convertChildren(item.children)
        if ($enum.MULTI_SUBPREDICATE_COLLECTION.includes(item.predicate)) {
            res[item.predicate] = children
        } else {
            res[item.predicate] = children[0]
        }
    } else {
        res[item.predicate] = item.value
    }
    if (item.params) {
        for (let param of item.params) {
            if (param.enabled && param.key !== 'subPredicate') {
                res[param.key] = param.value ? param.value : param.enabled
            }
        }
    }
    return res
}




