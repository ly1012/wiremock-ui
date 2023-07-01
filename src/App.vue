<template>
  <el-container>
    <MockHeader />
  </el-container>
  <el-container>
    <MockMain />
  </el-container>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useProjectsStore } from './stores/UseProjectsStore';
import MockHeader from './views/HomeHeader.vue';
import MockMain from './views/HomeMain.vue';


// 监听 projects 状态变化，持久化到 LocalStorage
const store = useProjectsStore()
onBeforeMount(() => {
  store.$patch({
    projects: store.getProjectsValue()
  })
  store.$subscribe((mutation, state) => {
    store.persistProjectsValue(state.projects)
  }, { detached: true })
})


</script>

<style lang="less">
body {
  margin: 0;
  overflow: hidden;   //解决切换路由时页面抖动：竖向滚动条闪烁
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
}
</style>
