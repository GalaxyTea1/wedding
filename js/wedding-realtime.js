import { db, ref, push, onChildAdded } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Wedding Realtime Initialized");

    // 1. Listen for Notifications (Toasts)
    const notificationsRef = ref(db, 'notifications');
    const pageLoadTime = Date.now();

    onChildAdded(notificationsRef, (snapshot) => {
        const data = snapshot.val();
        if (data.timestamp > pageLoadTime) {
            showToast(data.message);
        }
    });

    // 2. Send Wish Logic
    const btnSendWish = document.getElementById('btn-send-wish');
    const inputName = document.getElementById('wish-name');
    const inputMessage = document.getElementById('wish-message');

    if (btnSendWish) {
        btnSendWish.addEventListener('click', (e) => {
            e.preventDefault(); 

            const name = inputName.value.trim();
            const message = inputMessage.value.trim();

            if (!name || !message) {
                alert('Please enter both your name and a message.');
                return;
            }

            const wishesRef = ref(db, 'wishes');
            push(wishesRef, {
                name: name,
                message: message,
                timestamp: Date.now()
            }).then(() => {
                alert('Thank you for your wish!');
                inputName.value = '';
                inputMessage.value = '';
            }).catch((error) => {
                console.error("Error sending wish: ", error);
                alert('Failed to send wish. Please try again.');
            });
        });
    }
});

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerText = message;

    container.appendChild(toast);

    // Remove after 5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}
