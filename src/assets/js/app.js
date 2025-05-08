import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
    apiKey: "AIzaSyDkMOm3CouogN1Fd5G_5TrClZc82Iq7rdo",
    authDomain: "excelarate-main.firebaseapp.com",
    projectId: "excelarate-main",
    storageBucket: "excelarate-main.firebasestorage.app",
    messagingSenderId: "874021694915",
    appId: "1:874021694915:web:b3dd39620ba42b52e3e176",
    measurementId: "G-5NGNT5RSCS"
};

const app = initializeApp(firebaseConfig)

// plan to use analytics in the future
export const analytics = getAnalytics(app);


export default app;


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
