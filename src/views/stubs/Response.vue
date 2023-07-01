<template>
    <el-form-item label="响应类型">
        <el-radio-group v-model="selectedItem!.metadata.render.response.responseType">
            <el-radio-button label="none">无</el-radio-button>
            <el-radio-button label="direct">Direct</el-radio-button>
            <el-radio-button label="fault">Fault</el-radio-button>
            <el-radio-button label="proxy">Proxy</el-radio-button>
        </el-radio-group>
    </el-form-item>
    <template v-if="selectedItem!.metadata.render.response.responseType === 'direct'">
        <el-form-item label="Status">
            <el-input v-model="selectedItem!.response.status" class="not-last-input" style="width: 150px;">
                <template #prefix>
                    <span>Code</span>
                </template>
            </el-input>
            <el-input v-model="selectedItem!.response.statusMessage" style="width: 359px;">
                <template #prefix>
                    <span>Value</span>
                </template>
            </el-input>
        </el-form-item>
        <plain-headers v-model="selectedItem!.metadata.render.response.direct.headers"></plain-headers>
        <el-form-item label="Body">
            <el-radio-group v-model="selectedItem!.metadata.render.response.direct.bodyType" @change="changeBodyType">
                <el-radio label="none">无</el-radio>
                <el-radio label="json">JSON</el-radio>
                <el-radio label="xml">XML</el-radio>
                <el-radio label="html">HTML</el-radio>
                <el-radio label="text">Text</el-radio>
                <el-radio label="base64">Base64</el-radio>
                <el-radio label="bodyFileName">BodyFileName</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label=""
            v-if="['json', 'xml', 'html', 'text'].includes(selectedItem!.metadata.render.response.direct.bodyType)">
            <el-input type="textarea" :autosize="{ minRows: 8, maxRows: 30 }"
                v-model="selectedItem!.response.body"></el-input>
        </el-form-item>
        <el-form-item label="" v-else-if="selectedItem!.metadata.render.response.direct.bodyType === 'base64'">
            <el-input type="textarea" :autosize="{ minRows: 8, maxRows: 30 }"
                v-model="selectedItem!.response.base64Body"></el-input>
        </el-form-item>
        <el-form-item label="" v-else-if="selectedItem!.metadata.render.response.direct.bodyType === 'bodyFileName'">
            <el-input type="text" v-model="selectedItem!.response.bodyFileName"></el-input>
        </el-form-item>
    </template>
    <template v-if="selectedItem!.metadata.render.response.responseType === 'fault'">
        <el-form-item label="错误类型">
            <el-radio-group v-model="selectedItem!.response.fault" style="flex-direction: column;align-items: flex-start;">
                <el-radio label="EMPTY_RESPONSE">不发送响应数据，直接关闭 socket 连接</el-radio>
                <el-radio label="RANDOM_DATA_THEN_CLOSE">发送非法响应数据，然后关闭 socket
                    连接</el-radio>
                <el-radio label="MALFORMED_RESPONSE_CHUNK">发送 200 状态码和非法响应数据，然后关闭 socket
                    连接</el-radio>
                <el-radio label="CONNECTION_RESET_BY_PEER">Peer connection
                    reset</el-radio>
            </el-radio-group>
        </el-form-item>
    </template>
    <template v-if="selectedItem!.metadata.render.response.responseType === 'proxy'">
        <el-form-item label="Proxy Base URL">
            <el-input v-model="selectedItem!.response.proxyBaseUrl"></el-input>
        </el-form-item>
        <plain-headers v-model="selectedItem!.metadata.render.response.proxy.headers" tips="（不支持多值 Header）"></plain-headers>
    </template>
    <el-form-item label="响应延时">
        <el-radio-group v-model="selectedItem!.metadata.render.response.delayType">
            <el-radio label="none">无</el-radio>
            <el-radio label="fixedDelayMilliseconds">固定延时</el-radio>
            <el-radio label="chunkedDribbleDelay">模拟弱网</el-radio>
            <el-radio label="lognormal">随机延时（中值）</el-radio>
            <el-radio label="uniform">随机延时（范围）</el-radio>
        </el-radio-group>
    </el-form-item>
    <el-form-item v-if="selectedItem!.metadata.render.response.delayType === 'fixedDelayMilliseconds'">
        <el-input v-model="selectedItem!.response.fixedDelayMilliseconds" class="delay-input">
            <template #suffix>ms</template>
        </el-input>
    </el-form-item>
    <el-form-item v-if="selectedItem!.metadata.render.response.delayType === 'chunkedDribbleDelay'">
        <el-input v-model="selectedItem!.response.chunkedDribbleDelay!.numberOfChunks" class="delay-input not-last-input">
            <template #prefix><span>Chunk 数量</span></template>
            <template #suffix>个</template>
        </el-input>
        <el-input v-model="selectedItem!.response.chunkedDribbleDelay!.totalDuration" class="delay-input">
            <template #prefix><span>总响应时间</span></template>
            <template #suffix>ms</template>
        </el-input>
    </el-form-item>
    <el-form-item v-if="selectedItem!.metadata.render.response.delayType === 'lognormal'">
        <el-input v-model="selectedItem!.response.delayDistribution!.median" class="delay-input not-last-input">
            <template #prefix><span>中值</span></template>
            <template #suffix>ms</template>
        </el-input>
        <el-input v-model="selectedItem!.response.delayDistribution!.sigma" class="delay-input">
            <template #prefix><span>标准差</span></template>
        </el-input>
    </el-form-item>
    <el-form-item v-if="selectedItem!.metadata.render.response.delayType === 'uniform'">
        <el-input v-model="selectedItem!.response.delayDistribution!.lower" class="delay-input not-last-input">
            <template #prefix><span>最小值</span></template>
            <template #suffix>ms</template>
        </el-input>
        <el-input v-model="selectedItem!.response.delayDistribution!.upper" class="delay-input">
            <template #prefix><span>最大值</span></template>
            <template #suffix>ms</template>
        </el-input>
    </el-form-item>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useShareStatesStore } from '@/stores/UseShareStatesStore'
import { changeHeaderByBodyType } from './components/headers'

import PlainHeaders from './components/PlainHeaders.vue'

const { selectedItem } = storeToRefs(useShareStatesStore())

const changeBodyType = (bodyType: string) => {
    changeHeaderByBodyType(selectedItem.value!.metadata.render.response.direct.headers, bodyType)
}
</script>

<style lang="less" scoped>
.delay-input {
    width: 200px
}

.not-last-input {
    padding-right: 10px;
}

</style>