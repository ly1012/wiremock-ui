import { httpSingle } from '@/lib/axios';

// <predicate> 可选值：
// 1. equalTo           相等
//    [case1] { "equalTo": "WireMock" }                                       //默认区分大小写
//    [case2] { "equalTo": "application/json", "caseInsensitive": true }      //不区分大小写
// 
// 2. binaryEqualTo     二进制相等（转换为 Base64 比较），用于匹配非纯文本，比如字节流、对象、文件
//    [case1] { "binaryEqualTo" : "AQID" }                                    //new byte[] { 1, 2, 3 }
// 
// 3. contains          包含
//    [case1] { "contains": "johnsmith@example.com" }
// 
// 4. doesNotContain    不包含
//    [case1] { "doesNotContain": "johnsmith@example.com" }
// 
// 5. matches           正则匹配
//    [case1] { "matches": ".*12345.*" }
// 
// 6. doesNotMatch      反向正则匹配，当值不匹配正则表达式时匹配成功
//    [case1] { "doesNotMatch" : "^(.*)wiremock([A-Za-z]+)$" }
// 
// 7. equalToJson       相等（JSON）
//    [case1] { "equalToJson": { "total_results": 4 } }       //JSONObject 形式
//    [case2] { "equalToJson": "{ \"total_results\": 4 }" }   //JSON 字面量形式
//    [case3] { "equalToJson": "{ \"total_results\": 4  }", "ignoreArrayOrder": true, "ignoreExtraElements": true }   //额外控制选项，选项默认都是 false
//    [case4] { "equalToJson": { "id": "${json-unit.any-string}" } }    //JSON Unit 占位符，{ "id": "abc123" } 匹配成功
// 
// 8. matchesJsonPath   JSON Path
//    ### Direct JSONPath ###
//    [case1] { "matchesJsonPath": "$.name" }
//            匹配成功：{ "name": "Wiremock" }
//            匹配失败：{ "price": 15 } 
//    [case2] { "matchesJsonPath" : "$.things[?(@.name == 'RequiredThing')]" }  
//            匹配成功：{ "things": { "name": "RequiredThing" } }
//                     { "things": [ { "name": "RequiredThing" }, { "name": "Wiremock" } ] } 
//            匹配失败：{ "price": 15 }
//                     { "things": { "name": "Wiremock" } } 
//    [case3] { "matchesJsonPath" : "$.things[?(@.name =~ /Required.*/i)]" }
//            匹配成功：{ "things": { "name": "RequiredThing" } }
//                     { "things": [ { "name": "Required" }, { "name": "Wiremock" } ] } 
//            匹配失败：{ "price": 15 }
//                     { "things": { "name": "Wiremock" } }
//                     { "things": [ { "name": "Thing" }, { "name": "Wiremock" } ] } 
//    [case4] { "matchesJsonPath" : "$[?(@.things.size() == 2)]" }
//            匹配成功：{ "things": [ { "name": "RequiredThing" }, { "name": "Wiremock" } ] }
//            匹配失败：{ "things": [ { "name": "RequiredThing" } ] } 
//    ### Nested Match ###
//    [case5]   contains
//              { "matchesJsonPath": { "expression": "$..todoItem", "contains": "wash" } }
//    [case6]   equalToJson
//              { "matchesJsonPath": { "expression": "$.outer", "equalToJson": "{ \"inner\": 42 }"} }
//    [case7]   equalTo
//              {expression: "$.data.id", equalTo: "xxxyyy"}}
//    [case8]   contains
//              {expression: "$.data.id", contains: "xx"}}
//    [case9]   matches          
//              {expression: "$.data.id", matches: "/x{3}/"}}
//    [case10]  doesNotMatch     
//              {expression: "ee", doesNotMatch: "/x{4}/"}}
//    [case11]  absent           
//              {expression: "ee", absent: true}
//    [case12] after
//            {
//              "matchesJsonPath": {
//                "expression": "$.completedDate",
//                "after": "now +15 days",
//                "truncateExpected": "first day of month"
//              }
//            }
//    [case13] equalToDateTime
//            {
//              "matchesJsonPath": {
//                  "expression": "$.completedDate",
//                  "equalToDateTime": "2020-03-01T00:00:00Z",
//                  "truncateActual": "first day of month"
//              }
//            }
//    [case14] and
//           {
//             "matchesJsonPath": {
//                 "expression": "$.date",
//                 "and": [
//                     { "before": "2022-01-01T00:00:00" },
//                     { "after": "2020-01-01T00:00:00" }
//                 ]
//             }
//           }
// 
// 9. equalToXml       相等（XML）
//    [case1] { "equalToXml": "<thing>Hello</thing>" }
//    [case2] { "equalToXml": "<message><id>${xmlunit.ignore}</id><content>Hello</content></message>", "enablePlaceholders": true }  //XMLUnit 占位符
//            匹配成功：<message><id>123456</id><content>Hello</content></message>
//    [case3] { "equalToXml": "<message><id>[[xmlunit.ignore]]</id><content>Hello</content></message>", "enablePlaceholders": true, 
//            "placeholderOpeningDelimiterRegex": "\\[\\[", "placeholderClosingDelimiterRegex": "]]" }                               //使用自定义 delimiters
//    [case4] { "equalToXml": "<thing>Hello</thing>", "exemptedComparisons": ["NAMESPACE_URI", "ELEMENT_TAG_NAME"] }                 //忽视指定的比较类型
//            完整的类型列表如下：
//            ELEMENT_TAG_NAME SCHEMA_LOCATION NO_NAMESPACE_SCHEMA_LOCATION NODE_TYPE NAMESPACE_URI TEXT_VALUE PROCESSING_INSTRUCTION_TARGET
//            PROCESSING_INSTRUCTION_DATA ELEMENT_NUM_ATTRIBUTES ATTR_VALUE CHILD_NODELIST_LENGTH CHILD_LOOKUP ATTR_NAME_LOOKUP
// 
// 10. matchesXPath      XPath
//    ### Direct XPath ###
//    [case1] { "matchesXPath": "/todo-list[count(todo-item) = 3]" }
//    [case2] //基于 namespace
//            {
//              "matchesXPath" : "/stuff:outer/more:inner[.=111]",
//              "xPathNamespaces" : {
//                "stuff" : "http://stuff.example.com",
//                "more"  : "http://more.example.com"
//              }
//            }
//    ### Nested Match ###
//    [case3] contains
//           {
//             "matchesXPath" : {
//               "expression": "//todo-item/text()",
//               "contains": "wash"
//             }
//           }
//    [case4] equalToXml
//           {
//             "matchesXPath" : {
//                "expression": "//todo-item",
//                "equalToXml": "<todo-item>Do the washing</todo-item>"
//             }
//           }
// 
// 11. absent        缺失该属性
//    [case1] { "absent": true }
// 
// 12. before       在某个时间之前
//    [case1] { "before": "now +3 days" }
//    [case2] {
//                // This is equivalent to "now +2 months"
//                "before": "now",
//                "expectedOffset": 2,
//                "expectedOffsetUnit": "months"
//            }
// 
// 
// 13. after        在某个时间之后
//    [case1] { "after": "2021-05-01T00:00:00Z" }
//    [case2] { "after": "now +15 days", "truncateExpected": "first day of month" }
// 
// 
// 14. equalToDateTime
//    [case1] { "equalToDateTime": "2021-06-24T00:00:00", "actualFormat": "dd/MM/yyyy" }
//    [case2] { "equalToDateTime": "2020-03-01T00:00:00Z", "truncateActual": "first day of month" }
//    [truncateActual - full list] first minute of hour
//                first hour of day
//                first day of month
//                first day of next month
//                last day of month
//                first day of year
//                first day of next year
//                last day of year
// 
// 15. and
//      [case1] {
//                 "and": [
//                     { "matches": "[a-z]+" },
//                     { "contains": "magicvalue" }
//                 ]
//               }
//      [case2] {
//                 "and": [
//                     { "before": "2022-01-01T00:00:00" },
//                     { "after": "2020-01-01T00:00:00" }
//                 ]
//              }
// 
// 
// 16. or
//      [case1] {
//                "or": [
//                    { "matches": "[a-z]+" },
//                    { "absent": true }
//                ]
//              }
// 
// 
// 17. hasExactly（queryParameters/headers） 多值参数，准确匹配预定规则且不包含其他值，顺序不影响
//    [case1] ?id=1&id=2&id=3 或者 ?id=2&id=3&id=1 或者 多个 id Header
//            了解多值 Param 和多值 Header：https://www.cnblogs.com/hochan100/p/14924316.html
//            {
//              "hasExactly": [
//                { "equalTo": "1" },
//                { "equalTo": "2" },
//                { "equalTo": "3" }
//              ]
//            }
//    [case2] ?id=1&id=xx2yy&id=12456
//            {
//              "hasExactly": [
//                { "equalTo": "1" },
//                { "contains": "2" },
//                { "doesNotContain": "3" }
//              ]
//            }
// 
// 18. includes（queryParameters/headers） 多值参数，包含匹配预定规则，可以包含其他值，顺序不影响
//      [case1] ?id=1&id=2&id=3&id=4&id=5
//             {
//               "includes": [
//                 { "equalTo": "1" },
//                 { "equalTo": "2" },
//                 { "equalTo": "3" }
//               ]
//             }
//      [case2] ?id=1&id=223&id=abc&id=000
//             {
//               "includes": [
//                 { "equalTo": "1" },
//                 { "contains": "2" },
//                 { "doesNotContain": "3" }
//               ]
//             }


