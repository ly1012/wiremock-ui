
/**
 * 根据 Method 类型返回相应的样式设置
 * @param value Method 字符串，如 GET、POST
 * @returns Method 样式，如 success（绿色）
 */
export const methodStyle = function (value: string) {
    const map = new Map([
        ["GET", "success"],
        ['POST', 'warning'],
        ['PUT', ''],
        ['DELETE', 'danger'],
        // ['XXXX', 'info']
    ])
    return map.get(value.trim());
}