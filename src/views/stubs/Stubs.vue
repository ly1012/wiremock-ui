<template>
    <div class="stubs-list">
        <div v-if="isEmpty(currentMockUrl)" class="empty-data">请先选择一个项目</div>
        <div v-else>
            <!-- <tool-bar></tool-bar> -->
            <!-- 顶部工具栏 -->
            <el-row class="top-tools" justify="start">
                <el-form :inline="true" class="form-inline" size="small">
                    <el-form-item>
                        总数：<span class="total-num">{{ total }}</span>
                    </el-form-item>
                    <el-form-item>
                        <el-select size="small" style="width: 100px;" placeholder="每页条数" v-model="pageSize"
                            @change="refreshListData">
                            <el-option label="10" :value="10" key="10"></el-option>
                            <el-option label="20" :value="20" key="20"></el-option>
                            <el-option label="50" :value="50" key="50"></el-option>
                            <el-option label="100" :value="100" key="100"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-input class="tools-filter" placeholder="根据 ID 查询" clearable v-model="stubMappingID"
                            @clear="refreshListData">
                            <template #append>
                                <el-button :icon="Search" @click="getStubMappingByID"></el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button :icon="Plus" type="primary" @click="addStubMapping">添加</el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button :icon="Refresh" type="warning" @click="refreshListData">刷新</el-button>
                    </el-form-item>
                    <!-- <el-form-item>
                        <el-button :icon="Right" type="danger" @click="dialogRecordFormVisible = true">录制</el-button>
                    </el-form-item> -->
                    <!-- <el-form-item>
                        <el-button :icon="Search" type="success" @click="getStubMappingsByMetadata()">高级搜索</el-button>
                    </el-form-item> -->
                </el-form>
            </el-row>

            <!-- 内容显示区 -->
            <!-- 无内容时显示 -->
            <div class="empty-data" v-if="!tableData.length">暂无数据，请先添加</div>
            <!-- 有内容时显示 -->
            <div v-else>
                <el-row>
                    <!-- 左侧 Stub Mappings 列表 -->
                    <el-col :span="5" class="left-list">
                        <!-- 分页信息及翻页功能 -->
                        <el-row class="list-pagination" align="middle" justify="space-between">
                            <div class="filter-options">
                                <el-input placeholder="当前数据中检索" clearable v-model="listFilter" size="small" />
                            </div>
                            <div class="pagination">
                                <div class="pagination-tip">
                                    <label>{{ `第 ${fromNum} - ${toNum} 条` }}</label>
                                </div>
                                <el-pagination :page-size="pageSize" :total="total" :current-page="pageNum"
                                    @update:current-page="onCurrentPageNumChage" :small="true"
                                    layout="prev,next"></el-pagination>

                            </div>
                        </el-row>
                        <!-- 列表 -->
                        <el-scrollbar class="list-content">
                            <ul>
                                <li v-for="(item, index) in tableData" v-bind:key="item.id"
                                    @click="onClickListItem(item, index)">
                                    <div :class="selectedIndex === index ? 'content-item select' : 'content-item'"
                                        v-if="localSearch(item)">
                                        <label class="first-line">
                                            <span>{{ item.name }}</span>
                                            <div class="status-flag">
                                                <span v-if="!item.response.fromConfiguredStub" class="disable-flag">×</span>
                                                <span v-if="isUnsave(item)" class="unsave-flag">*</span>
                                            </div>
                                        </label>
                                        <label class="second-line">
                                            <el-tag size="small" :type="methodStyle(item.request.method)">{{
                                                item.request.method }}</el-tag>
                                            <span class="item-url">{{ item.metadata.render.request.url }}</span>
                                        </label>
                                        <label class="third-line">
                                            <status-tag :status="item.response.status" />
                                        </label>
                                    </div>
                                </li>
                            </ul>
                        </el-scrollbar>
                    </el-col>
                    <!-- 右侧 Stub Mapping 详情 -->
                    <el-col :span="19" class="right-detail" v-if="selectedItem">
                        <!-- 操作栏 -->
                        <div class="detail-tools">
                            <!-- 操作按钮 -->
                            <div class="switch-edit-view">
                                <span :class="isShowFormEdit ? 'switch-button is-active' : 'switch-button'"
                                    @click="isShowFormEdit = true">编辑</span>
                                <span :class="!isShowFormEdit ? 'switch-button is-active' : 'switch-button'"
                                    @click="isShowFormEdit = false">预览</span>
                            </div>
                            <el-form size="small" v-show="isShowFormEdit">
                                <el-button :icon="Finished" type="primary" @click="saveStubMapping"
                                    v-if="isUnsave(selectedItem)">保存</el-button>
                                <template v-if="JSON.stringify(selectedItem) !== JSON.stringify(resetItem)">
                                    <el-popconfirm title="确定重置吗？" @confirm="resetStubMapping" width="150">
                                        <template #reference>
                                            <el-button :icon="RefreshLeft" type="warning">重置</el-button>
                                        </template>
                                    </el-popconfirm>
                                </template>
                                <el-popconfirm title="确定删除吗？" @confirm="deleteStubMappingByID" width="150">
                                    <template #reference>
                                        <el-button :icon="Delete" type="danger">删除</el-button>
                                    </template>
                                </el-popconfirm>
                                <el-button :icon="CopyDocument" type="success" @click="cloneStubMapping"
                                    v-if="!isUnsave(selectedItem)">副本</el-button>
                            </el-form>
                        </div>
                        <!-- Form Edit/JSON View 切换 -->
                        <el-scrollbar class="detail-tab">
                            <!-- Form Edit -->
                            <el-form class="detail-info" :model="selectedItem" ref="selectedItemRef" label-width="120px"
                                label-position="left" v-show="isShowFormEdit" size="default">
                                <el-collapse v-model="activeCollapseNames">
                                    <!-- 基本信息：名称、优先级、场景、启用禁用、元数据 -->
                                    <el-collapse-item name="General">
                                        <template #title>
                                            <b>基本信息</b>
                                        </template>
                                        <general-info></general-info>
                                    </el-collapse-item>
                                    <!-- Request -->
                                    <el-collapse-item name="Request">
                                        <template #title>
                                            <b>Request</b>
                                        </template>
                                        <request></request>
                                    </el-collapse-item>
                                    <!-- Response -->
                                    <el-collapse-item name="Response">
                                        <template #title>
                                            <b>Response</b>
                                        </template>
                                        <response></response>
                                    </el-collapse-item>
                                    <!-- postServeActions -->
                                    <el-collapse-item :name="'Webhook' + (index + 1)"
                                        v-for="(webhook, index) in selectedItem.postServeActions">
                                        <template #title>
                                            <b>{{ 'Webhooks(' + (index + 1) + ')' }}</b>
                                        </template>
                                        <webhook :webhook="webhook" :index="index"></webhook>
                                    </el-collapse-item>
                                    <webhook-add-button>Add a webhook</webhook-add-button>
                                </el-collapse>
                            </el-form>
                            <!-- JSON View -->
                            <div class="detail-preview" v-show="!isShowFormEdit">
                                <json-viewer :value="selectedItemView" :copyable="{ copyText: '复制', copiedText: '已复制' }"
                                    :expand-depth=10></json-viewer>
                            </div>
                        </el-scrollbar>

                    </el-col>
                </el-row>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref, reactive, watch, defineAsyncComponent, h } from 'vue';
