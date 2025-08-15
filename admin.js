const emailEl = document.getElementById('email');
const passEl = document.getElementById('password');
const msgEl = document.getElementById('msg');

function setMsg(text, ok=false) {
  msgEl.textContent = text;
  msgEl.className = ok ? 'ok' : 'err';
}

document.getElementById('signup').addEventListener('click', async () => {
  try {
    const cred = await auth.createUserWithEmailAndPassword(emailEl.value, passEl.value);
    // IMPORTANT: In Firestore console, create:
    //   admins/{cred.user.uid}  with field: isAdmin: true (boolean)
    setMsg('Signed up. Now add this UID to "admins" with isAdmin=true: ' + cred.user.uid, true);
  } catch (e) {
    setMsg(e.message);
  }
});

document.getElementById('signin').addEventListener('click', async () => {
  try {
    const cred = await auth.signInWithEmailAndPassword(emailEl.value, passEl.value);
    // Check admin flag in Firestore
    const snap = await db.collection('admins').doc(cred.user.uid).get();
    if (!snap.exists || snap.data().isAdmin !== true) {
      await auth.signOut();
      setMsg('You are not an admin. Add your UID to admins/{uid} with isAdmin=true.');
      return;
    }
    setMsg('Welcome, admin! Redirecting…', true);
    window.location.href = 'makecontest.html';
  } catch (e) {
    setMsg(e.message);
  }
});