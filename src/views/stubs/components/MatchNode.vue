<template>
    <template v-for="(item, index) in modelValue" :key="item.id">
        <!-- Predicate -->
        <el-form-item
            :class="(item.params !== undefined && item.params !== null && item.params.length) ? 'has-match-params' : ''">
            <slot></slot>
            <el-input v-model="item.key" class="match-item-value match-input"
                v-if="item.key !== undefined && item.key !== null"></el-input>
            <el-select v-model="item.predicate" class="match-item-value match-select"
                @change="(predicate: string) => onChangePredicate(item, predicate)">
                <el-option v-for="predicate in $enum.ALL_PREDICATE_COLLECTION" :key="predicate" :value="predicate"
                    :label="predicate"></el-option>
            </el-select>
            <template v-if="item.value !== undefined && item.value !== null">
                <template v-if="Object.prototype.toString.call(item.value) === '[object String]'">
                    <el-input v-model="item.value" class="match-item-value match-input"></el-input>
                </template>
                <template v-if="Object.prototype.toString.call(item.value) === '[object Boolean]'">
                    <el-input disabled v-model="item.extra.strValue" class="match-item-value match-input">
                        <template #suffix>
                            <el-switch v-model="item.value"
                                @change="(val: boolean) => item.extra.strValue = val.toString()"></el-switch>
                        </template>
                    </el-input>
                </template>
            </template>
            <el-button :icon="Plus" type="success" v-if="$enum.MULTI_SUBPREDICATE_COLLECTION.includes(item.predicate)"
                @click="addPredicate(item)"></el-button>
            <el-button :icon="Delete" type="danger"
                v-if="item.parentPredicate == null || $enum.MULTI_SUBPREDICATE_COLLECTION.includes(item.parentPredicate)"
                @click="deletePredicate(index)"></el-button>
        </el-form-item>
        <!-- Predicate Parameters -->
        <el-form-item size="small" v-if="item.params !== undefined && item.params !== null && item.params.length"
            :class="(item.parentPredicate === undefined || item.parentPredicate === null) ? 'match-params match-params-root' : 'match-params match-params-sub'">
            <el-form-item v-for="param in item.params" class="match-params-item">
                <template v-if="$enum.CHECKBOX_PARAM_COLLECTION.includes(param.key)">
                    <el-checkbox :label="param.key" v-model="param.enabled"></el-checkbox>
                </template>
                <template v-else-if="param.key === 'subPredicate'">
                    <el-checkbox :label="param.key" v-model="param.enabled"
                        @change="(newVal: boolean) => switchPredicateMode(item, newVal)"></el-checkbox>
                </template>
                <template v-else>
                    <el-checkbox label="" v-model="param.enabled" style="margin-right: 8px;"></el-checkbox>
                    <el-input v-if="$enum.INPUT_PARAM_COLLECTION.includes(param.key)" v-model="param.value"
                        class="match-input" :style="getParamsComponentWidth(param.key)">
                        <template #prefix><span style="padding-right: 5px;">{{ param.key }}</span></template>
                    </el-input>
                    <el-select v-if="$enum.SINGLE_SELECT_PARAM_COLLECTION.includes(param.key)" v-model="param.value"
                        placeholder="Please Select" :style="getParamsComponentWidth(param.key)">
                        <el-option v-for="option in $enum.PREDICATE_PARAM_OPTIONS_COLLECTION[param.key]" :key="option"
                            :label="option" :value="option" />
                        <template #prefix>{{ param.key }}</template>
                    </el-select>
                    <el-select v-model="param.value" v-if="$enum.MULTI_SELECT_PARAM_COLLECTION.includes(param.key)" multiple
                        collapse-tags collapse-tags-tooltip :max-collapse-tags="1" placeholder="Please Select"
                        :style="getParamsComponentWidth(param.key)">
                        <el-option v-for="option in $enum.PREDICATE_PARAM_OPTIONS_COLLECTION[param.key]" :key="option"
                            :label="option" :value="option" />
                    </el-select>
                    <el-button v-if="param.key === 'xPathNamespaces'" @click="isShowxPathNamespacesDialog[item.id] = true"
                        class="xPathNamespaces">{{ param.key }}</el-button>
                    <template v-if="isShowxPathNamespacesDialog[item.id]">
                        <el-dialog v-model="isShowxPathNamespacesDialog[item.id]" title="xPathNamespaces" center top="30vh"
                            @close="delete isShowxPathNamespacesDialog[item.id]">
                            <div class="addNamespaceButton">
                                <el-button type="primary" :icon="Plus" size="small"
                                    @click="addNamespaceItem(param.value as [])"></el-button>
                            </div>
                            <template v-for="(namespaceItem, index) in (param.value as any)">
                                <el-form-item style="flex:1;padding-bottom: 10px;">
                                    <el-col :span="6">
                                        <el-input v-model="(namespaceItem!.key)">
                                            <template #prefix>
                                                <span>Name</span>
                                            </template>
                                        </el-input>
                                    </el-col>
                                    <el-col :span="16">
                                        <el-input v-model="namespaceItem!.value">
                                            <template #prefix>
                                                <span>Namespace</span>
                                            </template>
                                        </el-input>
                                    </el-col>
                                    <el-col :span="2" style="text-align: right;">
                                        <el-button type="danger" :icon="Delete" size="small"
                                            @click="deleteNamespaceItem(param.value as [], index)"></el-button>
                                    </el-col>
                                </el-form-item>
                            </template>
                        </el-dialog>
                    </template>

                </template>
            </el-form-item>
        </el-form-item>
        <!-- Sub Predicate -->
        <template v-if="item.children && item.children.length">
            <div class="sub-node">
                <match-node v-model="item.children">
                    <el-icon>
                        <CaretRight />&nbsp;
                    </el-icon>
                </match-node>
            </div>
        </template>
    </template>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Plus, Delete, CaretRight } from '@element-plus/icons-vue'