import { computed } from '@vue/reactivity';
import { Search, Plus, Refresh, RefreshLeft, Right, Finished, Delete, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type Action, type FormRules } from 'element-plus';

import { isEmpty, formatDateTime, cloneJson } from '@/lib/helper'
import { ErrorHandler } from '@/lib/axios'
import { useShareStatesStore } from '@/stores/UseShareStatesStore'
import { type IStubMapping, R_Mappings, R_Mapping, C_Mapping, U_Mapping, D_Mapping } from '@/service/api/StubMappings'
import { methodStyle } from '@/service/render/style'
import { apiDataToRenderData } from '@/service/render/convert/apiDataToRenderData'
import { renderDataToApiData } from '@/service/render/convert/renderDataToApiData'

import StatusTag from '../components/StatusTag.vue'
import GeneralInfo from './GeneralInfo.vue'
import Request from './Request.vue'
import Response from './Response.vue'
const Webhook = defineAsyncComponent(() =>
    import('./Webhook.vue')
)
const WebhookAddButton = defineAsyncComponent(() =>
    import('./WebhookAddButton.vue')
)

const { currentMockUrl, selectedItem, selectedIndex, currentStubMappingID, resetItem } = storeToRefs(useShareStatesStore())
const tableData = ref([] as any[])
const pageNum = ref(1)
const pageSize = ref(10)
const fromNum = computed(() => (pageNum.value - 1) * pageSize.value + (total ? 1 : 0))
const toNum = computed(() => (pageNum.value * pageSize.value) > total.value ? total.value : (pageNum.value * pageSize.value))

