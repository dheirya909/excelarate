import {auth} from '../js/app.js'
import {createUserWithEmailAndPassword, updateProfile} from 'firebase/auth'

// DOM elements
const registerForm = document.getElementById('registerForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const termsCheck = document.getElementById('termsCheck');
const registerButton = document.getElementById('registerButton');
const errorElement = document.getElementById('error');
const errorMessageElement = document.getElementById('errorMessage');
const passwordToggle = document.getElementById('passwordToggle');
const strengthSegments = [
    document.getElementById('segment1'),
    document.getElementById('segment2'),
    document.getElementById('segment3'),
    document.getElementById('segment4')
];
const strengthText = document.getElementById('strengthText');

// Password visibility toggle
passwordToggle.addEventListener('click', function() {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordToggle.textContent = '🔒';
    } else {
        passwordInput.type = 'password';
        passwordToggle.textContent = '👁️';
    }
});

// Password strength checker
passwordInput.addEventListener('input', function() {
    const password = this.value;
    let strength = 0;

    // Calculate password strength
    if (password.length >= 8) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^A-Za-z0-9]/)) strength += 1;
    // strength = 0 if password contains name, or vice versa
    let name = nameInput.value.toLowerCase();
    if (name && password.toLowerCase().includes(name)) {
        strength = 0;
    }


    // Update strength indicator
    strengthSegments.forEach((segment, index) => {
        segment.className = 'strength-segment';
        if (index < strength) {
            if (strength <= 2) {
                segment.classList.add('weak');
            } else if (strength === 3) {
                segment.classList.add('medium');
            } else {
                segment.classList.add('strong');
            }
        }
    });

    // Update strength text
    if (password.length === 0 || strength === 0) {
        strengthText.textContent = 'Password strength';
        strengthText.style.color = '#6c757d';
    } else if (strength <= 2) {
        strengthText.textContent = 'Weak';
        strengthText.style.color = '#e63946';
    } else if (strength === 3) {
        strengthText.textContent = 'Medium';
        strengthText.style.color = '#ffb703';
    } else {
        strengthText.textContent = 'Strong';
        strengthText.style.color = '#2a9d8f';
    }

    // Hide error if typing
    errorElement.classList.remove('show');
});

// Show error function
function showError(message) {
    errorMessageElement.textContent = message;
    errorElement.classList.add('show');

    // Add shake animation to the card
    const card = document.querySelector('.card');
    if (card) {
        card.style.animation = 'none';
        setTimeout(() => {
            card.style.animation = 'shake 0.5s ease-in-out';
        }, 10);
    }
}

// Register function
function register(e) {
    if (e) e.preventDefault();

    // Basic validation
    if (!nameInput.value || !emailInput.value || !passwordInput.value) {
        showError('Please fill in all fields');
        return;
    }

    if (!termsCheck.checked) {
        showError('Please agree to the Terms of Service');
        return;
    }

    // Password strength validation
    const password = passwordInput.value;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^A-Za-z0-9]/)) strength += 1;

    if (strength < 3) {
        showError('Please choose a stronger password');
        return;
    }

    // Show loading state
    registerButton.disabled = true;
    registerButton.classList.add('loading');

    // Firebase authentication
    createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
        .then(() => {
            updateProfile(auth.currentUser, {
                displayName: nameInput.value
            })
            })

        .then(() => {
            // Show progress
            const activeStep = document.querySelector('.step.active');
            if (activeStep && activeStep.classList) {
                activeStep.classList.remove('active');
                activeStep.classList.add('completed');
            }

            const steps = document.querySelectorAll('.step');
            if (steps && steps.length > 1 && steps[1] && steps[1].classList) {
                steps[1].classList.add('active');
            }

            // Redirect to home page after a slight delay for better UX
            setTimeout(() => {
                window.location.href = "home";
            }, 1000);
        })
        .catch(err => {
            // Show error message
            registerButton.disabled = false;
            registerButton.classList.remove('loading');

            let errorMessage;
            switch(err.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password should be at least 6 characters';
                    break;
                default:
                    errorMessage = err.message;
            }

            showError(errorMessage);
        });
}

// Event listeners
registerForm.addEventListener('submit', register);

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

// Input field focus effects - with null check
const inputs = document.querySelectorAll('.form-control');
if (inputs && inputs.length > 0) {
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('focus', function() {
                if (this.parentElement && this.parentElement.classList) {
                    this.parentElement.classList.add('focused');
                }
            });

            input.addEventListener('blur', function() {
                if (this.parentElement && this.parentElement.classList) {
                    this.parentElement.classList.remove('focused');
                }
            });
        }
    });
}

// Reset error when typing - with null checks
if (nameInput) {
    nameInput.addEventListener('input', () => {
        if (errorElement && errorElement.classList) {
            errorElement.classList.remove('show');
        }
    });
}

if (emailInput) {
    emailInput.addEventListener('input', () => {
        if (errorElement && errorElement.classList) {
            errorElement.classList.remove('show');
        }
    });
}

if (termsCheck) {
    termsCheck.addEventListener('change', () => {
        if (errorElement && errorElement.classList) {
            errorElement.classList.remove('show');
        }
    });
}