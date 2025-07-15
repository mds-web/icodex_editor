const DB_NAME = "Editor_code8", PROJECT_STORE_NAME = "projects"
const DB_VERSION = 22
const TREE_STORE_NAME = "Tree"
const APP_SETTINGS_NAME = "Preferences-settings";

export function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 22);
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            db.objectStoreNames.contains("projects") || (db.createObjectStore("projects", {
                keyPath: "id",
                autoIncrement: !0
            }), db.objectStoreNames.contains("fileContents") || db.createObjectStore("fileContents", {
                keyPath: "path"
            }), db.objectStoreNames.contains(APP_SETTINGS_NAME) || db.createObjectStore(APP_SETTINGS_NAME, {
                keyPath: "user_settings",
                autoIncrement: !0
            }), console.log("IndexedDB: Object store 'projects' dibuat atau di-upgrade."));
        }, request.onsuccess = () => resolve(request.result), request.onerror = () => reject(request.error);
    });
}

export async function getAllProjects() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const request = db.transaction("projects", "readonly").objectStore("projects").getAll();
        request.onsuccess = () => resolve(request.result), request.onerror = () => reject(request.error);
    });
}

export async function addProject(project) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("projects", "readwrite"), request = tx.objectStore("projects").add(project);
        request.onsuccess = () => resolve(request.result), request.onerror = () => reject(request.error), 
        tx.oncomplete = () => console.log("IndexedDB: Transaksi addProject selesai."), tx.onerror = () => reject(tx.error);
    });
}

export async function addPreferences(object) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(APP_SETTINGS_NAME, "readwrite"), request = tx.objectStore(APP_SETTINGS_NAME).add({
            language: "en",
            theme: "github_dark",
            background: "System",
            textSize: "16px",
            nightMode: !1,
            autocomplete: !1,
            showHints: !1,
            cursorStyle: "ace",
            editorFontSize: "14px",
            editorFontWeight: "normal"
        });
        request.onsuccess = () => resolve(request.result), request.onerror = () => reject(request.error), 
        tx.oncomplete = () => console.log("IndexedDB: Transaksi addPreferences selesai."), 
        tx.onerror = () => reject(tx.error);
    });
}


export async function updateProject(project) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("projects", "readwrite"), request = tx.objectStore("projects").put(project);
        request.onsuccess = () => resolve(), request.onerror = () => reject(request.error), 
        tx.oncomplete = () => console.log("IndexedDB: Transaksi updateProject selesai."), 
        tx.onerror = () => reject(tx.error);
    });
}

export class FileContentStorage {
	static async saveContent(path, contentUint8Array) {
		const db = await openDb();
		return new Promise((resolve, reject) => {
			const request = db.transaction("fileContents", "readwrite")
				.objectStore("fileContents").put({ path, content: contentUint8Array });
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	static async getContent(path) {
		const db = await openDb();
		return new Promise((resolve, reject) => {
			const request = db.transaction("fileContents", "readonly")
				.objectStore("fileContents").get(path);
			request.onsuccess = () => {
				resolve(request.result?.content || new Uint8Array());
			};
			request.onerror = () => reject(request.error);
		});
	}

	static async deleteContent(path) {
		const db = await openDb();
		return new Promise((resolve, reject) => {
			const request = db.transaction("fileContents", "readwrite")
				.objectStore("fileContents").delete(path);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}
}
