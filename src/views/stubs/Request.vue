<template>
    <el-form-item label="URL" prop="url">
        <el-input v-model="selectedItem!.metadata.render.request.url"
            :readonly="selectedItem!.metadata.render.request.urlMatchType === 'any'">
            <template #prepend>
                <el-form-item prop="request.method" style="width: 70px">
                    <el-select v-model="selectedItem!.request.method">
                        <el-option v-for="(item, index) in $enum.REQUEST_METHOD" :value="item" :key="index"></el-option>
                    </el-select>
                </el-form-item>
            </template>
            <template #append>
                <el-select v-model="selectedItem!.metadata.render.request.urlMatchType" placeholder="URL 匹配模式"
                    style="width: 200px">
                    <el-option v-for="item in $enum.URL_MATCH_TYPE" :value="item.value" :label="item.label"
                        :key="item.value"></el-option>
                </el-select>
            </template>
        </el-input>
    </el-form-item>

    <el-form-item label="Params">
        <el-button :icon="Plus" size="small"
            @click="addPredicate(selectedItem!.metadata.render.request.queryParameters, '')"></el-button>
    </el-form-item>
    <match-node v-model="selectedItem!.metadata.render.request.queryParameters"></match-node>
    <el-form-item label="Headers">
        <el-button :icon="Plus" size="small"
            @click="addPredicate(selectedItem!.metadata.render.request.headers, '')"></el-button>
    </el-form-item>
    <match-node v-model="selectedItem!.metadata.render.request.headers"></match-node>
    <el-form-item label="Cookies">
        <el-button :icon="Plus" size="small"
            @click="addPredicate(selectedItem!.metadata.render.request.cookies, '')"></el-button>
    </el-form-item>
    <match-node v-model="selectedItem!.metadata.render.request.cookies"></match-node>

    <el-form-item label="Authorization">
        <el-radio-group v-model="selectedItem!.metadata.render.request.authType">
            <el-radio label="none">无</el-radio>
            <el-radio label="basicAuth">Basic Auth</el-radio>
        </el-radio-group>
    </el-form-item>
    <el-form-item v-if="selectedItem!.metadata.render.request.authType === 'basicAuth'">
        <el-input v-model="selectedItem!.request.basicAuthCredentials!.username" style="width: 300px; padding-right: 10px;">
            <template #prefix><span style="padding-right: 5px;">用户名</span></template>
        </el-input>
        <el-input v-model="selectedItem!.request.basicAuthCredentials!.password" style="width: 300px">
            <template #prefix><span style="padding-right: 5px;">密码</span></template>
        </el-input>
    </el-form-item>

    <el-form-item label="Body">
        <el-radio-group v-model="selectedItem!.metadata.render.request.bodyType">
            <el-radio label="none">无</el-radio>
            <el-radio label="raw">raw</el-radio>
            <el-radio label="form-data">form-data</el-radio>
            <el-radio label="x-www-form-urlencoded">x-www-form-urlencoded</el-radio>
        </el-radio-group>
        <el-button v-show="selectedItem!.metadata.render.request.bodyType !== 'none'"
            @click="addBodyByType(selectedItem!.metadata.render.request.bodyType)" :icon="Plus" size="small"
            style="margin-left: 20px;"></el-button>
    </el-form-item>
    <template v-if="selectedItem!.metadata.render.request.bodyType === 'raw'">
        <match-node v-model="selectedItem!.metadata.render.request.bodyPatterns"></match-node>
    </template>
    <template v-if="selectedItem!.metadata.render.request.bodyType === 'form-data'">
        <el-collapse-item :name="'multipartPattern' + (index + 1)"
            v-for="(multipartPattern, index) in selectedItem!.metadata.render.request.multipartPatterns"
            style="margin-left: 120px;">
            <template #title>
                <b>{{ 'multipartPattern(' + (index + 1) + ')' }}</b>
            </template>
            <el-form-item label="matchingType">
                <el-select v-model="multipartPattern.matchingType">
                    <el-option value="ANY" key="ANY"></el-option>
                    <el-option value="ALL" key="ALL"></el-option>
                </el-select>
                <el-button :icon="Delete" type="danger" @click="deleteMultipartPattern(index)" style="margin-left: 10px;"></el-button>
            </el-form-item>
            <el-form-item label="Headers">
                <el-button :icon="Plus" size="small" @click="addPredicate(multipartPattern.headers, '')"></el-button>
            </el-form-item>
            <match-node v-model="multipartPattern.headers"></match-node>
            <el-form-item label="BodyPatterns">
                <el-button :icon="Plus" size="small" @click="addPredicate(multipartPattern.bodyPatterns, null)"></el-button>
            </el-form-item>
            <match-node v-model="multipartPattern.bodyPatterns"></match-node>
        </el-collapse-item>
    </template>
    <template v-if="selectedItem!.metadata.render.request.bodyType === 'x-www-form-urlencoded'">
        <match-node v-model="selectedItem!.metadata.render.request.formParameters"></match-node>
    </template>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Plus, Delete } from '@element-plus/icons-vue'

import { nanoid } from '@/lib/helper'
import { useShareStatesStore } from '@/stores/UseShareStatesStore'
import $enum from '@/service/const/stubEnum'

import MatchNode from './components/MatchNode.vue';
import type { MatchNodeData } from '@/service/render/convert/renderModel';

const { selectedItem } = storeToRefs(useShareStatesStore())

const addPredicate = (matchDatas: MatchNodeData[], key: string | null) => {
    matchDatas.push({
        id: nanoid(),
        key: key,
        predicate: "equalTo",
        parentPredicate: null,
        value: "",
        params: [{
            enabled: false,
            key: "caseInsensitive"
        }],
        children: []
    })
}

const addBodyByType = (bodyType: string) => {
    switch (bodyType) {
        case 'raw':
            addPredicate(selectedItem.value!.metadata.render.request.bodyPatterns, null);
            break;
        case 'form-data':
            selectedItem.value!.metadata.render.request.multipartPatterns.push({
                matchingType: 'ANY',
                headers: [],
                bodyPatterns: []
            })
            break;
        case 'x-www-form-urlencoded':
            addPredicate(selectedItem.value!.metadata.render.request.formParameters, '');
            break;
        default:
            break;
    }
}

const deleteMultipartPattern = (index:number) => {
    selectedItem.value!.metadata.render.request.multipartPatterns.splice(index, 1)
}

</script>