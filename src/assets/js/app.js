import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyBs7oaWeJaGSABLIZTHw_e3FKqjXZEfWl0",
    authDomain: "excelarate-42dfe.firebaseapp.com",
    projectId: "excelarate-42dfe",
    storageBucket: "excelarate-42dfe.firebasestorage.app",
    messagingSenderId: "912173507507",
    appId: "1:912173507507:web:62a80ec070a40678c1e1c6"
};

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)

// Show error function
export function showError(message) {
    let errorMessageElement = document.getElementById("errorMessage")
    let errorElement = document.getElementById('error');

    errorMessageElement.textContent = message;
    errorElement.classList.add('show');

    // Add shake animation to the card
    const card = document.querySelector('.card');
    if (!card) return;
    card.style.animation = 'none';
    setTimeout(() => {
        card.style.animation = 'shake 0.5s ease-in-out';
    }, 10);
}