/**
 * 根据 offset 和 limit 查询
 */
const getStubMappings = async (isUserAction: boolean) => {
    await R_Mappings(currentMockUrl.value, { offset: (pageNum.value - 1) * pageSize.value, limit: pageSize.value }).then((res: any) => {
        tableData.value = (res.mappings || []).map((item: any) => {
            return apiDataToRenderData(item);
        });
        total.value = res.meta.total
        selectedItem.value = total.value > 0 ? tableData.value[0] : {}
        selectedIndex.value = 0
        isShowFormEdit.value = true
        resetItem.value = cloneJson(selectedItem.value)
        if (isUserAction) {
            ElMessage({
                type: 'success',
                message: '刷新成功',
            })
        }
    }).catch(err => {
        ErrorHandler.create(err).end()
    })
}

// ###### 页面加载和监听 ######

onBeforeMount(() => {
    if (!isEmpty(currentMockUrl.value)) {
        getStubMappings(false)
    }
})

watch(currentMockUrl, (newValue, oldValue) => {
    if (currentMockUrl.value) {
        getStubMappings(false)
    } else {
        tableData.value = []
    }
})

// ###### 1. 顶部工具栏 ######
const dialogRecordFormVisible = ref(false)
const stubMappingID = ref('')
const total = ref(0)

/**
 * 当每页条数改变或点击刷新按钮时重新查询
 */
const refreshListData = () => {
    pageNum.value = 1
    saveItemBeforeNextAction().then(async (action: Action) => {
        if (action === 'confirm' || action === 'cancel') {
            if (stubMappingID.value) {
                getStubMappingByID()
            } else {
                await getStubMappings(true)
                if (tableData.value.length) switchSelectedItem(0)
            }
        }
    })
}

/**
 * 根据 StubMapping ID 查询
 */
const getStubMappingByID = async () => {
    if (isEmpty(stubMappingID.value)) {
        ElMessage({ type: 'warning', message: '请输入 Stub Mapping 的 ID' })
        return
    }
    if (!stubMappingID.value.match(/[0-9a-z]{8}(-[0-9a-z]{4}){3}-[0-9a-z]{12}/)) {
        ElMessage({ type: 'warning', message: 'UUID 格式错误' })
        return
    }
    await R_Mapping(currentMockUrl.value, stubMappingID.value).then((res: any) => {
        tableData.value = [apiDataToRenderData(res)];
        total.value = 1
        currentStubMappingID.value = stubMappingID.value
        switchSelectedItem(0)
        ElMessage({
            type: 'success',
            message: '刷新成功',
        })
    }).catch((err: any) => {
        ErrorHandler.create(err).handle((err) => {
            if (err.response && err.response.status === 404) {
                ElMessage({ type: 'warning', message: '不存在该 UUID ' })
                return true
            }
            return false
        }).end()
    })
}

/**
 * 添加一个默认 Stub Mapping 到列表（未保存）
 */
const addStubMapping = () => {
    if (tableData.value.length && !tableData.value[0].id) return;
    const item = apiDataToRenderData({
        name: '请输入 Stub Mapping 名称',
        priority: 5,
        persistent: true,
        request: {
            method: 'GET',
            url: '/example'
        },
        response: {}
    });
    tableData.value.unshift(item);
    switchSelectedItem(0)
}

/**
 * 根据 Metadata 查询
 */
const getStubMappingsByMetadata = () => {
    // TODO
    getStubMappings(true)
}

// ###### 2. 左侧列表 ######

/**
 * 判断当前选中项是否有修改未保存
 * @param item 当前选中项
 */
const isUnsave = computed(() => (item: IStubMapping) => {
    return !item.id || (selectedItem.value === item && JSON.stringify(selectedItem.value) !== JSON.stringify(resetItem.value))
})

/**
 * 本地搜索，筛选列表中符合查询条件的列表项。
 * 
 * 如果参数符合查询条件，则返回 true。
 * 
 * @param item 当前列表项数据
 */
