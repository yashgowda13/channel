<script setup>
import axios from 'axios';
import moment from 'moment';
import { onMounted, ref, h, reactive } from 'vue';
import { useStore } from 'vuex';
import router from '../router';
import { ElNotification, ElMessageBox, ElInput, ElTabs, ElTabPane, ElCheckbox } from 'element-plus'


const store = useStore();

const users = ref([]);
const channels = ref([]);

const activeTab = ref('users')

const deleteChannel = async(event) => {
    axios.delete(store.state.backendUri+"/api/channels",{withCredentials:true,data:{name:event.row.name}}).then(res=>{
        fetchChannels();
        ElNotification({
            title: 'Success',
            message: `Successfully deleted ${event.row.name} channel`,
            type: 'success',
        })
    }).catch(err=>{
        ElNotification({
            title: 'Error',
            message: 'Error Deleting Channel',
            type: 'error',
        })
    })
}

onMounted(async()=>{
    try{
        await axios.post(store.state.backendUri+"/api/issuperuser",{},{withCredentials:true})
        await fetchUsers();
        await fetchChannels();
    }
    catch(err){
        router.push('/login')
    }
})

const fetchUsers = async() => {
    const usersRes = await axios.post(store.state.backendUri+"/api/users/invited",{},{withCredentials:true})
    users.value = usersRes.data
}

const fetchChannels = async() => {
    const channelsRes = await axios.post(store.state.backendUri+"/api/channels",{},{withCredentials:true})
    channelsRes.data.map(channel=>{
        const momentTimestamp = moment(channel.creationTimestamp);
        channel.creationDate = momentTimestamp.format("dddd, MMMM Do YYYY, h:mm:ss a")
        return channel
    })
    channels.value = channelsRes.data;
}

const openChannelCreationModal = () => {
    const createChannelName = ref('');
    ElMessageBox({
    title: 'Create Channel',
    // Should pass a function if VNode contains dynamic props
    message: () =>
      h('div', [,
        h('h3', 'Channel Name:'),
        h(ElInput, {
        modelValue: createChannelName.value,
        'onUpdate:modelValue':(e)=> {
            createChannelName.value = e
        }
        })
      ]),
    callback:(action)=>{
        if(action==="confirm"){
            if(createChannelName.value === '')
                return ElNotification({
                    title: 'Error',
                    message: 'Cannot Create Channel with Empty Name',
                    type: 'error',
                })
            axios.put(store.state.backendUri+'/api/channels', {name:createChannelName.value},{withCredentials:true}).then(res=>{
                fetchChannels();
                ElNotification({
                    title: 'Success',
                    message: `Successfully created ${createChannelName.value} channel`,
                    type: 'success',
                })
            }).catch(err=>{
                ElNotification({
                    title: 'Error',
                    message: 'Error Creating Channel ',
                    type: 'error',
                })
            })
        }
    }
  })
}

const openUserCreationModal = () => {
    const UserName = ref('');
    const UserEmail = ref('');
    let channelsList = {};
    const accessChannelTab = ref(channels.value[0]?.name);
    let tabPanes = [];
    for(let channel of channels.value){
        channelsList[channel.name] = {
            read:false,
            write:false,
            delete:false,
        }
        tabPanes.push(h(ElTabPane,
            { 
                label: channel.name,
                name: channel.name,
            },
        ))
    }
    const UserAccesses = reactive(channelsList);
    ElMessageBox({
    title: 'Add User',
    // Should pass a function if VNode contains dynamic props
    message: () =>
      h('div', [
        h('h3', 'Name:'),
        h(ElInput, {
        modelValue: UserName.value,
        'onUpdate:modelValue':(e)=> {
            UserName.value = e
        }
        }),
        h('h3', 'Email:'),
        h(ElInput, {
            modelValue: UserEmail.value,
            'onUpdate:modelValue':(e) => {
                UserEmail.value = e
            }
        }),
        h('h3', 'Accesses:'),
        h(ElTabs, {
            modelValue: accessChannelTab.value,
            'onUpdate:modelValue':(e)=> {
                accessChannelTab.value = e
            }
        },tabPanes
        ),
        h("div", [
            h(ElCheckbox,{
                modelValue: UserAccesses[accessChannelTab.value].read,
                'onUpdate:modelValue':(e) => {
                    UserAccesses[accessChannelTab.value].read = e
                },
                label: 'read'
            }),
            h(ElCheckbox,{
                modelValue: UserAccesses[accessChannelTab.value].write,
                'onUpdate:modelValue':(e) => {
                    UserAccesses[accessChannelTab.value].write = e
                },
                label: 'write'
            }),
            h(ElCheckbox,{
                modelValue: UserAccesses[accessChannelTab.value].delete,
                'onUpdate:modelValue':(e) => {
                    UserAccesses[accessChannelTab.value].delete = e
                },
                label: 'delete'
            })
        ])
      ]),
    callback:(action)=>{
        if(action==="confirm"){
            if(UserName.value === '')
                return ElNotification({
                    title: 'Error',
                    message: 'Cannot Create Channel with Empty Name',
                    type: 'error',
                })
            axios.put(store.state.backendUri+'/api/users/invited', {name:UserName.value, email:UserEmail.value, accesses:UserAccesses},{withCredentials:true}).then(res=>{
                fetchUsers();
                ElNotification({
                    title: 'Success',
                    message: `Successfully added ${UserName.value} User`,
                    type: 'success',
                })
            }).catch(err=>{
                ElNotification({
                    title: 'Error',
                    message: 'Error Adding User ',
                    type: 'error',
                })
            })
        }
    }
  })
}