// fault 可选值：
// EMPTY_RESPONSE               不发送响应数据，直接关闭 socket 连接。
//                              Postman 错误信息：socket hang up
// RANDOM_DATA_THEN_CLOSE       发送非法响应数据，然后关闭 socket 连接。
//                              Postman 错误信息：Parse Error: Expected HTTP/
// MALFORMED_RESPONSE_CHUNK     发送 200 状态码和非法响应数据，然后关闭 socket 连接。
//                              Postman 错误信息：Parse Error: Invalid character in chunk size
// CONNECTION_RESET_BY_PEER     Peer connection reset
//                              Postman 错误信息：read ECONNRESET

export interface IStubMapping {
  id?: string,                    //stub mapping 的唯一标识
  uuid?: string,                  //同 id
  name?: string,                   //Stub Mapping 名称
  priority?: number,               //该 stub mapping 相对于其他 stub mapping 的优先级。
  //默认为 5，最高为 1，取值范围为 [1, Integer.MAX_VALUE]
  persistent?: boolean,            //增删改时，是否持久化存储。默认在内存，未持久化，true 表示持久化
  request: {
    method?: string,               //['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE', 'ANY'];
    // 当 urlPath、urlPathPattern、url、urlPattern 都未指定时，表示 URL 为任意字符串
    urlPath?: string,             //Path 精确匹配
    urlPathPattern?: string,      //Path regex 匹配
    url?: string,                 //Path and Query 精确匹配
    urlPattern?: string,          //Path and Query regex 匹配
    queryParameters?: object,     //Query 参数匹配模式，格式为 <key>: { "<predicate>": "<value>" }
    // Request Headers
    headers?: object,             //请求 Header 匹配模式，格式为 <key>: { "<predicate>": "<value>" }
    //示例：{"Accept":{"contains":"json"}}
    cookies?: object,             //Cookie 匹配模式，格式为 <key>: { "<predicate>": "<value>" }
    // Request Body
    bodyPatterns?: Array<any>,    //请求 Body 匹配模式，格式为 { "<predicate>": "<value>" }，
    //示例：[{"matchesJsonPath":{"expression":"$.data.id","equalTo":"xxxyyy"}}]
    multipartPatterns?: Array<{   //multipart/form-data
      matchingType?: string,
      headers?: any,
      bodyPatterns?: any
    }>,
    formParameters?: any,         //application/x-www-form-urlencoded。格式为 <key>: { "<predicate>": "<value>" }
    // Auth
    basicAuthCredentials?: {      //Pre-emptive basic auth credentials 匹配
      username: string,
      password: string
    },
    customMatcher?: {             //自定义的请求匹配器
      name: string,
      parameters?: object
    }
  },
  // Direct、Fault、Proxy 有且仅有一个
  response: {
    status?: number,              //HTTP 响应状态码，如 200
    statusMessage?: string,       //HTTP 响应状态信息，如 OK
    // body、jsonBody、base64Body、bodyFileName 有且仅有一个
    headers?: {                   //响应 Headers，值类型为 string | Array<string>
      [key: string]: string | Array<string>
    },                 
    // Header 的值一般为 string，即一个 Header 名称只有一个值。
    // 如果一个 Header 名称需要多个值，使用 Array<string>
    body?: string,                //响应正文：纯文本
    jsonBody?: object,            //响应正文：JSON 对象
    base64Body?: string,          //响应正文的 base64 编码字符串，比如用于二进制内容
    bodyFileName?: string,        //包含响应正文信息的文件路径，相对于配置的文件根路径的相对路径
    fixedDelayMilliseconds?: number,            //发送 response 前的固定延时，单位毫秒
    delayDistribution?: {         //随机延时设置
      type: string,               //随机延迟类型，可选值：lognormal、uniform
      median?: number,            //延时中值（lognormal 参数）
      sigma?: number,             //标准差（lognormal 参数）
      lower?: number,             //最小值（uniform 参数）
      upper?: number              //最大值（uniform 参数）
    },
    chunkedDribbleDelay?: {       //模拟弱网环境
      numberOfChunks: number,     //将响应切分为多少个 Chunk
      totalDuration: number       //总的响应时间
    }
    fault?: string,               //发送响应错误
    proxyBaseUrl?: string,        //要转发到的目标，其 Base URL
    additionalProxyRequestHeaders?: {           //当代理到其他 host 时，额外添加的请求 Headers
      [key: string]: string
    },
    transformers?: Array<string>,               //应用到该 response 的 transformer 名称列表
    transformerParameters?: object,             //应用到 response transformer 的参数
    fromConfiguredStub?: boolean                //是否参与请求匹配，即启用禁用功能，默认 true 表示启用

  }
  scenarioName?: string,          //场景名称，用于相同的请求但不同的响应，管理响应返回顺序
  requiredScenarioState?: string, //依赖的场景状态
  newScenarioState?: string,      //下一个场景状态（即 Stub 返回后场景的当前状态）
  postServeActions?: Array<{      //post serve action 扩展（当前仅支持 webhook 扩展）
    name: string,
    parameters: {
      method: string,
      url: string,
      headers?: {
        [key: string]: string
      },
      body?: string,
      delay?: {
        type: string,             //可选值：fixed、uniform、lognormal
        milliseconds?: number     //(fixed)
        lower?: number,           //(uniform)
        upper?: number,           //(uniform)
        median?: number,          //(lognormal)
        sigma?: number            //(lognormal)
      }
    }
  }>,
  metadata?: any,                 //额外的元数据，比如记录 Stub Mapping 的标签、创建时间、更新时间等
}

