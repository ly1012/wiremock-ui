<template>
    <div class="logs-list">
        <div v-if="isEmpty(currentMockUrl)" class="empty-data">请先选择一个项目</div>
        <div v-else>
            <div class="empty-data" v-if="!tableData.length">暂无数据</div>
            <div v-else>
                <!-- 顶部工具栏：搜索条件、刷新日志、删除所有日志 -->
                <el-row>
                    <el-col :span="24" class="top-tools">
                        <el-form :inline="true" class="form-inline" size="small" :model="search">
                            <el-form-item>
                                总数：<span class="total-num">{{ total }}</span>
                            </el-form-item>
                            <el-form-item label="查询条数">
                                <el-select v-model="search.limit" placeholder="请选择查询条数" class="tools-filter"
                                    @change="getListData(true)">
                                    <el-option label="20" value="20" key="20"></el-option>
                                    <el-option label="40" value="40" key="40"></el-option>
                                    <el-option label="60" value="60" key="60"></el-option>
                                    <el-option label="80" value="80" key="80"></el-option>
                                    <el-option label="100" value="100" key="100"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="查询日期">
                                <el-date-picker v-model="search.since" type="datetime" placeholder="选择日期时间"
                                    class="tools-filter" @change="getListData(true)">
                                </el-date-picker>
                            </el-form-item>
                            <el-form-item>
                                <el-button :icon="Refresh" type="warning" @click="getListData(true)">刷新</el-button>
                            </el-form-item>
                            <el-form-item>
                                <el-button :icon="Delete" type="danger" @click="deleteAllLogs">删除所有日志</el-button>
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
                <!-- 内容显示区 -->
                <el-row>
                    <!-- 左侧日志列表 -->
                    <el-col :span="5" class="left-list">
                        <!-- 列表 -->
                        <el-scrollbar class="list-content">
                            <ul>
                                <li v-for="(item, index) in tableData" v-bind:key="index"
                                    @click="handleClickItem(item, index)"
                                    :class="selectedIndex === index ? 'content-item select' : 'content-item'">
                                    <div>
                                        <label class="first">
                                            <span class="logged-date">{{ formatDateTime(item.request.loggedDate) }}</span>
                                            <el-tag size="small" type="success" v-if="item.wasMatched"
                                                class="matched">MATCHED</el-tag>
                                            <el-tag size="small" type="danger" class="matched" v-else>UNMATCHED</el-tag>
                                        </label>
                                        <label class="second">
                                            <el-tag size="small" :type="methodStyle(item.request.method)">
                                                {{ item.request.method }}
                                            </el-tag>
                                            <span class="item-url">{{ item.request.url }}</span>
                                        </label>
                                    </div>
                                </li>
                            </ul>
                        </el-scrollbar>
                    </el-col>

                    <!-- 日志详细信息 -->
                    <el-col :span="19" class="right-detail" v-if="JSON.stringify(selectedItemView) !== '{}'">
                        <el-scrollbar class="json-detail">
                            <el-row>
                                <el-row>
                                    <json-viewer :value="selectedItemView" :copyable="{ copyText: '复制', copiedText: '已复制' }"
                                        :expand-depth=5></json-viewer>
                                </el-row>
                            </el-row>
                        </el-scrollbar>
                    </el-col>
                </el-row>
            </div>
        </div>
    </div>
</template>
  
<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref, watch } from 'vue';
import { ElMessageBox, type Action, ElMessage } from 'element-plus';
import { Refresh, Delete } from '@element-plus/icons-vue';

import { useShareStatesStore } from '@/stores/UseShareStatesStore'
import { R_Mappings, D_Mapping } from '@/service/api/Requests'
import { methodStyle } from '@/service/render/style'
import { formatDateTime, isEmpty, cloneJson } from '@/lib/helper'
import { ErrorHandler } from '@/lib/axios';

