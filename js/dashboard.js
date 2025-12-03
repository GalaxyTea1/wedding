import { db, ref, push, onChildAdded } from './firebase-config.js';

// Simple client-side auth (Not secure for production banking apps, but fine for a wedding dashboard)
const PIN = "1234";

document.addEventListener('DOMContentLoaded', () => {
    const loginOverlay = document.getElementById('login-overlay');
    const mainDashboard = document.getElementById('main-dashboard');
    const btnLogin = document.getElementById('btn-login');
    const inputPin = document.getElementById('admin-pin');

    // Login Logic
    btnLogin.addEventListener('click', () => {
        if (inputPin.value === PIN) {
            loginOverlay.style.display = 'none';
            mainDashboard.style.display = 'block';
            initDashboard();
        } else {
            alert('Incorrect PIN!');
        }
    });

    // Allow Enter key for login
    inputPin.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') btnLogin.click();
    });
});

function initDashboard() {
    console.log("Dashboard Initialized");

    // 1. Send Notification Logic
    const btnSend = document.getElementById('btn-send-notify');
    const txtMessage = document.getElementById('notify-message');

    btnSend.addEventListener('click', () => {
        const message = txtMessage.value.trim();
        if (!message) return;

        const notificationsRef = ref(db, 'notifications');
        push(notificationsRef, {
            message: message,
            timestamp: Date.now()
        }).then(() => {
            alert('Notification sent!');
            txtMessage.value = '';
        }).catch((error) => {
            console.error("Error sending notification: ", error);
            alert('Failed to send notification.');
        });
    });

    // 2. Listen for Wishes
    const wishesList = document.getElementById('dashboard-wishes-list');
    const wishesRef = ref(db, 'wishes');

    // Clear initial "Waiting..." text when first child is added
    let isFirstWish = true;

    onChildAdded(wishesRef, (snapshot) => {
        if (isFirstWish) {
            wishesList.innerHTML = '';
            isFirstWish = false;
        }

        const data = snapshot.val();
        const wishElement = createWishElement(data);
        wishesList.prepend(wishElement); // Add new wishes to the top
    });
}

function createWishElement(data) {
    const div = document.createElement('div');
    div.className = 'wish-item';
    div.innerHTML = `
        <span class="wish-name">${escapeHtml(data.name)}</span>
        <span class="wish-content">${escapeHtml(data.message)}</span>
        <div style="font-size: 12px; color: #999; margin-top: 5px;">
            ${new Date(data.timestamp).toLocaleTimeString()}
        </div>
    `;
    return div;
}

function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
