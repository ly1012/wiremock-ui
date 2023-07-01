import {httpSingle} from '../../lib/axios';


/**
 * 查询指定【 mockUrl 】中，Recording 状态
 * @param mockUrl
 * @returns {*}
 */
export const R_Recording = (mockUrl:string) => {
    return httpSingle({
      url: `${mockUrl}/__admin/recordings/status`,
      method: 'get'
    });
  };
  
  
  /**
   * 修改指定【 mockUrl 】中，Recording 状态为 action
   * @param mockUrl
   * @param action
   * @param params
   * @returns {*}
   */
  export const U_Recording = (mockUrl:string, action:string, params:any) => {
    return httpSingle({
      url: `${mockUrl}/__admin/recordings/${action}`,
      method: 'post',
      data: params
    });
  };