<script setup>
import { ref, watch, onMounted, getCurrentInstance, reactive, computed } from 'vue'
import axios from 'axios';
import { paramCase, capitalCase } from 'change-case';
import { useRoute } from 'vue-router'
import { useStore } from 'vuex';

import router from './router'

const store = useStore();

const superUser = reactive({
  value: false
})

const navig = ref('Home');

const currentRoute = useRoute();

watch(() => currentRoute.path, (newValue, oldValue) => {
  const paths = newValue.split('/')
  navig.value = capitalCase(paths[1])
  if(newValue === '/') navig.value = "Home";
})

const onNavigationChange = async(event) => {
  console.log("After load");
  await fetchSuperUser();
  if(event === "Home") return router.push('/')  
  router.push(`/${paramCase(event)}`)
}

const fetchSuperUser = async() => {
  try{
  let res = await axios.post(store.state.backendUri+'/api/issuperuser',{},{withCredentials:true})
  superUser.value = true;
  }
  catch(err){

  }
}

const print = (text) => {
  console.log('ref',text)
}

onMounted(async() => {
  fetchSuperUser()
});

const isSuperUser = computed(async() => {
  try{
    let res = await axios.post(store.state.backendUri+'/api/issuperuser',{},{withCredentials:true})
    return true;
  }
  catch(err){
    return false;
  }
});

const isUserLoggedIn = async() => {
  try{
    let res = await axios.post(store.state.backendUri+'/api/jwtverify',{},{withCredentials:true})
    return true;
  }
  catch(err){
    console.log('here')
    return false;
  }
};

</script>
  
<template>
  <el-container>
      <el-header>
        <el-radio-group v-model="navig" size="large" @change="onNavigationChange($event)">
          <el-radio-button label="Home" />
          <el-radio-button label="Login" />
          <el-radio-button v-if="isSuperUser" label="Admin" />
          <el-radio-button v-if="async()=>await isUserLoggedIn()" label="Channels" />
       </el-radio-group>
      </el-header>
      <el-main><router-view/></el-main>
    </el-container>
</template>

<style>
#app {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
