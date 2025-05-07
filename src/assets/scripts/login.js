import {auth, showError} from "../js/app.js";
import {signInWithEmailAndPassword} from "firebase/auth";

// DOM elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('loginButton');
const errorElement = document.getElementById('error');
const passwordToggle = document.getElementById('passwordToggle');
const rememberMeCheckbox = document.getElementById('rememberMe');

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

// Call on page load
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
// Event listeners
loginForm.addEventListener('submit', login);

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