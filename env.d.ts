/// <reference types="vite/client" />
declare module 'vue-json-viewer';
declare module "*.vue" {
    import { DefineComponent } from "vue"
    const component: DefineComponent<{}, {}, any>
    export default component
  }