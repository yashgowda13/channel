import { createStore } from 'vuex';

const store = createStore({
    state: {
      backendUri: process.env.NODE_ENV==="development"?"http://localhost:5000":"/",
    },
})

export default store;