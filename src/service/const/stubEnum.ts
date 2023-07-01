// 1. General Info

const PRIORITY = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// 2. Request Enum

const REQUEST_METHOD = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'TRACE', 'ANY'];
const URL_MATCH_TYPE = [
  { label: 'Path and query', value: 'url' },
  { label: 'Path and query regex', value: 'urlPattern' },
  { label: 'Path', value: 'urlPath' },
  { label: 'Path regex', value: 'urlPathPattern' },
  { label: 'Any URL', value: 'any' }
];

// 2.1 Predicate
const ALL_PREDICATE_COLLECTION = [
  'equalTo',
  'binaryEqualTo',
  'contains',
  'doesNotContain',
  'matches',
  'doesNotMatch',
  'absent',
  'before',
  'after',
  'equalToDateTime',
  'hasExactly',
  'includes',
  'equalToJson',
  'matchesJsonPath',
  'equalToXml',
  'matchesXPath',
  'and',
  'or'
]
const NO_SUBPREDICATE_COLLECTION = [
  'equalTo',
  'binaryEqualTo',
  'contains',
  'doesNotContain',
  'matches',
  'doesNotMatch',
  'absent',
  'before',
  'after',
  'equalToDateTime',
  'equalToJson',
  'equalToXml'
]
const MULTI_SUBPREDICATE_COLLECTION = [
  'hasExactly',
  'includes',
  'and',
  'or'
]
const SUBPREDICATE_NO_KEY_COLLECTION = [
  'hasExactly',
  'includes',
  'and',
  'or'
]
const NO_VALUE_PREDICATE_COLLECTION = [
  'hasExactly',
  'includes',
  'and',
  'or',
  'matchesJsonPath',
  'matchesXPath'
]


// 2.2 Predicate Param Key
const equalToParams = ['caseInsensitive']
const timeParams = ['expectedOffset', 'expectedOffsetUnit', 'truncateExpected', 'truncateActual', 'actualFormat']
const equalToJsonParams = ['ignoreArrayOrder', 'ignoreExtraElements']
const equalToXmlParams = ['enablePlaceholders', 'placeholderOpeningDelimiterRegex', 'placeholderClosingDelimiterRegex', 'exemptedComparisons']
const matchesXPathParams = ['xPathNamespaces']
const PREDICATE_PARAMS_COLLETION = new Map([
  ['equalTo', equalToParams],
  ['before', timeParams],
  ['after', timeParams],
  ['equalToDateTime', timeParams],
  ['equalToJson', equalToJsonParams],
  ['equalToXml', equalToXmlParams],
  ['matchesXPath', matchesXPathParams]
])

const CHECKBOX_PARAM_COLLECTION = [
  'caseInsensitive',
  'ignoreArrayOrder',
  'ignoreExtraElements',
  'enablePlaceholders'
]
const INPUT_PARAM_COLLECTION = [
  'expectedOffset',
  'actualFormat',
  'placeholderOpeningDelimiterRegex',
  'placeholderClosingDelimiterRegex'
]
const SINGLE_SELECT_PARAM_COLLECTION = [
  'expectedOffsetUnit',
  'truncateExpected',
  'truncateActual',
]
const MULTI_SELECT_PARAM_COLLECTION = [
  'exemptedComparisons'
]

