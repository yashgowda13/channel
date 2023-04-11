<script setup>
    import axios from 'axios';
    import { reactive } from 'vue';
    import { useStore } from 'vuex';
    import router from '../router'
    import { ElNotification } from 'element-plus'

    const form = reactive({
        email: '',
        password: '',
    })

    const store = useStore();

    const onSubmit = async() => {
        axios.post(store.state.backendUri+'/api/login',form,{withCredentials:true}).then(res=>{            
            ElNotification({
                title: 'Success',
                message: 'Successfully Logged In',
                type: 'success',
            })
            router.push(res.data.redirect)
        }).catch(err=>{
            ElNotification({
                title: 'Invalid Credentials',
                message: 'Wrong Email or Password',
                type: 'error',
            })
            console.log(err)
        })
    }

</script>

<template>
     <el-card class="box-card">
        <b>Login</b>
        <el-form :model="form" class="login-form" label-width="4rem">
            <el-form-item label="Email">
                <el-input type="email" v-model="form.email" placeholder="Please input" />
            </el-form-item>
            <el-form-item label="Password">
                <el-input type="password" v-model="form.password" placeholder="Please input" />
            </el-form-item>
            <el-button type="primary" @click="onSubmit()">Login</el-button>
        </el-form>
        
     </el-card>
</template>

<style scoped>
    .box-card{
        margin:10vh 10vw;
    }
    .login-form{
        margin:1rem;
    }
    .login-form > *{
        margin:1vh 1vw;
    }
</style>