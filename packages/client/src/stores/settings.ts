import { defineStore } from 'pinia';

export const settingsStore = defineStore('settings', () => {
  if (import.meta.env.DEV) {
    const baseApiUrl = 'http://srv-home1.home.int:3002/api/v1/';
    return { baseApiUrl }
  } else {
    const baseApiUrl = 'https://nrs.backend.pcsmw.de/api/v1/';
    return { baseApiUrl }
  }
})
