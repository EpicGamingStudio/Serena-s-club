// admin.js

const emailEl = document.getElementById('email');
const passEl = document.getElementById('password');
const msgEl = document.getElementById('msg');

function setMsg(text, ok = false) {
  msgEl.textContent = text;
  msgEl.className = ok ? 'ok' : 'err';
}

// Helper to format Firebase errors
function formatError(err) {
  if (err.code === "auth/wrong-password") return "Invalid password. Try again.";
  if (err.code === "auth/user-not-found") return "No account found with this email.";
  if (err.code === "auth/email-already-in-use") return "This email is already registered.";
  if (err.code === "auth/weak-password") return "Password should be at least 6 characters.";
  return "Something went wrong. Please try again.";
}

// Sign Up
document.getElementById('signup').addEventListener('click', async () => {
  try {
    const cred = await auth.createUserWithEmailAndPassword(emailEl.value, passEl.value);
    // IMPORTANT: Add this UID to Firestore admins collection with isAdmin: true
    setMsg('Signed up! Add this UID to Firestore admins collection with isAdmin=true: ' + cred.user.uid, true);
  } catch (e) {
    setMsg(formatError(e));
  }
});

// Sign In
document.getElementById('signin').addEventListener('click', async () => {
  try {
    const cred = await auth.signInWithEmailAndPassword(emailEl.value, passEl.value);
    const snap = await db.collection('admins').doc(cred.user.uid).get();

    if (!snap.exists || snap.data().isAdmin !== true) {
      await auth.signOut();
      setMsg('❌ Access denied. You are not an admin.');
      return;
    }

    setMsg('✅ Welcome, admin! Redirecting…', true);
    // Redirect after short delay
    setTimeout(() => {
      window.location.href = 'makecontest.html';
    }, 1500);

  } catch (e) {
    setMsg(formatError(e));
  }
});