const listFilter = ref('')
const localSearch = (item: any) => {
    // TODO 语法搜索，如 title:客服介入 && urL:/abc/dwew
    return (!listFilter.value || ((item.name || '').indexOf(listFilter.value) !== -1 || (item.url || '').indexOf(listFilter.value) !== -1))
}

/**
 * 上一页、下一页
 * 
 * 当当前页码改变时重新查询
 * @param currentPageNum 当前页码
 */
const onCurrentPageNumChage = (currentPageNum: number) => {
    pageNum.value = currentPageNum
    getStubMappings(true)
}

/**
 * 点击列表项
 * @param item 被选中的列表项
 * @param index 被选中的列表项索引
 */
const onClickListItem = (item: IStubMapping, index: number) => {
    // 如果要选中的与已选中的是同一个，则立即返回，不做处理
    if (selectedItem && selectedItem.value === tableData.value[index]) return

    // 如果有未保存的项，则提示是否先保存
    let removeFirst = false
    if (!tableData.value[0].id) removeFirst = true
    saveItemBeforeNextAction().then((action: Action) => {
        if (action === 'confirm' || action === 'cancel') {
            switchSelectedItem(removeFirst && action === 'cancel' ? --index : index)
        }
    })
}

// ###### 3. 右侧详情页 ######
const isShowFormEdit = ref(true)

// 3.1 表单编辑
const activeCollapseNames = ref(['General', 'Request', 'Response', 'Webhook1', 'Webhook2', 'Webhook3', 'Webhook4', 'Webhook5'])

/**
 * 保存按钮：创建或更新 StubMapping
 */
const saveStubMapping = () => {
    if (selectedItem.value!.metadata.wmui.createTime) {
        selectedItem.value!.metadata.wmui.updateTime = formatDateTime(new Date().getTime())
    } else {
        selectedItem.value!.metadata.wmui.createTime = formatDateTime(new Date().getTime())
    }
    // 如果是添加未保存的数据
    if (!selectedItem.value!.id) {
        C_Mapping(currentMockUrl.value, renderDataToApiData(selectedItem.value as IStubMapping)).then((res: any) => {
            // 新增数据后当前页列表条数加一，需要刷新，重新计算 total 和 pageNum
            getStubMappings(false)
        }).catch((err) => {
            ErrorHandler.create(err).end()
        })
        return
    }
    // 如果是修改未保存的数据
    if (JSON.stringify(selectedItem.value) !== JSON.stringify(resetItem.value)) {
        U_Mapping(currentMockUrl.value, selectedItem.value!.id as string, renderDataToApiData(selectedItem.value as IStubMapping)).then((res: any) => {
            tableData.value[selectedIndex.value] = apiDataToRenderData(res)
            switchSelectedItem(selectedIndex.value)
        }).catch((err) => {
            ErrorHandler.create(err).end()
        })
        return
    }
}

/**
 * 重置当前选中项，数据回滚到编辑前的数据
 */
const resetStubMapping = () => {
    if (JSON.stringify(selectedItem.value) === JSON.stringify(resetItem.value)) {
        ElMessage({ type: 'success', message: '数据未变更，无需重置' })
        return
    }
    tableData.value[selectedIndex.value] = cloneJson(resetItem.value)
    switchSelectedItem(selectedIndex.value)
}

/**
 * 删除当前选中的 StubMapping。
 * 
 * 如果是草稿项，直接移除；否则根据 ID 删除。
 */
const deleteStubMappingByID = () => {
    if (!selectedItem.value!.id) {
        tableData.value.shift()
        switchSelectedItem(0)
    } else {
        D_Mapping(currentMockUrl.value, selectedItem.value!.id as string).then(() => {
            ElMessage({
                type: 'success',
                message: '删除成功',
            })
            // 总数发生改变需要刷新
            getStubMappings(false)
        }).catch((err) => {
            ErrorHandler.create(err).end()
        })
    }
}

/**
 * 克隆当前选中项，并添加到列表顶部
 */
const cloneStubMapping = () => {
    const cloneItem = cloneJson(selectedItem.value)
    delete cloneItem.id
    delete cloneItem.uuid
    tableData.value.unshift(cloneItem);
    switchSelectedItem(0)
}

// 3.2 JSON 预览
const selectedItemView = computed(() => {
    const clonedItem = JSON.parse(JSON.stringify(selectedItem.value))
    return renderDataToApiData(clonedItem)
})

