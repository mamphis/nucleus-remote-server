import { defineStore } from "pinia";
import { ref } from "vue";

const userStore = defineStore('user', () => {
    const isLoggedIn = ref(false);



    return {
        isLoggedIn,
    };
});

export default userStore;