import { nanoid, cloneJson } from '@/lib/helper'
import $enum from '@/service/const/stubEnum'
import { type MatchNodeData } from '@/service/render/convert/renderModel'

const props = defineProps<{
    modelValue: MatchNodeData[]
}>()

// 本组件的需求：
// 1. 接收父组件传过来的 MatchNodeData[] 数据，并且父组件修改该数据后，本组件同步（单向数据流，Props）
// 2. 本组件对数据的修改，需要同步到父组件

// 当前方案：直接使用 props 渲染，子组件中直接修改 props 对象字段的值。比较省事，o(╥﹏╥)o
// 现在的写法违反了 Vue 的单向数据流，子组件中直接修改了父组件传过来的数据（对象中的字段、数组元素的增减），但只有这一个子组件会修改数据，所以使用上并没有问题。

// const emit = defineEmits<{
//     (e: 'update:modelValue', newValue: MatchNodeData[]): void
// }>()

// Predicate
const onChangePredicate = (item: MatchNodeData, predicate: string) => {
    // Current Predicate
    if ($enum.NO_VALUE_PREDICATE_COLLECTION.includes(predicate)) {
        delete item.value
    } else {
        item.value = ''
        if (predicate === 'absent') {
            item.value = true
            item.extra = {
                strValue: "true"
            }
        }
    }
    const defaultValue = $enum.PREDICATE_PARAM_DEFAULT_VALUE[predicate]
    if (defaultValue) {
        item.params = cloneJson(defaultValue)
    } else {
        delete item.params
    }
    // Sub Predicate
    if (getSubPredicates(predicate).length === 0) {
        item.children = []
    } else {
        if (item.children === undefined || item.children === null) item.children = []
        item.children[0] = {
            id: nanoid(),
            predicate: "equalTo",
            parentPredicate: item.predicate,
            value: "",
            params: [{
                enabled: false,
                key: "caseInsensitive"
            }]
        }
        if (!$enum.SUBPREDICATE_NO_KEY_COLLECTION.includes(predicate)) {
            item.children[0].key = ""
        }
    }
}
const switchPredicateMode = (item: MatchNodeData, newVal: boolean) => {
    if (item.predicate === 'matchesJsonPath') {
        if (newVal) {           // 使用子匹配
            delete item.value
            if (item.children === undefined || item.children === null) item.children = []
            item.children[0] = {
                id: nanoid(),
                key: "",
                predicate: "equalTo",
                parentPredicate: item.predicate,
                value: "",
                params: [{
                    enabled: false,
                    key: "caseInsensitive"
                }]
            }
        } else {                // 不使用子匹配
            item.value = ''
            delete item.children
        }
        return
    }
    if (item.predicate === 'matchesXPath') {
        if (newVal) {           // 使用子匹配
            delete item.value
            if (item.children === undefined || item.children === null) item.children = []
            item.children[0] = {
                id: nanoid(),
                key: "",
                predicate: "equalTo",
                parentPredicate: item.predicate,
                value: "",
                params: [{
                    enabled: false,
                    key: "caseInsensitive"
                }]
            }
        } else {                // 不使用子匹配
            item.value = ''
            delete item.children
        }
        return
    }
}
const getSubPredicates = (predicate: string) => {
    if ($enum.NO_SUBPREDICATE_COLLECTION.includes(predicate)) return []
    return $enum.ALL_PREDICATE_COLLECTION
}
const addPredicate = (item: MatchNodeData) => {
    if ($enum.MULTI_SUBPREDICATE_COLLECTION.includes(item.predicate)) {
        if (item.children === undefined || item.children === null) item.children = []
        if ($enum.SUBPREDICATE_NO_KEY_COLLECTION.includes(item.predicate)) {
            item.children.push({
                id: nanoid(),
                predicate: "equalTo",
                parentPredicate: item.predicate,
                value: "",
                params: [{
                    enabled: false,
                    key: "caseInsensitive"
                }]
            })
        } else {
            item.children.push({
                id: nanoid(),
                key: "",
                predicate: "equalTo",
                parentPredicate: item.predicate,
                value: "",
                params: [{
                    enabled: false,
                    key: "caseInsensitive"
                }]
            })
        }
    }

}
const deletePredicate = (index: number) => {
    props.modelValue.splice(index, 1)
}

