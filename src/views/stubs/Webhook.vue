<template>
    <el-form-item label="URL" prop="url">
        <el-col :span="22">
            <el-input v-model="webhook!.parameters.url">
                <template #prepend>
                    <el-form-item prop="request.method" style="width: 70px">
                        <el-select v-model="webhook!.parameters.method">
                            <el-option v-for="item in $enum.WEBHOOK_METHOD" :value="item" :key="item"></el-option>
                        </el-select>
                    </el-form-item>
                </template>
            </el-input>
        </el-col>
        <el-col :span="2" style="padding-left: 10px;">
            <el-button :icon="Delete" type="danger" @click="deleteWebhook"></el-button>
        </el-col>
    </el-form-item>
    <plain-headers v-model="selectedItem!.metadata.render.postServeActions[props.index].parameters.headers" tips="（不支持多值 Header）"></plain-headers>
    <el-form-item label="Body">
        <el-radio-group v-model="selectedItem!.metadata.render.postServeActions[props.index].parameters.bodyType" @change="changeBodyType">
            <el-radio label="none">无</el-radio>
            <el-radio label="json">JSON</el-radio>
            <el-radio label="xml">XML</el-radio>
            <el-radio label="html">HTML</el-radio>
            <el-radio label="text">Text</el-radio>
            <!-- <el-radio label="base64">Base64</el-radio> -->
        </el-radio-group>
    </el-form-item>
    <el-form-item label="" v-if="selectedItem!.metadata.render.postServeActions[props.index].parameters.bodyType !== 'none'">
        <el-input type="textarea" :autosize="{ minRows: 8, maxRows: 30 }" v-model="webhook!.parameters.body"></el-input>
    </el-form-item>
    <el-form-item label="响应延时">
        <el-radio-group v-model="selectedItem!.metadata.render.postServeActions[props.index].parameters.delayType">
            <el-radio label="none">无</el-radio>
            <el-radio label="fixed">固定延时</el-radio>
            <el-radio label="lognormal">随机延时（中值）</el-radio>
            <el-radio label="uniform">随机延时（范围）</el-radio>
        </el-radio-group>
    </el-form-item>
    <el-form-item v-if="selectedItem!.metadata.render.postServeActions[props.index].parameters.delayType === 'fixed'">
        <el-input v-model="webhook!.parameters.delay.milliseconds" style="width: 200px">
            <template #suffix>ms</template>
        </el-input>
    </el-form-item>
    <el-form-item v-if="selectedItem!.metadata.render.postServeActions[props.index].parameters.delayType === 'lognormal'">
        <el-input v-model="webhook!.parameters.delay.median" style="width: 200px; padding-right: 10px;">
            <template #prefix><span style="padding-right: 5px;">中值</span></template>
            <template #suffix>ms</template>
        </el-input>
        <el-input v-model="webhook!.parameters.delay.sigma" style="width: 200px">
            <template #prefix><span style="padding-right: 5px;">标准差</span></template>
        </el-input>
    </el-form-item>
    <el-form-item v-if="selectedItem!.metadata.render.postServeActions[props.index].parameters.delayType === 'uniform'">
        <el-input v-model="webhook!.parameters.delay.lower" style="width: 200px; padding-right: 10px;">
            <template #prefix><span style="padding-right: 5px;">最小值</span></template>
            <template #suffix>ms</template>
        </el-input>
        <el-input v-model="webhook!.parameters.delay.upper" style="width: 200px">
            <template #prefix><span style="padding-right: 5px;">最大值</span></template>
            <template #suffix>ms</template>
        </el-input>
    </el-form-item>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { Delete } from '@element-plus/icons-vue'

import { useShareStatesStore } from '@/stores/UseShareStatesStore'
import $enum from '@/service/const/stubEnum'
import { changeHeaderByBodyType } from './components/headers'

import PlainHeaders from './components/PlainHeaders.vue'

const { selectedItem } = storeToRefs(useShareStatesStore())

// WebHook
const props = defineProps({
    webhook: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        required: true
    }
})
const deleteWebhook = () => {
    if (selectedItem && selectedItem.value && selectedItem.value.postServeActions) {
        selectedItem.value.postServeActions.splice(props.index, 1)
        selectedItem.value.metadata.render.postServeActions.splice(props.index, 1)
    }
}

// Body
const changeBodyType = (bodyType: string) => {
    changeHeaderByBodyType(selectedItem.value!.metadata.render.postServeActions[props.index].parameters.headers, bodyType)
}

</script>