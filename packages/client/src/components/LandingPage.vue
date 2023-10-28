<script setup lang="ts">
import router from '@/router';

const name = 'Nucleus Remote Management';

const requestQuote = () => {
    router.push('/contact');
};
</script>
<template>
    <section class="section" id="header">
        <div class="columns is-h-100 is-align-items-center" id="landing-image">
            <div class="column is-half">
                <h2 class="subtitle">
                    Effizientes Endgeräte-Management und Automatisierung Ihrer IT-Aufgaben - wann und wo Sie wollen!
                </h2>
                <button class="button is-primary is-large" @click="requestQuote">
                    <span>{{ $t('home.requestQuote') }}</span>
                </button>
            </div>
            <div class="column"></div>
        </div>

    </section>
    <section class="section">
        <h1 class="title has-text-centered">{{ name }}: Ihre ultimative Lösung zur Computer-Verwaltung aus der Cloud!</h1>
        <p>In der heutigen digitalen Welt ist die effiziente Verwaltung von Computern und Geräten in Unternehmen von
            entscheidender
            Bedeutung. Mit {{ name }} bieten wir Ihnen eine innovative Softwarelösung, die es Ihnen ermöglicht, Ihre gesamte
            Computerinfrastruktur problemlos aus der Cloud heraus zu verwalten. Unsere Plattform revolutioniert die Art und
            Weise, wie Sie Ihre IT-Ressourcen organisieren, überwachen und optimieren.
        </p>
    </section>
    <section class="section">
        <h2 class="subtitle">Warum {{ name }}?</h2>
        <div class="columns">
            <div class="column">
                <h2 class="subtitle has-text-centered has-text-weight-bold">Sicherheit</h2>
                <p>
                    Ihre Daten und Geräte sind in besten Händen. Wir bieten höchste Sicherheitsstandards, um Ihre sensiblen
                    Informationen zu schützen.
                </p>
            </div>
            <div class="column">
                <h2 class="subtitle has-text-centered has-text-weight-bold">Flexibilität</h2>
                <p>
                    {{ name }} passt sich Ihren individuellen Bedürfnissen an.
                </p>
            </div>
            <div class="column">
                <h2 class="subtitle has-text-centered has-text-weight-bold">Skalierbarkeit</h2>
                <p>
                    Mit {{ name }} können Sie Ihre Computerinfrastruktur mühelos erweitern, wenn Ihr Unternehmen wächst.
                </p>
            </div>
            <div class="column">
                <h2 class="subtitle has-text-centered has-text-weight-bold">Einfache Bedienung</h2>
                <p>
                    Unsere benutzerfreundliche Oberfläche ermöglicht es Ihnen, Computer und Geräte mit nur wenigen Klicks zu
                    verwalten.
                </p>
            </div>
            <div class="column" v-show="false">
                <h2 class="subtitle has-text-centered has-text-weight-bold">Kosteneffizienz</h2>
                <p>
                    {{ name }} hilft Ihnen, Kosten zu senken, indem Sie Prozesse automatisieren undeffizienter arbeiten.
                </p>
            </div>
        </div>
    </section>
    <section class="section">
        <h2 class="subtitle">Unsere Funktionen im Überblick:</h2>
        <div class="columns">
            <div class="column">
                <h2 class="subtitle has-text-centered has-text-weight-bold">Remote-Verwaltung</h2>
                <p>
                    Überwachen und steuern Sie Ihre Computer von überall auf der Welt.
                </p>
            </div>
            <div class="column" v-show="false">
                <h2 class="subtitle has-text-centered has-text-weight-bold">Automatisierte Updates</h2>
                <p>
                    Halten Sie Ihre Software und Betriebssysteme immer auf dem neuesten Stand.
                </p>
            </div>
            <div class="column" v-show="false">
                <h2 class="subtitle has-text-centered has-text-weight-bold">Sicherheitsrichtlinien</h2>
                <p>
                    Implementieren Sie benutzerdefinierte Sicherheitsrichtlinien, um Ihr Unternehmen vor Bedrohungen zu
                    schützen.
                </p>
            </div>
            <div class="column">
                <h2 class="subtitle has-text-centered has-text-weight-bold">Berichterstattung und Analyse</h2>
                <p>
                    Erhalten Sie detaillierte Einblicke in die Leistung Ihrer IT-Infrastruktur.
                </p>
            </div>
            <div class="column">
                <h2 class="subtitle has-text-centered has-text-weight-bold">Softwareverteilung</h2>
                <p>
                    Installieren und aktualisieren Sie Anwendungen auf all Ihren Geräten zentral.
                </p>
            </div>
        </div>
    </section>
    <section class="section">
        <h2 class="subtitle">Kontaktieren Sie uns heute!</h2>
        <p>
            Bereit, die Kontrolle über Ihre Computerinfrastruktur zu übernehmen? Lassen Sie {{ name }} Ihnen den Weg ebnen.
            Unser
            Team steht Ihnen gerne zur Verfügung, um Ihre Fragen zu beantworten und Ihnen bei der Implementierung unserer
            leistungsstarken Lösung zu helfen.
        </p>
        <p>
            Entdecken Sie die Zukunft der Computer-Verwaltung aus der Cloud mit {{ name }}. Starten Sie noch heute und
            optimieren
            Sie Ihre IT-Infrastruktur wie nie zuvor.
        </p>
    </section>
</template>

<style lang="scss" scoped>
@use '@/assets/variables.scss' as var;

#landing-image {
    background: linear-gradient(to left, transparent, 20%, var.$surface-100), url('@/assets/landing_image.jpg');
    background-size: cover;
    background-position: center;
}

#header {
    padding-bottom: 1rem;
    height: 30%;
    max-height: 350px;
}
</style>