// Params

// Params - xPathNamespaces
const isShowxPathNamespacesDialog = ref({} as any)
const addNamespaceItem = (namespaceItems: {
    key: string,
    value: string
}[]) => {
    namespaceItems.push({
        key: '',
        value: ''
    })
}
const deleteNamespaceItem = (namespaceItems: {
    key: string,
    value: string
}[], index: number) => {
    namespaceItems.splice(index, 1)
}

// Params - Style: Component Width
const getParamsComponentWidth = (key: string) => {
    let width = 180
    switch (key) {
        case 'expectedOffset':
            width = 150;
            break;
        case 'expectedOffsetUnit':
            width = 176;
            break;
        case 'truncateActual':
            width = 230;
            break;
        case 'truncateExpected':
            width = 245;
            break;
        case 'actualFormat':
            width = 260;
            break;
        case 'placeholderClosingDelimiterRegex':
            width = 259;
            break;
        case 'placeholderOpeningDelimiterRegex':
            width = 260;
            break;
        case 'exemptedComparisons':
            width = 350;
            break;
        default:
            break;
    }
    return `width: ${width}px;`
}

</script>

<style lang="less" scoped>
:root .match-params {
    --el-component-size-small: 18px;

}

.match-params-item {
    padding-right: 20px;

    :deep(.el-input__wrapper) {
        box-shadow: none;
        padding: 1px 0px;
    }

    :deep(.el-input__wrapper:focus-within) {
        border-bottom: 1px solid #0fb2efa6;
        border-radius: unset;

    }

    .xPathNamespaces {
        border: unset;
        height: 18px;
        padding-left: 2px;
    }

    .addNamespaceButton {
        text-align: right;
        margin-bottom: 10px;
    }
}

.sub-node {
    padding-left: 20px
}

.has-match-params {
    margin-bottom: 2px;
}

.match-params-sub {
    padding-left: 15px;
}

.match-item-value {
    padding-right: 8px;
}

.match-input {
    width: 300px;
}

.match-select {
    width: 160px;
}
</style>