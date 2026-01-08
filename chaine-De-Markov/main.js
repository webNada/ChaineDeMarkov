import { loadMarkovPage } from "./MarkovPage.js";
import { loadHomePage } from "./HomePage.js";

function navigateToHome() {
    if (typeof window.stopMarkovEngine === "function") {
        try {
            window.stopMarkovEngine();
        } catch (err) {
            // ignore stop errors from previous engine instances
        }
    }
    loadHomePage();
}

window.addEventListener("DOMContentLoaded", () => {
    loadMarkovPage();

    const btnAccueil = document.getElementById("btn-accueil");
    if (btnAccueil) {
        btnAccueil.addEventListener("click", navigateToHome);
    }
});
