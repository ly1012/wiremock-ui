
export interface MatchNodeData {
    id: string,
    key?: string | null,
    predicate: string,
    parentPredicate?: string | null,
    value?: string | boolean | null,
    params?: {
        enabled: boolean,
        key: string,
        value?: string | number | boolean | Array<string> | Array<{
            key: string,
            value: string
        }>
    }[] | null,
    extra?: any,
    children?: MatchNodeData[]
}