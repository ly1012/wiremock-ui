import {httpSingle} from '@/lib/axios';

/**
 * 查询指定【 mockUrl 】mapping 日志列表数据
 * @param mockUrl
 * @param params
 * @returns {*}
 */
export const R_Mappings = (mockUrl:string, params:any) => {
  return httpSingle({
    url: `${mockUrl}/__admin/requests`,
    method: 'get',
    params: params
  });
};

/**
 * 删除指定【 mockUrl 】中的 所有日志 信息
 * @param mockUrl
 * @returns {*}
 */
export const D_Mapping = (mockUrl:string) => {
  return httpSingle({
    url: `${mockUrl}/__admin/requests`,
    method: 'delete'
  });
};