const search = ref({
    limit: '20',
    since: ''
} as any)
const tableData = ref([] as any)
const selectedIndex = ref(-1)
const selectedItemView = ref({} as any)
const total = ref(0)
const { currentMockUrl } = storeToRefs(useShareStatesStore())

onBeforeMount(() => {
    getListData(false)
})

watch(currentMockUrl, (newValue, oldValue) => {
    if (currentMockUrl.value) {
        getListData(false)
    } else {
        tableData.value = []
    }
})

const deleteAllLogs = () => {
    ElMessageBox.alert('此操作将删除所有日志, 是否继续?', '提示', {
        showClose: false,
        showCancelButton: true,
        type: 'warning',
        callback: (action: Action) => {
            if (action === 'confirm') {
                D_Mapping(currentMockUrl.value).then(() => {
                    ElMessage({
                        type: 'success',
                        message: '删除成功',
                    })
                    getListData(false);
                }).catch((err) => {
                    ErrorHandler.create(err).end()
                });
            }
        }
    });
}

// ###### 顶部工具栏 ######

const getListData = async (isUserAction: boolean) => {
    const url = currentMockUrl.value
    if (url !== null && url !== undefined && url.trim() !== '') {
        for (let key in search.value) {
            search.value[key] === '' ? delete search.value[key] : ''
        }
        await R_Mappings(url, search.value).then((res: any) => {
            selectedIndex.value = -1;
            selectedItemView.value = {};
            tableData.value = res.requests;
            total.value = res.meta.total;
            if (isUserAction) {
                ElMessage({
                    type: 'success',
                    message: '刷新成功',
                })
            }
        }).catch((err) => {
            ErrorHandler.create(err).end()
        })
    }
}

// ###### 左侧列表 ######

const handleClickItem = (item: any, index: number) => {
    selectedIndex.value = index;
    selectedItemView.value = cloneJson(item);
}


// ###### 右侧详情页 ######






</script>

<style lang="less" scoped>
:deep(.el-scrollbar__bar) {
    height: 0 !important;
    width: 0 !important;
}

// 顶部工具栏
.top-tools {
    margin-bottom: 10px;
    padding: 8px 20px;
    // border-bottom: 1px solid #dfdfdf;
    text-align: left;

    .total-num {
        color: #0fb2ef;
        font-weight: bold;
    }

    .tools-filter {
        width: 200px;
        margin-right: 8px;
    }

    .form-inline {

        .el-form-item {
            margin-bottom: 0;
            margin-right: 15px;
        }
    }
}

// 左侧列表
.left-list {

    text-align: left;
    margin: 0px;
    padding: 0px;
    padding-left: 10px;

    // 列表内容
    .list-content {

        height: calc(100vh - 95px);
        width: 100%;
        margin: 0;
        border: 1px solid #dfdfdf;
        font-size: 0;
        float: left;

        ul {
            padding-left: 0px;
        }

        .content-item {
            list-style-type: none;
            padding: 0 20px;
            border-bottom: 1px solid #DFDFDF;
            cursor: pointer;

            label {
                display: block;
                font-size: 16px;
                word-break: break-all;
                word-wrap: break-word;
                cursor: pointer;

                .item-url {
                    padding: 0 8px;
                    color: gray;
                    font-size: 12px;
                }

                .matched {
                    float: right;
                }
            }

            label.first {
                padding: 10px 0;

                .logged-date {
                    font-size: 14px;
                }
            }

            label.second {
                padding-bottom: 10px;
            }
        }

        .content-item:hover {
            background: #D0D0D0;
        }
    }

    .select {
        background: #DFDFDF;
    }

}

// 右侧选中item详细信息
.right-detail {

    margin: 0px;
    padding-right: 10px;

    .json-detail {
        height: calc(100vh - 95px);
        margin-left: 2px;
        text-align: left;

        .jv-container {

            .jv-code {
                max-height: none !important;
                text-align: left;
            }


        }
    }
}

.empty-data {
    color: grey;
    display: flex;
    justify-content: center;
    margin-top: 40px;
    height: 89vh;
}
</style>