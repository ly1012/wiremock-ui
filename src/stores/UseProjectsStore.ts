import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import localStorage from '@/lib/localStorage'

export interface IProject {
    id: string,
    name: string,
    url: string,
    desc: string
}

// 管理项目状态
export const useProjectsStore = defineStore('projectsStore', () => {
    const projects = ref([] as IProject[])
    
    const getProjectsValue = ()=>{
        const projs = localStorage.get("projects") as string
        return JSON.parse((projs === null || projs.trim() === '') ? '[]' : projs)
    }

    const persistProjectsValue = (projects:IProject[])=>{
        localStorage.set('projects', JSON.stringify(projects === null ? [] : projects))
    }

    return { projects, getProjectsValue, persistProjectsValue }
})