const openUserEditModal = (name, email, accesses) => {
    const UserName = ref(name);
    const UserEmail = ref(email);
    let channelsList = {};
    const accessChannelTab = ref(channels.value[0]?.name);
    let tabPanes = [];
    for(let channel of channels.value){
        channelsList[channel.name] = {
            read:false,
            write:false,
            delete:false,
        }
        if(accesses[channel.name]) channelsList[channel.name] = accesses[channel.name]
        tabPanes.push(h(ElTabPane,
            { 
                label: channel.name,
                name: channel.name,
            },
        ))
    }
    const UserAccesses = reactive(channelsList);
    ElMessageBox({
    title: 'Add User',
    // Should pass a function if VNode contains dynamic props
    message: () =>
      h('div', [
        h('h3', 'Name:'),
        h(ElInput, {
        modelValue: UserName.value,
        'onUpdate:modelValue':(e)=> {
            UserName.value = e
        }
        }),
        h('h3', 'Email:'),
        h(ElInput, {
            modelValue: UserEmail.value,
            'onUpdate:modelValue':(e) => {
                UserEmail.value = e
            }
        }),
        h('h3', 'Accesses:'),
        h(ElTabs, {
            modelValue: accessChannelTab.value,
            'onUpdate:modelValue':(e)=> {
                accessChannelTab.value = e
            }
        },tabPanes
        ),
        h("div", [
            h(ElCheckbox,{
                modelValue: UserAccesses[accessChannelTab.value].read,
                'onUpdate:modelValue':(e) => {
                    UserAccesses[accessChannelTab.value].read = e
                },
                label: 'read'
            }),
            h(ElCheckbox,{
                modelValue: UserAccesses[accessChannelTab.value].write,
                'onUpdate:modelValue':(e) => {
                    UserAccesses[accessChannelTab.value].write = e
                },
                label: 'write'
            }),
            h(ElCheckbox,{
                modelValue: UserAccesses[accessChannelTab.value].delete,
                'onUpdate:modelValue':(e) => {
                    UserAccesses[accessChannelTab.value].delete = e
                },
                label: 'delete'
            })
        ])
      ]),
    callback:(action)=>{
        if(action==="confirm"){
            if(UserName.value === '')
                return ElNotification({
                    title: 'Error',
                    message: 'Cannot Create Channel with Empty Name',
                    type: 'error',
                })
            axios.patch(store.state.backendUri+'/api/users/invited', {name:UserName.value, email:UserEmail.value, accesses:UserAccesses},{withCredentials:true}).then(res=>{
                fetchUsers();
                ElNotification({
                    title: 'Success',
                    message: `Successfully added ${UserName.value} User`,
                    type: 'success',
                })
            }).catch(err=>{
                ElNotification({
                    title: 'Error',
                    message: 'Error Adding User ',
                    type: 'error',
                })
            })
        }
    }
  })
}


const deleteUser = async(scope) => {
    axios.delete(store.state.backendUri + '/api/users/invited', {withCredentials:true, data:{id:scope.row._id}}).then(res=>{
        fetchUsers();
        ElNotification({
            title: 'Success',
            message: `Successfully deleted ${scope.row.name} user`,
            type: 'success',
        })
    }).catch(err=>{
        ElNotification({
                    title: 'Error',
                    message: 'Error Deleting User ',
                    type: 'error',
                })
    })

}


</script>

<template>
    <el-tabs v-model="activeTab">
        <el-tab-pane label="Users" name="users">
            <div class="user-buttons">
                <el-button @click="openUserCreationModal()" type="primary">Add User</el-button>
            </div>
            <el-table :data="users" style="width: 100%">
                <el-table-column prop="name" label="Name" width="180" />
                <el-table-column prop="email" label="Email" width="180" />
                <el-table-column label="Accesses">
                    <template #default="scope">
                        {{ Object.keys(scope.row.accesses) }}
                    </template>
                </el-table-column>
                <el-table-column prop="invitationStatus" label="Invitation Status" width="180"></el-table-column>
                <el-table-column label="Actions">
                    <template #default="scope">
                        <el-button
                            type="primary"
                            size="small"
                            @click="openUserEditModal(scope.row.name, scope.row.email, scope.row.accesses)"
                        >
                            Edit
                        </el-button>
                        <el-popconfirm @confirm="deleteUser(scope)" title="Are you sure to delete this?">
                            <template #reference>
                                <el-button
                                    type="primary"
                                    size="small"
                                >
                                    Delete
                                </el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>
        <el-tab-pane label="Channels" name="channels">
            <div class="channel-buttons">
                <el-button @click="openChannelCreationModal()" type="primary">Create Channel</el-button>
            </div>
            <el-table :data="channels" style="width: 100%">
                <el-table-column prop="name" label="Name" width="180" />
                <el-table-column prop="createdBy" label="Created By" width="180" />
                <el-table-column prop="creationDate" label="Created At" />
                <el-table-column fixed="right" label="Actions" width="120">
                    <template #default="scope">
                        <el-popconfirm @confirm="deleteChannel(scope)" title="Are you sure to delete this?">
                            <template #reference>
                                <el-button
                                    type="primary"
                                    size="small"
                                >
                                    Delete
                                </el-button>
                            </template>
                        </el-popconfirm>
                        
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>
    </el-tabs>



</template>

<style scoped>
    .user-buttons{
        text-align: right;
        margin:1vh 1vw;
    }
    .channel-buttons{
        text-align: right;
        margin:1vh 1vw;
    }
</style>