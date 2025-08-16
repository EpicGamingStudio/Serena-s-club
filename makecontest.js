const statusEl = document.getElementById('status');
const secretEl = document.getElementById('secretNumber');
const nameEl = document.getElementById('contestName');
const descEl = document.getElementById('contestDesc');
const createBtn = document.getElementById('create');
const logoutBtn = document.getElementById('logout');

function say(msg) { statusEl.textContent = msg; }

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = 'admin.html';
    return;
  }
  // Ensure this user is an admin
  const adminDoc = await db.collection('admins').doc(user.uid).get();
  if (!adminDoc.exists || adminDoc.data().isAdmin !== true) {
    await auth.signOut();
    window.location.href = 'admin.html';
  }
});

createBtn.addEventListener('click', async () => {
  const val = parseInt(secretEl.value, 10);
  const name = nameEl.value.trim();
  const desc = descEl.value.trim();

  if (!name) {
    say('Enter a contest name');
    return;
  }
  if (!desc) {
    say('Enter a contest description');
    return;
  }
  if (Number.isNaN(val)) {
    say('Enter a valid secret number');
    return;
  }

  try {
    // 24 hours from now
    const endTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours in ms

    // Fixed doc id "current"
    await db.collection('contests').doc('current').set({
      contestName: name,
      description: desc,
      secretNumber: val,
      endTime,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: auth.currentUser.uid
    });

    say('Contest created successfully!');
    secretEl.value = '';
    nameEl.value = '';
    descEl.value = '';
  } catch (e) {
    console.error(e);
    say('Error creating contest: ' + e.message);
  }
});

logoutBtn.addEventListener('click', async () => {
  await auth.signOut();
  window.location.href = 'admin.html';
});

// Send Zems button
document.getElementById("sendZems").addEventListener("click", () => {
  window.location.href = "addzems.html";
});

// Logout button
document.getElementById("logout").addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
});