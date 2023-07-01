<template>
    <el-form-item label="启用" prop="fromConfiguredStub">
        <el-switch v-model="selectedItem!.response.fromConfiguredStub"></el-switch>
    </el-form-item>
    <el-form-item label="名称" prop="name">
        <el-input v-model="selectedItem!.name"></el-input>
    </el-form-item>
    <el-form-item label="优先级" prop="priority">
        <el-select v-model="selectedItem!.priority">
            <el-option v-for="item in $enum.PRIORITY" :value="item" :key="item"></el-option>
        </el-select>
    </el-form-item>
    <el-form-item label="场景">
        <el-input v-model="selectedItem!.scenarioName" class="input-3">
            <template #prefix>
                <span>场景名称</span>
            </template>
        </el-input>
        <el-input v-model="selectedItem!.requiredScenarioState" class="input-3">
            <template #prefix>
                <span>上一状态</span>
            </template>
        </el-input>
        <el-input v-model="selectedItem!.newScenarioState" class="input-3 last-input">
            <template #prefix>
                <span>下一状态</span>
            </template>
        </el-input>
    </el-form-item>
    <el-form-item label="备注">
        <el-input v-model="selectedItem!.metadata.wmui.description" type="textarea"></el-input>
    </el-form-item>
    <el-form-item label="创建时间" v-if="selectedItem!.metadata.wmui.createTime">
        <span>{{ selectedItem!.metadata.wmui.createTime }}</span>
    </el-form-item>
    <el-form-item label="更新时间" v-if="selectedItem!.metadata.wmui.updateTime">
        <span>{{ selectedItem!.metadata.wmui.updateTime }}</span>
    </el-form-item>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';

import { useShareStatesStore } from '@/stores/UseShareStatesStore'
import $enum from '@/service/const/stubEnum'

const { selectedItem } = storeToRefs(useShareStatesStore())
</script>

<style lang="less" scoped>
.input-3 {
    width: calc(100%/3);
    padding-right: 10px;

}
.last-input {
    padding-right: 0px;
}

</style>