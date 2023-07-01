<template>
    <el-button :icon="Plus" type="primary" size="small" style="margin-top: 10px;margin-bottom: 50px;" @click="addWebhook">
        <slot></slot>
    </el-button>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Plus } from '@element-plus/icons-vue'

import { useShareStatesStore } from '@/stores/UseShareStatesStore'

const { selectedItem } = storeToRefs(useShareStatesStore())

const addWebhook = () => {
    if(selectedItem && selectedItem.value && selectedItem.value.postServeActions){
        selectedItem.value.postServeActions.push({
            name: 'webhook',
            parameters: {
                method: 'POST',
                url: "{{jsonPath request.body '$.data.callbackUrl'}}",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: '',
                delay: {
                    type: 'fixed',
                    milliseconds: 0,
                    median: 0,
                    sigma: 0,
                    lower: 0,
                    upper: 0
                }
            }
        })
        selectedItem.value.metadata.render.postServeActions.push({
            parameters: {
                headers: [{
                    key: 'Content-Type',
                    value: 'application/json'
                }],
                bodyType: 'json',
                delayType: 'none'
            }
        })
    }
}
</script>