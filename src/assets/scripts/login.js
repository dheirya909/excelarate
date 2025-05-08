import {showError} from "../js/app.js";
import auth from "../js/auth.js";
import {signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup as signInWithRedirect} from "firebase/auth";

// DOM elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('loginButton');
const errorElement = document.getElementById('error');
const passwordToggle = document.getElementById('passwordToggle');
const rememberMeCheckbox = document.getElementById('rememberMe');
const gLoginButton = document.getElementById('gLogin');
const mLoginButton = document.getElementById('mLogin');

// Password visibility toggle
passwordToggle.addEventListener('click', function() {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordToggle.textContent = '🔒';
    } else {
        passwordInput.type = 'password';
        passwordToggle.textContent = '👁';
    }
});

// Call on a page load
document.addEventListener('DOMContentLoaded', () => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberMeCheckbox.checked = true;
    }
});

// Login function
function login(e) {
    if (e) e.preventDefault();

    // Basic validation
    if (!emailInput.value || !passwordInput.value) {
        showError('Please enter both email and password');
        return;
    }

    // Show loading state
    loginButton.disabled = true;
    loginButton.classList.add('loading');

    // Remember me functionality
    if (rememberMeCheckbox.checked) {
        localStorage.setItem('rememberedEmail', emailInput.value);
    } else {
        localStorage.removeItem('rememberedEmail');
    }

    signInWithEmailAndPassword(auth ,emailInput.value, passwordInput.value)
        .then(() => {
            console.log("auth is a sucess")
            window.location.href = "/home"
        })
        .catch((e) => {
            console.error(e);
            showError(e);
            loginButton.classList.remove('loading')
        })

}

function gLogin(e){
    if (e) e.preventDefault();

    // Show loading state
    loginButton.disabled = true;
    loginButton.classList.add('loading');

    // set up provider
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
        login_hint: emailInput.value || "user@gmail.com"
    })

    // login with redirect
    signInWithRedirect(auth, provider)
        .then(_ => {
            console.log("gAuth is a sucess")
            window.location.href = "/home";
        }
        )
        .catch((e) => {
            console.error(e);
            showError(e);
            loginButton.classList.remove('loading')
        })

}

function mLogin(e){
    if (e) e.preventDefault();
    console.log("mLogin")
}

// Event listeners
loginForm.addEventListener('submit', login);
gLoginButton.addEventListener('click', gLogin);
mLoginButton.addEventListener('click', mLogin)

// Add shake animation
document.head.insertAdjacentHTML('beforeend', `
      <style>
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      </style>
    `);

// Input field focus effects
const inputs = document.querySelectorAll('.form-control');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
});

// Reset error when typing
emailInput.addEventListener('input', () => {
    errorElement.classList.remove('show');
});

passwordInput.addEventListener('input', () => {
    errorElement.classList.remove('show');
});