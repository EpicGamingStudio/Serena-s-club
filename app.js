// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyB4i9lTMyuiTK44VsGRd5Y9Vcf_UQEdq0s",
    authDomain: "project-888ab.firebaseapp.com",
    projectId: "project-888ab",
    storageBucket: "project-888ab.firebasestorage.app",
    messagingSenderId: "228515265618",
    appId: "1:228515265618:web:a5da43da768f523a61338b"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Club Chat reference
const mixedChatRef = db.collection('general_chat'); 
let currentUser = null;

auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        // Moved the listener setup to the sendMessage function to avoid errors when elements are not visible
        const sendButton = document.getElementById('send-btn');
        if (sendButton) {
            sendButton.addEventListener('click', sendMessage);
        }
    } else {
        window.location.href = "index.html";
    }
});

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();
    if (messageText) {
        mixedChatRef.add({
            text: messageText,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            senderId: currentUser.uid,
            senderEmail: currentUser.email
        }).then(() => {
            messageInput.value = '';
        });
    }
}

function listenForMessages() {
    mixedChatRef.orderBy('timestamp').onSnapshot(snapshot => {
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const msg = document.createElement('div');
            msg.classList.add('message');
            msg.classList.add(data.senderId === currentUser.uid ? 'sent' : 'received');

            // Format the message to show the username (email)
            const senderName = data.senderEmail.split('@')[0]; // Use the part before '@' as the username
            const messageContent = `<span style="font-weight: bold;">${senderName}:</span> ${data.text}`;
            msg.innerHTML = messageContent;

            messagesDiv.appendChild(msg);
        });
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}
