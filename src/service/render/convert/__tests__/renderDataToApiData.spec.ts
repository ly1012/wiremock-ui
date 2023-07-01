import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import { renderDataToApiDataWithMatch } from '../renderDataToApiData'

describe('renderDataToApiData', () => {

    it('Query Params MatchNodeData', () => {
        const renderData = JSON.parse(`[
            {
                "id":"I80RJBZRZDDT",
                "key":"search_term",
                "predicate":"equalTo",
                "parentPredicate":null,
                "value":"WireMock",
                "extra":{

                },
                "params":[
                    {
                        "enabled":false,
                        "key":"caseInsensitive"
                    }
                ],
                "children":[

                ]
            }
        ]`)
        const actual = renderDataToApiDataWithMatch(renderData, {})
        expect(actual).to.deep.equal(JSON.parse(`{
            "search_term": {
               "equalTo": "WireMock"
            }
        }`))

    })

    it('BodyPatterns MatchNodeData', () => {
        const renderData = JSON.parse(`[
            {
                "id":"V382NU6F3LHE",
                "key":null,
                "predicate":"equalToJson",
                "parentPredicate":null,
                "value":"{}",
                "extra":{

                },
                "params":[
                    {
                        "enabled":false,
                        "key":"ignoreArrayOrder"
                    },
                    {
                        "enabled":true,
                        "key":"ignoreExtraElements"
                    }
                ],
                "children":[

                ]
            }
        ]`)
        const actual = renderDataToApiDataWithMatch(renderData, [])
        expect(actual).to.deep.equal(JSON.parse(`[{
            "equalToJson": "{}",
            "ignoreExtraElements": true
        }]`))

    })

})