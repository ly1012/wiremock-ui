
export const changeHeaderByBodyType = (headers: {key: string, value: string}[], bodyType: string) => {
    if (bodyType === 'none') return
    const map = new Map([
        ['json', 'application/json'],
        ['xml', 'application/xml'],
        ['html', 'text/html'],
        ['text', 'text/plain']
    ])
    const MIME = map.get(bodyType)
    if(!MIME) return
    // 如果已存在 Content-Type 则修改
    for (let header of headers) {
        if (header.key.toLowerCase() === 'content-type') {
            const values = header.value.split(";")
            if (header.value.trim() === '' || values.length === 1) {
                header.value = MIME
                return
            }
            values[0] = MIME
            header.value = values.join(";")
            return
        }
    }
    // 如果不存在则添加
    headers.unshift({
        key: 'Content-Type',
        value: MIME
    })
}