// ###### 辅助方法 ######

const saveItemBeforeNextAction = async (): Promise<Action> => {
    if (!tableData.value.length || (tableData.value[0].id && JSON.stringify(selectedItem.value) === JSON.stringify(resetItem.value))) {
        return 'confirm' as Action
    }
    let userAction!: Action
    await ElMessageBox.confirm(
        '您有 Stub Mapping 未保存，是否先保存？',
        '提示',
        {
            confirmButtonText: '保存',
            cancelButtonText: '放弃',
            type: 'warning',
            distinguishCancelAndClose: true
        }
    ).then(async () => {      //保存修改
        userAction = 'confirm' as Action
        // 如果是添加未保存的数据
        if (!tableData.value[0].id) {
            await C_Mapping(currentMockUrl.value, renderDataToApiData(tableData.value[0])).then((res: any) => {
                tableData.value[0] = apiDataToRenderData(res)
            }).catch((err) => {
                ErrorHandler.create(err).end()
            })
            return
        }
        // 如果是修改未保存的数据
        if (JSON.stringify(selectedItem.value) !== JSON.stringify(resetItem.value)) {
            await U_Mapping(currentMockUrl.value, selectedItem.value!.id as string, renderDataToApiData(selectedItem.value as IStubMapping)).then((res: any) => {
                tableData.value[selectedIndex.value] = apiDataToRenderData(res)
            }).catch((err) => {
                ErrorHandler.create(err).end()
            })
            return
        }
    }).catch((action: Action) => {    //放弃修改或关闭弹窗
        userAction = action
        if (action === 'cancel') {
            if (!tableData.value[0].id) {
                tableData.value.shift()
            } else {
                tableData.value[selectedIndex.value] = cloneJson(resetItem.value)
            }
        }
    })
    return Promise.resolve(userAction)

}

// 切换选中项
const switchSelectedItem = (nextIndex: number) => {
    selectedItem.value = tableData.value[nextIndex]
    selectedIndex.value = nextIndex
    resetItem.value = cloneJson(selectedItem.value);
    // activeCollapseNames.value = ['General', 'Request', 'Response']
    // isShowFormEdit.value = true
}

// const rules = reactive<FormRules>({
//     name: [
//         { required: true, message: '请输入名称', trigger: 'blur' }
//     ],
//     matchType: [
//         { required: true, message: '请选择URL匹配类型', trigger: 'change' }
//     ],
//     priority: [
//         { required: true, message: '请选择匹配优先级', trigger: 'change' }
//     ],
//     url: [
//         { required: true, message: '请输入请求URL路径', trigger: 'blur' }
//     ],
//     request: {
//         method: [
//             { required: true, message: '请选择请求方式', trigger: 'change' }
//         ],
//     },
//     response: {
//         status: [
//             { required: true, message: '请输入响应状态码', trigger: 'blur' }
//         ],
//         proxyBaseUrl: [
//             { required: true, message: '请输入proxyBaseUrl', trigger: 'blur' }
//         ],
//     },
//     fixedDelayMilliseconds: [
//         { required: true, message: '请输入Delay（ms）', trigger: 'change' }
//     ],
//     delayDistribution: {
//         lower: [
//             { required: true, message: '请输入Lower bound（ms）', trigger: 'change' }
//         ],
//         upper: [
//             { required: true, message: '请输入Upper bound（ms）', trigger: 'change' }
//         ],
//         median: [
//             { required: true, message: '请输入Median delay（ms）', trigger: 'change' }
//         ],
//         sigma: [
//             { required: true, message: '请输入Standard deviation', trigger: 'change' }
//         ],
//     },
//     hooks: {
//         url: [
//             { required: true, message: '请输入url', trigger: 'blur' }
//         ],
//         headers: [
//             { required: true, message: '请输入headers', trigger: 'blur' },
//             {
//                 required: true, trigger: ['change', 'blur'], validator: (rule, value, callback) => {

//                     try {
//                         if (value && !Object.keys(JSON.parse(value)).length) {
//                             callback(new Error('headers格式有误'));
//                         } else {
//                             this.errorTip = '';
//                             callback()
//                         }
//                     } catch (e) {
//                         callback(new Error('headers格式有误'))
//                     }

//                 }
//             },
//         ],
//         method: [
//             { required: true, message: '请选择method', trigger: 'change' }
//         ],
//         jsonBody: [
//             {
//                 required: false, trigger: ['change', 'blur'], validator: (rule, value, callback) => {

