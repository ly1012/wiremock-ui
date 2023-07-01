<template>
    <el-form-item :label="label">
        <el-button :icon="Plus" size="small" @click="addHeader"></el-button>
        <span style="padding-left: 10px; font-size: 12px;">{{ tips }}</span>
    </el-form-item>
    <template v-if="headers">
        <el-form-item label="" v-for="(header, index) in headers">
            <el-row :gutter="10" style="flex: 1;">
                <el-col :span="8">
                    <el-input v-model="header.key">
                        <template #prefix><span style="padding-right: 5px;">Name</span></template>
                    </el-input>
                </el-col>
                <el-col :span="8">
                    <el-input v-model="header.value">
                        <template #prefix><span style="padding-right: 5px;">Value</span></template>
                    </el-input>
                </el-col>
                <el-col :span="1">
                    <el-button :icon="Delete" type="danger" @click="deleteHeader(index)"></el-button>
                </el-col>
            </el-row>
        </el-form-item>
    </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
    modelValue: {
        type: Array<{
            key: String,
            value: String
        }>,
        required: true
    },
    label: {
        type: String,
        default: "Headers"
    },
    tips: {
        type: String,
        default: ""
    }
})
const emit = defineEmits<{
    (e: 'update:modelValue', newValue: Array<{
        key: String,
        value: String
    }>): void
}>()

const headers = computed({
    get: () => props.modelValue,
    set: (newValue:any) => {
        emit('update:modelValue', newValue)
    }
})

const addHeader = () => {
    headers.value.push({
        key: '',
        value: ''
    })
}
const deleteHeader = (index: number) => {
    headers.value.splice(index, 1)
}

</script>