import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { IStubMapping } from '@/service/api/StubMappings';


export const useShareStatesStore = defineStore('shareStatesStore', () => {
    // 切换项目管理页
    const isShowProjects = ref(false);          //展示项目管理页，默认不展示

    // 当前项目信息
    const currentProjectId = ref('')            //当前选中的项目 ID
    const currentMockUrl = ref('')              //当前选中的项目 URL

    //  当前 StubMapping
    const selectedItem = ref<IStubMapping>()    //当前选中 StubMapping
    const selectedIndex = ref(0)                //当前选中 StubMapping 的列表索引
    const currentStubMappingID = ref('')        //当前选中的 StubMapping ID 
    const resetItem = ref<IStubMapping>()       //重置数据，即一开始加载的数据

    return { 
        isShowProjects, currentProjectId, currentMockUrl, 
        selectedItem, selectedIndex, currentStubMappingID,
        resetItem
    }
})
