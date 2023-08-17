import { defineStore } from 'pinia';

export const settingsStore = defineStore('settings', () => {
  const baseApiUrl = 'http://srv-home1.home.int:3002/api/v1/';
  return { baseApiUrl }
})
