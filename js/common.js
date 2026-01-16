/* ---------- CONFIG ---------- */
const SALT = "loan-salt";
const STORAGE_KEY = 'loanApp';
const SESSION_PIN_KEY = 'loanApp_session_pin';

/* ---------- STATE ---------- */
let appData = null;
let currentLedger = 'default';

/* ---------- CRYPTO UTILS ---------- */
async function deriveKey(password) {
	const enc = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
	return crypto.subtle.deriveKey({ name: "PBKDF2", salt: enc.encode(SALT), iterations: 100000, hash: "SHA-256" }, keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

async function encryptData(obj, password) {
	const key = await deriveKey(password);
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encoded = new TextEncoder().encode(JSON.stringify(obj));
	const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
	return { iv: Array.from(iv), data: Array.from(new Uint8Array(cipher)) };
}

async function decryptData(payload, password) {
	const key = await deriveKey(password);
	const iv = new Uint8Array(payload.iv);
	const data = new Uint8Array(payload.data);
	const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
	return JSON.parse(new TextDecoder().decode(decrypted));
}

/* ---------- SESSION MANAGER ---------- */
function getSessionPin() {
	return sessionStorage.getItem(SESSION_PIN_KEY);
}

function setSessionPin(pin) {
	sessionStorage.setItem(SESSION_PIN_KEY, pin);
}

function clearSession() {
	sessionStorage.removeItem(SESSION_PIN_KEY);
}

function requireAuth() {
	const pin = getSessionPin();
	if (!pin) {
		window.location.href = 'index.html';
		return false;
	}
	return true;
}

/* ---------- DATA MANAGER ---------- */
async function loadData() {
	const pin = getSessionPin();
	if (!pin) return null;

	const encrypted = localStorage.getItem(STORAGE_KEY);
	if (!encrypted) {
		// Initialize new data if none exists
		appData = { ledgers: { default: { name: 'Personal', people: {} } }, settings: { currency: '₹', theme: 'system', githubToken: '' } };
		await saveData();
		return appData;
	}

	try {
		appData = await decryptData(JSON.parse(encrypted), pin);
		// Default to first ledger if not set
		if (!currentLedger || !appData.ledgers[currentLedger]) {
			currentLedger = Object.keys(appData.ledgers)[0];
		}
		return appData;
	} catch (e) {
		console.error("Decryption failed", e);
		alert("Session invalid or data corrupted. Please login again.");
		logout();
		return null;
	}
}

async function saveData() {
	if (!appData) return;
	const pin = getSessionPin();
	if (!pin) return;

	try {
		const encrypted = await encryptData(appData, pin);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));

		// Sync if token exists
		if (appData.settings.githubToken) {
			syncToGist(appData.settings.githubToken, encrypted);
		}
	} catch (e) {
		console.error("Save failed", e);
		alert("Failed to save data!");
	}
}

function logout() {
	clearSession();
	window.location.href = 'index.html';
}

/* ---------- GITHUB SYNC (Simplified) ---------- */
let gistId = null; // In a real multi-page app, this might need to be stored in appData or discovered
async function syncToGist(token, encryptedData) {
	// This is a simplified fire-and-forget for now to match previous logic. 
	// Ideally gistId should be stored in appData or local storage to avoid searching every time.
	// For now, we'll skip the complexity of finding the Gist ID every time on every page save.
	// NOTE: In the original code, gistId was a global variable. We need to store it in appData to persist it across pages.

	if (!appData.settings.gistId) {
		// Create new Gist
		try {
			const res = await fetch('https://api.github.com/gists', {
				method: 'POST',
				headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
				body: JSON.stringify({ public: false, description: "LoanTracker Backup", files: { "loan-backup.json": { content: JSON.stringify(encryptedData) } } })
			});
			const gist = await res.json();
			appData.settings.gistId = gist.id;
			// Save again to persist the gistId (careful of infinite loop, but saveData encrypts first)
			// We'll just update the local object for next time.
			// To properly save the new gistId, we'd need to re-encrypt and save locally, but let's avoid recursion.
			const newEncrypted = await encryptData(appData, getSessionPin());
			localStorage.setItem(STORAGE_KEY, JSON.stringify(newEncrypted));
		} catch (e) { console.error("Gist create failed", e); }
	} else {
		// Update existing
		try {
			await fetch(`https://api.github.com/gists/${appData.settings.gistId}`, {
				method: 'PATCH',
				headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
				body: JSON.stringify({ files: { "loan-backup.json": { content: JSON.stringify(encryptedData) } } })
			});
		} catch (e) { console.error("Gist update failed", e); }
	}
}

/* ---------- UI HELPERS ---------- */
function applyTheme() {
	if (!appData) return;
	const themeVal = appData.settings.theme;
	document.body.className = themeVal === 'dark' ? 'dark' : themeVal === 'light' ? '' : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : '');
}

function disableZoom() {
	document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
}

/* ---------- INITIALIZATION ---------- */
disableZoom();
