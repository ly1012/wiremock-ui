<template>
    <span :style="calculateStyle()">{{ status }}</span>
</template>

<script lang="ts" setup>

const props = defineProps({
    "status": {
        required: true,
        type: Number
    }
})

const calculateStyle = () => {
    const status = props.status
    let style = "color: gray"
    if (status < 200) {              //1XX: 信息性状态码
        style = "color: gray"
    } else if (status < 300) {       //2XX: 成功状态码
        style = "color: seagreen"
    } else if (status < 400) {       //3XX: 重定向
        style = "color: orange"
    } else if (status < 500) {       //4XX: 客户端错误
        style = "color: #f56c6c"
    } else if (status < 600) {       //5XX: 服务端错误
        style = "color: #f56c6c"
    }
    return style
}
</script>