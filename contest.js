const countdownEl = document.getElementById('countdown');  
const resultEl = document.getElementById('result');  
const nameEl = document.getElementById('contestName');  
const descEl = document.getElementById('contestDesc');  
const joinBtn = document.getElementById('joinBtn');
const guessSection = document.getElementById('guessSection');
const guessInput = document.getElementById('guessInput');
const submitGuessBtn = document.getElementById('submitGuess');
const submitStatus = document.getElementById('submitStatus');
const guessesList = document.getElementById('guessesList');
const viewGuessesBtn = document.getElementById('viewGuessesBtn');
const deleteGuessesBtn = document.getElementById('deleteGuessesBtn');
const rankingDiv = document.getElementById('ranking');
const backAdminBtn = document.getElementById('backAdminBtn');
const backUserBtn = document.getElementById('backUserBtn');

let timer = null;
let currentUser = null;
let contestId = 'current';
let guessesVisible = false;
let isAdmin = false;
let currentSecret = null;

// Auth state
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert('Please login to join the contest.');
    window.location.href = 'index.html';
    return;
  }
  currentUser = user;

  // Check if current user is admin
  try {
    const adminDoc = await db.collection('admins').doc(user.uid).get();
    if (adminDoc.exists && adminDoc.data().isAdmin) {
      isAdmin = true;
      deleteGuessesBtn.style.display = 'inline-block';
      backAdminBtn.style.display = 'inline-block';
    } else {
      backUserBtn.style.display = 'inline-block';
    }
  } catch (e) {
    console.error('Error checking admin:', e);
    backUserBtn.style.display = 'inline-block';
  }
});

// Back button clicks
backAdminBtn.addEventListener('click', () => {
  window.location.href = 'makecontest.html';
});
backUserBtn.addEventListener('click', () => {
  window.location.href = 'homepage.html';
});

// Timer
function startTimer(endTime, secret) {
  currentSecret = secret;
  if (timer) clearInterval(timer);

  async function tick() {
    const now = Date.now();
    const remainingMs = endTime - now;

    if (remainingMs > 0) {
      const totalSeconds = Math.ceil(remainingMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      countdownEl.textContent = `Time left: ${hours}h ${minutes}m ${seconds}s`;
      resultEl.textContent = '';
    } else {
      clearInterval(timer);
      countdownEl.textContent = "Time's up!";
      resultEl.textContent = `Secret number: ${secret}`;
      showRankingAfterSecret();

      // Mark contest finished
      const contestRef = db.collection('contests').doc(contestId);
      const contestSnap = await contestRef.get();
      if (contestSnap.exists && !contestSnap.data().finished) {
        await contestRef.update({ finished: true });
      }
    }
  }

  tick();
  timer = setInterval(tick, 250);
}

// Function to get username from users collection
async function getUsername(uid) {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists && userDoc.data().username) return userDoc.data().username;
    return currentUser.email;
  } catch {
    return currentUser.email;
  }
}

// Load contest and live guesses
db.collection('contests').doc(contestId).onSnapshot(async (doc) => {
  if (!doc.exists) {
    countdownEl.textContent = 'No contest running right now.';
    resultEl.textContent = '';
    nameEl.textContent = '';
    descEl.textContent = '';
    guessesList.innerHTML = '';
    rankingDiv.innerHTML = '';
    rankingDiv.style.display = 'none';
    return;
  }

  const data = doc.data();

  if (!data.endTime || !data.secretNumber) {
    countdownEl.textContent = 'Invalid contest data.';
    resultEl.textContent = '';
    return;
  }

  nameEl.textContent = data.contestName || '';
  descEl.textContent = data.description || '';

  if (data.finished) {
    countdownEl.textContent = "Time's up!";
    resultEl.textContent = `Secret number: ${data.secretNumber}`;
    currentSecret = data.secretNumber;
    showRankingAfterSecret();
  } else {
    startTimer(data.endTime, data.secretNumber);
  }

  // Live guesses
  db.collection('contests').doc(contestId).collection('guesses')
    .orderBy('createdAt', 'asc')
    .onSnapshot((snap) => {
      guessesList.innerHTML = '';
      snap.forEach((g) => {
        const gData = g.data();
        const div = document.createElement('div');
        div.classList.add('guessCard');
        const time = gData.createdAt ? gData.createdAt.toDate().toLocaleTimeString() : '';
        div.innerHTML = `<span class="guessUsername">${gData.username}</span>:  
                         <span class="guessNumber">${gData.guess}</span>  
                         <span class="guessTime">${time}</span>`;
        guessesList.appendChild(div);
      });
    });
});

// Join button
joinBtn.addEventListener('click', () => {
  guessSection.style.display = 'block';
  joinBtn.disabled = true;
});

// Submit guess
submitGuessBtn.addEventListener('click', async () => {
  const val = parseInt(guessInput.value, 10);
  if (Number.isNaN(val)) {
    submitStatus.textContent = 'Enter a valid number!';
    return;
  }

  submitStatus.textContent = 'Submitting guess...';
  submitGuessBtn.disabled = true;

  try {
    const username = await getUsername(currentUser.uid);
    await db.collection('contests').doc(contestId).collection('guesses').add({
      username: username,
      guess: val,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    submitStatus.textContent = 'Guess submitted!';  
    guessInput.value = '';
  } catch (e) {
    submitStatus.textContent = 'Error: ' + e.message;
  } finally {
    submitGuessBtn.disabled = false;
  }
});

// View guesses toggle
viewGuessesBtn.addEventListener('click', () => {
  guessesVisible = !guessesVisible;
  guessesList.style.display = guessesVisible ? 'block' : 'none';
  viewGuessesBtn.textContent = guessesVisible ? 'Hide All Guesses' : 'View All Guesses';
});

// Delete all guesses (admin only)
deleteGuessesBtn.addEventListener('click', async () => {
  if (!isAdmin) return;
  if (!confirm('Are you sure you want to delete all guesses?')) return;

  try {
    const guessesRef = db.collection('contests').doc(contestId).collection('guesses');
    const snapshot = await guessesRef.get();
    for (const doc of snapshot.docs) await guessesRef.doc(doc.id).delete();
    alert('All guesses deleted successfully.');
  } catch (e) {
    alert('Error deleting guesses: ' + e.message);
  }
});

// Show ranking after secret number reveal
async function showRankingAfterSecret() {
  if (!currentSecret) return;

  const guessesSnap = await db.collection('contests').doc(contestId).collection('guesses').get();
  const guesses = guessesSnap.docs.map(d => d.data());
  if (!guesses.length) {
    rankingDiv.innerHTML = '<p>No guesses submitted.</p>';
    rankingDiv.style.display = 'block';
    return;
  }

  const sorted = guesses.slice().sort((a,b) => Math.abs(a.guess - currentSecret) - Math.abs(b.guess - currentSecret));
  rankingDiv.innerHTML = '';

  sorted.forEach((g,index) => {
    const div = document.createElement('div');
    div.classList.add('rankItem');
    let prize = '';
    if(index === 0) prize = '1 Zem';
    else if(index >= 1 && index <= 4) prize = '0.5 Zem';
    div.innerHTML = `<strong>${index+1}${index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'}</strong> - ${g.username}: ${g.guess} ${prize ? '- ' + prize : ''}`;
    if(index <= 4) div.classList.add('winner');
    rankingDiv.appendChild(div);
  });

  rankingDiv.style.display = 'block';
}