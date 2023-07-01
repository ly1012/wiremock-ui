<template>
    <p v-show="!editing" @click="editCell" class="edit-cell">
        {{ inputValue }}
    </p>
    <el-input ref="inputRef" :type="type" :autosize="autosize" v-show="editing" v-model="inputValue"
        @input="$emit('update:modelValue', inputValue)" @blur="onBlur"/>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
    type: {
        type: String,
        default: "text"
    },
    autosize: Object,
    modelValue: {
        type: String,
        required: true
    }
})
const emit = defineEmits<{
    (e: 'update:modelValue', newValue: string): void
    (e: 'blur', newValue: string): void
}>()

const inputValue = ref(props.modelValue)
const editing = ref(false)
const inputRef = ref()

// 点击单元格时触发，让单元格可编辑，并自动激活输入框焦点
const editCell = () => {
    editing.value = true
    inputRef.value?.focus()
}

const onBlur = () => {
    editing.value = false
    emit('blur', inputValue.value)
}

</script>

<style lang="less">
.edit-cell {
    cursor: pointer;
    height: 20px;
    margin: 2px;
}
</style>
