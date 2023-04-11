<script setup>
    import axios from 'axios';
import { ElNotification } from 'element-plus';
    import { onMounted, ref } from 'vue';
    import { useStore } from 'vuex';
    import router from '../router';

    const store = useStore();

    const channels = ref([]);
    
    onMounted(()=>{
        axios.post(store.state.backendUri+'/api/jwtverify',{}, {withCredentials:true}).catch(err=>{
            router.push('/login')
        })

        axios.post(store.state.backendUri+'/api/channels/name',{}, {withCredentials:true}).then(res=>{
            channels.value = res.data
            console.log(channels.value)
        }).catch(err=>{
            ElNotification({
                title:"Error",
                message:"Error Fetching Channels",
                type:"error"
            })
        })
    })

    const navigate = (path) => {
        router.push(path)
    }
</script>

<template>
    <div class="cards">
        <el-card v-for="channel of channels" @click="navigate(`/channel/${channel}`)" class="channels" shadow="hover">
            {{ channel }}
        </el-card>
    </div>
</template>

<style>
.cards{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1vw;
}
.channels:hover{
    cursor: pointer;
}
</style>