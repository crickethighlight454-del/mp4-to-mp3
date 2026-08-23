/**
 * SaveLocation — remembers where converted files should be saved.
 *
 * On browsers that support the File System Access API (Chrome / Edge,
 * desktop and Android — including installed PWAs), a person can pick a
 * folder once. The handle is stored in IndexedDB, so every future
 * download is written straight into that folder with no repeated
 * "Save As" dialog. On browsers without support (Safari, Firefox), or
 * before a folder has been chosen, files fall back to a normal browser
 * download.
 */
(function () {
  const DB_NAME = 'toolbox-settings';
  const STORE = 'handles';
  const KEY = 'downloadDir';

  function idbOpen() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbGet(key) {
    const db = await idbOpen();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const rq = tx.objectStore(STORE).get(key);
      rq.onsuccess = () => resolve(rq.result || null);
      rq.onerror = () => reject(rq.error);
    });
  }

  async function idbSet(key, value) {
    const db = await idbOpen();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function idbDel(key) {
    const db = await idbOpen();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function isSupported() {
    return typeof window.showDirectoryPicker === 'function';
  }

  // Checks (and if needed, re-requests) readwrite permission on a stored
  // handle. requestPermission() only resolves without an extra prompt when
  // called from a user gesture — callers that need a guaranteed prompt
  // should call this from inside a click handler.
  async function ensurePermission(handle, mode) {
    const opts = { mode: mode || 'readwrite' };
    try {
      if ((await handle.queryPermission(opts)) === 'granted') return true;
      if ((await handle.requestPermission(opts)) === 'granted') return true;
    } catch (e) { /* not called from a user gesture, or handle is stale */ }
    return false;
  }

  async function getSavedHandle() {
    if (!isSupported()) return null;
    try {
      const handle = await idbGet(KEY);
      if (!handle) return null;
      const ok = await ensurePermission(handle);
      return ok ? handle : null;
    } catch (e) {
      return null;
    }
  }

  // Returns the folder name without re-requesting permission (safe to call
  // outside a user gesture, e.g. on page load, for display purposes only).
  async function getFolderNameQuiet() {
    if (!isSupported()) return null;
    try {
      const handle = await idbGet(KEY);
      return handle ? handle.name : null;
    } catch (e) {
      return null;
    }
  }

  // Must be called from a user gesture (button click).
  async function chooseFolder() {
    if (!isSupported()) throw new Error('File System Access API not supported in this browser');
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
    await idbSet(KEY, handle);
    return handle;
  }

  async function clearFolder() {
    await idbDel(KEY);
  }

  async function writeToHandle(handle, name, blob) {
    const fileHandle = await handle.getFileHandle(name, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  }

  function downloadViaAnchor(name, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  // Saves one file. Returns 'folder' when it was written straight into the
  // saved folder, or 'download' when it fell back to a normal download.
  async function saveBlob(name, blob) {
    const handle = await getSavedHandle();
    if (handle) {
      try {
        await writeToHandle(handle, name, blob);
        return 'folder';
      } catch (e) {
        console.warn('SaveLocation: folder write failed, falling back to download', e);
      }
    }
    downloadViaAnchor(name, blob);
    return 'download';
  }

  async function saveBlobs(files) {
    const results = [];
    for (const f of files) results.push(await saveBlob(f.name, f.blob));
    return results;
  }

  window.SaveLocation = {
    isSupported,
    getSavedHandle,
    getFolderNameQuiet,
    chooseFolder,
    clearFolder,
    saveBlob,
    saveBlobs
  };
})();
