import auth from '../js/auth.js';
import {onAuthStateChanged, signOut} from "firebase/auth";

// DOM elements
const welcomeName = document.getElementById('welcomeName');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const userAvatar = document.getElementById('userAvatar');
const currentDate = document.getElementById('currentDate');
const toggleSidebar = document.getElementById('toggleSidebar');

// Set current date
const now = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
currentDate.textContent = now.toLocaleDateString('en-US', options);

// Auth state change listener
onAuthStateChanged(auth, user => {
    if (user) {
        // User is signed in
        const displayName = user.displayName || 'User';
        const email = user.email || 'No email provided';
        const firstLetter = (displayName[0] || 'U').toUpperCase();

        // Update UI elements
        welcomeName.textContent = displayName;
        userName.textContent = displayName;
        userEmail.textContent = email;
        userAvatar.textContent = firstLetter;
    } else {
        // No user is signed in, redirect to login page
        window.location.href = "login.html";
    }
});

// Logout function
function logout() {
    signOut(auth).then(() => {
        // Sign-out successful, redirect to login page
        window.location.href = "login.html";
    }).catch((error) => {
        // An error happened during sign out
        console.error("Logout error:", error);
        alert("Error during logout. Please try again.");
    });
}

// Toggle sidebar on mobile
toggleSidebar.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-collapsed');
});

// Handle menu item clicks
const menuItems = document.querySelectorAll('.menu-item');
menuItems.forEach(item => {
    item.addEventListener('click', function() {
        // Remove active class from all menu items
        menuItems.forEach(i => i.classList.remove('active'));
        // Add active class to clicked item
        this.classList.add('active');
    });
});

document.getElementById('logoutButton').addEventListener('click', logout);