// 2.3 Predicate Param Value
const offsetUnitOptions = ['seconds', 'minutes', 'hours', 'days', 'months', 'years']
const truncateOptions = [
  'first second of minute',
  'first minute of hour',
  'first hour of day',
  'first day of month',
  'first day of next month',
  'last day of month',
  'first day of year',
  'first day of next year',
  'last day of year'
]
const exemptedComparisonOptions = [
  'ELEMENT_TAG_NAME',
  'SCHEMA_LOCATION',
  'NO_NAMESPACE_SCHEMA_LOCATION',
  'NODE_TYPE',
  'NAMESPACE_URI',
  'TEXT_VALUE',
  'PROCESSING_INSTRUCTION_TARGET',
  'PROCESSING_INSTRUCTION_DATA',
  'ELEMENT_NUM_ATTRIBUTES',
  'ATTR_VALUE',
  'CHILD_NODELIST_LENGTH',
  'CHILD_LOOKUP',
  'ATTR_NAME_LOOKUP'
]
const PREDICATE_PARAM_OPTIONS_COLLECTION: {
  [key: string]: string[]
} = {
  expectedOffsetUnit: offsetUnitOptions,
  truncateExpected: truncateOptions,
  truncateActual: truncateOptions,
  exemptedComparisons: exemptedComparisonOptions
}

// 2.4 Predicate Param Default Value
const equalToParamsDefaultValue = [{
  enabled: false,
  key: "caseInsensitive"
}]
const truncateParamsDefaultValue = [
  {
      enabled: false,
      key: 'expectedOffset',
      value: 0
  }, {
      enabled: false,
      key: 'expectedOffsetUnit',
      value: 'months'
  }, {
      enabled: false,
      key: 'truncateExpected',
      value: 'first day of month'
  }, {
      enabled: false,
      key: 'truncateActual',
      value: 'first day of month'
  }, {
      enabled: false,
      key: 'actualFormat',
      value: 'dd/MM/yyyy'
  }
]
const equalToJsonParamsDefaultValue = [
  {
      enabled: false,
      key: 'ignoreArrayOrder'
  }, {
      enabled: false,
      key: 'ignoreExtraElements'
  }
]
const equalToXmlParamsDefaultValue = [
  {
      enabled: false,
      key: 'enablePlaceholders'
  }, {
      enabled: false,
      key: 'placeholderOpeningDelimiterRegex',
      value: '\\[\\['
  }, {
      enabled: false,
      key: 'placeholderClosingDelimiterRegex',
      value: ']]'
  }, {
      enabled: false,
      key: 'exemptedComparisons',
      value: []
  }
]
const matchesJsonPathParamsDefaultValue = [
  {
      enabled: true,
      key: 'subPredicate'
  }
]
const matchesXPathParamsDefaultValue = [
  {
      enabled: true,
      key: 'subPredicate'
  }, {
      enabled: false,
      key: 'xPathNamespaces',
      value: []
  }
]
const PREDICATE_PARAM_DEFAULT_VALUE:{
  [key: string]: {
    enabled: boolean,
    key: string,
    value?: string | number | Array<any>
  }[]
} = {
  equalTo: equalToParamsDefaultValue,
  before: truncateParamsDefaultValue,
  after: truncateParamsDefaultValue,
  equalToDateTime: truncateParamsDefaultValue,
  equalToJson: equalToJsonParamsDefaultValue,
  equalToXml: equalToXmlParamsDefaultValue,
  matchesJsonPath: matchesJsonPathParamsDefaultValue,
  matchesXPath: matchesXPathParamsDefaultValue
}

// 4. Webhook

const WEBHOOK_METHOD = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'TRACE'];



export default {
  PRIORITY,
  REQUEST_METHOD,
  WEBHOOK_METHOD,
  URL_MATCH_TYPE,
  ALL_PREDICATE_COLLECTION,
  NO_SUBPREDICATE_COLLECTION,
  MULTI_SUBPREDICATE_COLLECTION,
  SUBPREDICATE_NO_KEY_COLLECTION,
  NO_VALUE_PREDICATE_COLLECTION,
  PREDICATE_PARAMS_COLLETION,
  CHECKBOX_PARAM_COLLECTION,
  INPUT_PARAM_COLLECTION,
  SINGLE_SELECT_PARAM_COLLECTION,
  MULTI_SELECT_PARAM_COLLECTION,
  PREDICATE_PARAM_OPTIONS_COLLECTION,
  PREDICATE_PARAM_DEFAULT_VALUE
}