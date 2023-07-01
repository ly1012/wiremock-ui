<template>
    <el-header class="navbar">
        <div class="left-navbar">
            <div @click="isShowProjects = true">
                <el-image class="logo" :src="logoSrc" />
            </div>
            <el-select v-model="currentProjectId" clearable value-key="id" popper-class="select-project"
                :placeholder="projects.length === 0 ? '点击左侧图标添加项目' : '请选择一个项目'" @change="changeProject" @clear="clearSelected">
                <el-option v-for="item in projects" :label="item.name" :value="item.id">
                    <span>{{ item.name }}</span>
                </el-option>
            </el-select>
            <el-menu :default-active="$route.path ? $route.path : '/stubs'" :router="true" mode="horizontal" :ellipsis="false"
                background-color="#2c3e50" text-color="#0fb2ef" active-text-color="#f59121">
                <el-menu-item index="/stubs" :route="{ name: 'stubs' }">
                    <span slot="title"><b>Stubs</b></span>
                </el-menu-item>
                <el-menu-item index="/logs" :route="{ name: 'logs' }">
                    <span slot="title"><b>Logs</b></span>
                </el-menu-item>
            </el-menu>
        </div>
        <div class="right-navbar">
            <div class="icon-github" @click="goToGitHub">
                <svg t="1688223212444" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                    p-id="2265" width="20" height="20">
                    <path
                        d="M855.557 216.855c35.621-66.153-5.089-152.661-5.089-152.661-91.597 0-157.75 61.064-157.75 61.064-35.621-20.355-152.661-20.355-152.661-20.355s-117.04 0-152.661 20.355c0 0-66.153-61.064-157.75-61.064 0 0-40.71 86.508-5.089 152.661 0 0-81.419 76.331-50.887 239.169 28.691 153.018 162.838 193.371 249.346 193.371 0 0-35.621 30.532-30.532 81.419 0 0-50.887 30.532-101.774 10.177s-76.331-71.242-76.331-71.242-50.887-66.153-101.774-40.71c0 0-15.266 15.266 40.71 40.71 0 0 40.71 61.064 55.976 96.685 15.266 35.621 96.685 66.153 178.105 45.798v117.04s0 10.177-20.355 15.266-20.355 15.266-10.177 15.266H723.25c10.177 0 10.177-10.177-10.177-15.266-20.355-5.089-20.355-15.266-20.355-15.266v-117.04s0.447-61.03 0-81.419c-1.119-51.128-35.621-81.419-35.621-81.419 86.508 0 220.655-40.353 249.346-193.371 30.533-162.837-50.886-239.168-50.886-239.168z"
                        p-id="2266" fill="#e6e6e6"></path>
                </svg>
            </div>
        </div>
    </el-header>
    <Projects />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import logoSrc from '@/assets/wireMockLogo.png'
import axios from 'axios'
import Projects from './projects/Projects.vue';
import { useProjectsStore } from '@/stores/UseProjectsStore';
import { storeToRefs } from 'pinia';
import { useShareStatesStore } from '@/stores/UseShareStatesStore';

const store = useProjectsStore()
const { projects } = storeToRefs(store);

const shareStateStore = useShareStatesStore()
const { isShowProjects, currentProjectId, currentMockUrl } = storeToRefs(shareStateStore)

const changeProject = (id: string) => {
    currentProjectId.value = id
    const currentItem = projects.value.find((item) => item.id === id)
    currentMockUrl.value = currentItem ? currentItem.url : ''
}

const clearSelected = () => {
    currentProjectId.value = ''
    currentMockUrl.value = ''
}

const goToGitHub = () => {
    window.open('https://liyunx.com', '_blank')
}

</script>

<style lang="less" scoped>
.el-header {

    --el-header-height: 40px;
    width: 100%;
    padding-left: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    background-color: #2c3e50;

    .left-navbar {
        display: flex;
        align-items: center;

        .logo {
            height: 15px;
        }
    
        .el-select {
            margin-left: 20px;
            margin-right: 10px;
            width: 230px;
        }
    
        .el-menu.el-menu--horizontal {
            border-bottom: none;
    
            .el-menu-item {
                height: 40px;
            }
        }
    }

    .right-navbar {
        .icon-github {
            margin-top: 5px;
            cursor: pointer;
        }
    }


}

//改变默认选择框样式
.navbar {
    :deep(:focus-visible) {
        outline: -webkit-focus-ring-color auto 0px;
    }

    :deep(.el-input__wrapper) {
        background-color: #2c3e50;
        box-shadow: none;
    }

    :deep(.el-select:hover:not(.el-select--disabled) .el-input__wrapper) {
        box-shadow: none;
    }

    :deep(.el-input__inner) {
        color: aliceblue;
    }

}
</style>