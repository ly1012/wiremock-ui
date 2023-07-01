const set = function (key:string, value:any):void {
  window.localStorage.setItem(key, value);
};
const get = function (key:string):any {
  return window.localStorage.getItem(key);
};
const remove = function (key:string):void {
  window.localStorage.removeItem(key);
};
const clear = function () {
  window.localStorage.clear();
};

export default {
  set,
  get,
  remove,
  clear
}