//                     try {
//                         if (value && !Object.keys(JSON.parse(value)).length) {
//                             callback(new Error('jsonBody 格式有误'));
//                         } else {
//                             this.errorTip = '';
//                             callback()
//                         }
//                     } catch (e) {
//                         callback(new Error('jsonBody 格式有误'))
//                     }

//                 }
//             },
//         ]
//     }
// })

</script>

<style lang="less" scoped>
:deep(.el-scrollbar__bar) {
    height: 0 !important;
    width: 0 !important;
}

//改变默认输入框样式
.filter-options {
    :deep(:focus-visible) {
        outline: -webkit-focus-ring-color auto 0px;
    }

    :deep(.el-input__wrapper) {
        // background-color: #2c3e50;
        box-shadow: none;
    }

    :deep(.el-select:hover:not(.el-select--disabled) .el-input__wrapper) {
        box-shadow: none;
    }

    :deep(.el-input__inner) {
        color: black;
    }
}

// 顶部工具栏
.top-tools {
    padding: 8px 20px;
    text-align: left;

    .total-num {
        color: #0fb2ef;
        font-weight: bold;
    }

    .tools-filter {
        width: 300px;
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

    // 分页
    .list-pagination {
        display: flex;
        // margin-bottom: 8px;
        // height: 20px;

        .pagination {
            display: flex;
            justify-content: end;
        }

        .pagination-tip {
            // float: left;
            font-size: 12px;
            line-height: 24px;
            color: gray;
            padding-left: 2px;
        }

    }

    // 列表内容
    .list-content {
        height: calc(100vh - 110px);
        width: 100%;
        padding: 0;
        margin: 0;
        border: 1px solid #dfdfdf;
        font-size: 0;
        float: left;

        ul {
            padding-left: 0px;
        }

        .status-flag {
            padding-left: 10px;
            text-align: center;

            .disable-flag {
                color: gray;
                padding-left: 3px;
            }

            .unsave-flag {
                padding-left: 3px;
                color: rgb(235, 101, 101);
                height: 20px;
                display: inline-block;
                vertical-align: middle;
                text-align: center;
                line-height: 26px;
                font-size: 20px;
            }
        }


        .content-item {
            list-style-type: none;
            padding: 0 20px;
            border-bottom: 1px solid #dfdfdf;

            cursor: pointer;

            label {
                display: block;
                font-size: 14px;
                word-break: break-all;
                word-wrap: break-word;
                cursor: pointer;
            }

            .first-line {
                font-weight: bold;
                color: #2c3e50d9;
                padding-top: 8px;
                display: flex;
                justify-content: space-between;
            }

            .second-line {

                padding: 10px 0;

                .item-url {
                    padding: 0 10px;
                    color: #2c3e50d9;
                }

            }

            .third-line {
                padding-bottom: 8px;
            }
        }

        .content-item:hover {
            background: #d0d0d040;
        }
    }

    .select {
        border-left: 2px solid #0fb2ef;
        // margin-left: 1px;
    }
}

// 右侧选中item详细信息
.right-detail {

    padding: 0 20px;

    // 功能栏
    .detail-tools {
        display: flex;
        justify-content: space-between;
        height: 30px;

        .switch-edit-view {

            margin-left: 20px;
            display: flex;
            align-items: flex-end;

            .switch-button {
                cursor: pointer;
                display: inline;
                vertical-align: bottom;
                margin-right: 5px;
                height: 24px;
                color: #0fb2ef;
                font-size: 14px;
            }

            .switch-button.is-active {
                height: 22px;
                color: #f59121;
                border-bottom: 2px solid #f59121;
            }
        }
    }

    .el-scrollbar {
        height: calc(100vh - 117px);
        width: 100%;
    }

    // 切换tab
    .detail-tab {

        .detail-info {
            padding-left: 20px;
        }

    }

    .jv-code {
        max-height: none !important;
    }

    .json-detail {
        overflow: scroll;
        height: 72vh;
        padding: 15px;
        margin: 0;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        border: 1px solid #dcdfe6;
        -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .12), 0 0 6px 0 rgba(0, 0, 0, .04);
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .12), 0 0 6px 0 rgba(0, 0, 0, .04);

        .jv-more {
            display: none;
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