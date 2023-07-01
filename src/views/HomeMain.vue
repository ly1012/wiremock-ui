<template>
    <el-main>
        <RouterView></RouterView>
    </el-main>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style lang="less">
.el-main {
    padding: 0px;
}
</style>