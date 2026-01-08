import { loadMarkovPage } from "./MarkovPage.js";

export function loadHomePage() {
    const app = document.getElementById("app");

    window.stopMarkovEngine = null;

    const existingPanel = document.querySelector('.right-panel');
    if (existingPanel) existingPanel.remove();

    app.innerHTML = `
        <div class="home-hero">
            <img src="https://terra-numerica.org/files/2020/10/cropped-favicon-rond.png" class="home-logo" alt="Logo Terra Numerica" />
            <h1>Chaîne de Markov – Aire de jeux</h1>
            <p class="home-lead">
                Aide Lily-May à explorer l'aire de jeux. À chaque étape, elle suit une flèche
                pour rejoindre un nouveau jeu. Observe les trajectoires possibles et les fréquences de visite.
            </p>
            <section class="home-rules">
                <h2>Comment jouer&nbsp;?</h2>
                <ol>
                    <li>Clique sur <strong>Démarrer</strong> pour lancer la balade aléatoire.</li>
                    <li>Les flèches indiquent les déplacements autorisés entre les jeux.</li>
                    <li>Observe les compteurs de visites et les fréquences pour comprendre le comportement de la chaîne.</li>
                    <li>Utilise <strong>Rejouer</strong> pour remettre les compteurs à zéro et tester d'autres paramètres.</li>
                </ol>
            </section>
            <button id="btn-markov" class="tn-button">
                Lancer la simulation
            </button>
        </div>
    `;

    document.getElementById("btn-markov").onclick = () => loadMarkovPage();
}
