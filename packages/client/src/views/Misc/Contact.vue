<script setup lang="ts">
import { settingsStore } from '@/stores/settings';
import { ref } from 'vue';

const { baseApiUrl } = settingsStore();
const url = new URL('/system/contact', baseApiUrl).href;

const data = ref({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    company: '',
    clients: 0,
    message: '',
});

const sendContact = () => {
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data.value),
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((res) => {
        if (res.ok) {
            data.value = {
                firstname: '',
                lastname: '',
                email: '',
                phone: '',
                company: '',
                clients: 0,
                message: '',
            }
        }
    });
};
</script>

<template>
    <div class="columns is-flex-grow-1 is-multiline is-align-content-flex-start is-justify-content-center is-h-100">
        <div class="column is-two-thirds">
            <h1 class="title">Angebot anfragen</h1>
        </div>
        <div class="column is-two-thirds">
            <p>Füllen Sie das Formular aus, um ein individuelles Angebot anzufragen.</p>
        </div>
        <div class="column is-two-thirds">
            <form @submit.prevent="sendContact">
                <div class="field is-grouped">
                    <div class="control is-expanded">
                        <label class="label" for="firstname">Vorname:</label>
                        <input class="input" v-model="data.firstname" type="text" id="firstname" name="firstname"
                            placeholder="Ihr Vorname" required>
                    </div>
                    <div class="control is-expanded">
                        <label class="label" for="lastname">Nachname:</label>
                        <input class="input" v-model="data.lastname" type="text" id="lastname" name="lastname"
                            placeholder="Ihr Nachname" required>
                    </div>
                </div>
                <div class="field is-grouped">
                    <div class="control is-expanded">
                        <label class="label" for="email">E-Mail-Adresse:</label>
                        <input class="input" v-model="data.email" type="email" id="email" name="email"
                            placeholder="Ihre E-Mail-Adresse" required>
                    </div>

                    <div class="control is-expanded">
                        <label class="label" for="phone">Telefonnummer:</label>
                        <input class="input" v-model="data.phone" type="tel" id="phone" name="phone"
                            placeholder="Ihre Telefonnummer" required>
                    </div>
                </div>
                <div class="field is-grouped">
                    <div class="control is-expanded">
                        <label class="label" for="company">Unternehmen:</label>
                        <input class="input" v-model="data.company" type="text" id="company" name="company"
                            placeholder="Ihr Unternehmen" required>
                    </div>
                    <div class="control is-expanded">
                        <label class="label" for="clients">Geplante Clients:</label>
                        <input class="input" v-model="data.clients" type="number" id="clients" name="clients"
                            placeholder="Ihr Clients" required>
                    </div>
                </div>

                <div class="field">
                    <label class="label" for="message">Nachricht:</label>
                    <textarea class="textarea" v-model="data.message" id="message" name="message"
                        placeholder="Ihre Anforderungen und Anmerkungen"></textarea>
                </div>
                <input class="button is-primary" type="submit" value="Angebot anfordern">
            </form>
        </div>
    </div>
</template>