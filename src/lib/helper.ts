import dayjs from 'dayjs'
import { customAlphabet } from 'nanoid';  

//唯一 ID 生成函数
export const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 12); 

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss 格式
 * @param value 标准格式日期时间字符串或时间戳
 * @returns YYYY-MM-DD HH:mm:ss 格式日期时间字符串
 */
export const formatDateTime = (value: string | number) => {
    return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 检查参数是否为空
 * 
 * 空值：undefined、null、trim 后为空
 * @param value 任意类型
 * @returns 如果为空返回 true，否则返回 false
 */
export const isEmpty = (value:any) => {
    return value === undefined || value === null || (typeof(value) === 'string' && value.trim() === '')
}

/**
 * 克隆一个 JSON 对象（对象或数组），防止指向同一内存地址
 * @param value 被克隆的 JSON 对象
 * @returns 克隆出的新 JSON 对象
 */
export const cloneJson = (value:any) => {
    return JSON.parse(JSON.stringify(value))
}

