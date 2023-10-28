<script setup lang="ts">
import Dashboard from '@/components/Dashboard.vue';
import LandingPage from '@/components/LandingPage.vue';
import userStore from '@/stores/user';
import { storeToRefs } from 'pinia';

const { isLoggedIn } = storeToRefs(userStore());
</script>

<template>
    <div class="is-flex is-flex-direction-column is-flex-grow-1 is-multiline is-align-content-flex-start is-h-100">
        <div class="is-flex-grow-0">
            <h1 class="title">{{ $t('home.title') }}</h1>
        </div>
        <div class="is-flex-grow-1">
            <Dashboard v-if="isLoggedIn" />
            <LandingPage v-else />
        </div>
    </div>
</template>
