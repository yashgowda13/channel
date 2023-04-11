<script setup>
import { useRoute } from 'vue-router';
import { onMounted, ref, h, onUnmounted } from 'vue';
import axios from 'axios';
import { ElNotification, ElInput } from 'element-plus';
import { useStore } from 'vuex';
import moment from 'moment';

const store = useStore();

const posts = ref([])
const pageRef = ref(0);

onMounted(()=>{
    fetchPosts();
    window.addEventListener('scroll', console.log("Scrolling"));
})

onUnmounted(()=>{
    console.log('123')
    window.removeEventListener('scroll', console.log(1233));
})

const fetchPosts = (page=0) => {
    if(page==0)
    pageRef.value = 0
    axios.post(store.state.backendUri+'/api/posts',{channel:route.params.name, page}, {withCredentials:true}).then(res=>{
        if(page==0)
            posts.value = res.data.map(post=>{
                const momentTimestamp = moment(post.creationTimestamp);
                post.creationDate = momentTimestamp.format("dddd, MMMM Do YYYY, h:mm:ss a")
                return post
            })
        else{
            let temp = res.data.map(post=>{
                const momentTimestamp = moment(post.creationTimestamp);
                post.creationDate = momentTimestamp.format("dddd, MMMM Do YYYY, h:mm:ss a")
                return post
            })
            posts.value = posts.value.concat(temp)
        }
        console.log(posts.value)
    }).catch(err=>{
        ElNotification({
            title:"Error",
            message: "Error Fetching Posts",
            type: "error",
        })
    })
}

const openPostCreationModal = () => {
    const createPostName = ref('');
    ElMessageBox({
    title: 'Create Post',
    // Should pass a function if VNode contains dynamic props
    message: () =>
      h('div', [,
        h('h3', 'Post Content:'),
        h(ElInput, {
        modelValue: createPostName.value,
        'onUpdate:modelValue':(e)=> {
            createPostName.value = e
        }
        })
      ]),
    callback:(action)=>{
        if(action==="confirm"){
            if(createPostName.value === '')
                return ElNotification({
                    title: 'Error',
                    message: 'Cannot Create Post with Empty Content',
                    type: 'error',
                })
            console.log({channel:route.params.name, content:createPostName.value})
            axios.put(store.state.backendUri+'/api/posts', {channel:route.params.name, content:createPostName.value},{withCredentials:true}).then(res=>{
                fetchPosts();
                ElNotification({
                    title: 'Success',
                    message: `Successfully added Post!`,
                    type: 'success',
                })
            }).catch(err=>{
                console.log(err)
                ElNotification({
                    title: 'Error',
                    message: 'Error Creating Post ',
                    type: 'error',
                })
            })
        }
    }
  })
}

const openPostEditModal = (content, id) => {
    const editPostName = ref(content);
    ElMessageBox({
    title: 'Create Post',
    // Should pass a function if VNode contains dynamic props
    message: () =>
      h('div', [,
        h('h3', 'Post Content:'),
        h(ElInput, {
        modelValue: editPostName.value,
        'onUpdate:modelValue':(e)=> {
            editPostName.value = e
        }
        })
      ]),
    callback:(action)=>{
        if(action==="confirm"){
            if(editPostName.value === '')
                return ElNotification({
                    title: 'Error',
                    message: 'Cannot Edit Post with Empty Content',
                    type: 'error',
                })
            console.log({channel:route.params.name, content:editPostName.value})
            axios.patch(store.state.backendUri+'/api/posts', {channel:route.params.name, content:editPostName.value, id},{withCredentials:true}).then(res=>{
                fetchPosts();
                ElNotification({
                    title: 'Success',
                    message: `Successfully Editted Post!`,
                    type: 'success',
                })
            }).catch(err=>{
                console.log(err)
                ElNotification({
                    title: 'Error',
                    message: 'Error Editting Post ',
                    type: 'error',
                })
            })
        }
    }
  })
}

const deletePost = (postId) => {
    axios.delete(store.state.backendUri+'/api/posts', {withCredentials:true, data:{channel:route.params.name, postId}}).then(res=>{
        fetchPosts();
        ElNotification({
            title:"Success",
            message:"Successfully Deleted Post!",
            type:"success"
        })
    }).catch(err=>{
        ElNotification({
            title:"Error",
            message:"Error Deleting Post!",
            type:"error"
        })
    })
}

const onScroll =  ({ target: { scrollTop, clientHeight, scrollHeight }}) => {
      if (scrollTop + clientHeight >= scrollHeight) {
        fetchPosts(++pageRef.value)
      }
    }


const route = useRoute();
</script>

<template>
    <div class="channel-page">
        <h2>{{ route.params.name }}</h2>
        <div class="channel-buttons">
            <el-button type="primary" @click="openPostCreationModal()">Create Post</el-button>
        </div>
        <div class="posts" @scroll="onScroll($event)">
            <el-card class="post" v-for="post of posts">
            <h3>{{ post.content }}</h3>
            <h5>Created by {{ post.createdBy }} at {{ post.creationDate }}</h5>
            <div class="post-buttons">
                <el-button type="primary" @click="openPostEditModal(post.content, post._id)">Edit</el-button>
                <el-popconfirm @confirm="deletePost(post._id)" title="Are you sure to delete this?">
                    <template #reference>
                        <el-button type="danger">Delete</el-button>
                    </template>
                </el-popconfirm>
            </div>
        </el-card>
        </div>
    </div>
</template>

<style scoped>
    .channel-page{
        text-align: left;
        
    }
    .channel-buttons{
        text-align:right;
        margin:1vh 1vw;
    }
    .posts{
        overflow-y: scroll;
        height:72vh;
    }
    .post{
        margin:1vh 1vw;
        position:relative;
    }
    .post-buttons{
        position:absolute;
        right: 1vw;
        top: 1vh;
    }
</style>