/**
 * 指定【 mockUrl 】新增 mapping
 * @param mockUrl
 * @param params
 * @returns {*}
 */
export const C_Mapping = (mockUrl: string, params: IStubMapping) => {
  return httpSingle({
    url: `${mockUrl}/__admin/mappings`,
    method: 'post',
    data: params
  });
};

/**
 * 修改指定【 mockUrl 】中，指定【 mappingUUID 】的 mapping 信息
 * @param mockUrl
 * @param mappingUUID
 * @param params
 * @returns {*}
 */
export const U_Mapping = (mockUrl: string, mappingUUID: string, params: IStubMapping) => {
  return httpSingle({
    url: `${mockUrl}/__admin/mappings/${mappingUUID}`,
    method: 'put',
    data: params
  });
};

/**
 * 查询指定【 mockUrl 】mapping 列表数据
 * 
 * 查询结果为 [offset, offset + limit -1]
 * 
 * @param mockUrl
 * @param params
 * @returns {*}
 */
interface ISearchOptions {
  offset: number,         //开始索引，从 0 开始，包括 0
  limit: number           //查询数量
}
export const R_Mappings = (mockUrl: string, params: ISearchOptions) => {
  return httpSingle({
    url: `${mockUrl}/__admin/mappings`,
    method: 'get',
    params: params
  });
};

/**
 * 查询指定【 mockUrl 】中，指定【 mappingUUID 】的 mapping 信息
 * @param mockUrl
 * @param mappingUUID
 * @returns {*}
 */
export const R_Mapping = (mockUrl: string, mappingUUID: string) => {
  return httpSingle({
    url: `${mockUrl}/__admin/mappings/${mappingUUID}`,
    method: 'get'
  });
};

/**
 * 删除指定【 mockUrl 】中，指定【 mappingUUID 】的 mapping 信息
 * @param mockUrl
 * @param mappingUUID
 * @returns {*}
 */
export const D_Mapping = (mockUrl: string, mappingUUID: string) => {
  return httpSingle({
    url: `${mockUrl}/__admin/mappings/${mappingUUID}`,
    method: 'delete'
  });
};


