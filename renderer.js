let currentRemoteOrbitaUrl = '';
let currentRunningProfileId = '';
let currentRunningProfileName = '';
let isBusy = false;
let cachedFolders = [];

function saveToken() {
  const token = document.getElementById('token').value.trim();
  localStorage.setItem('gologin_token', token);
}

function loadSavedToken() {
  const savedToken = localStorage.getItem('gologin_token');
  if (savedToken) {
    document.getElementById('token').value = savedToken;
  }
}

function getToken() {
  const token = document.getElementById('token').value.trim();
  saveToken();
  return token;
}

function setResult(message) {
  document.getElementById('result').innerText = message;
}

function setBusy(value) {
  isBusy = value;

  const ids = ['loadBtn', 'createFolderBtn', 'createProfileBtn'];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = value;
  });

  const buttons = document.querySelectorAll('.run-btn, .stop-btn, .move-btn, .rename-btn');
  buttons.forEach((btn) => {
    btn.disabled = value;
  });
}

function renderFolders(folders) {
  const folderList = document.getElementById('folderList');
  const folderSelect = document.getElementById('folderSelect');

  folderList.innerHTML = '';
  folderSelect.innerHTML = '<option value="">Không chọn folder</option>';

  if (!Array.isArray(folders) || folders.length === 0) {
    folderList.innerText = 'Chưa có folder nào';
    return;
  }

  folders.forEach((folder) => {
    const row = document.createElement('div');
    row.className = 'folder-row';
    row.innerText = folder.name || 'Folder không tên';
    folderList.appendChild(row);

    const option = document.createElement('option');
    option.value = folder.name || '';
    option.innerText = folder.name || 'Folder không tên';
    folderSelect.appendChild(option);
  });
}

async function loadFolders() {
  const token = getToken();

  if (isBusy) return;

  if (!token) {
    setResult('Bạn chưa nhập token');
    return;
  }

  setBusy(true);
  setResult('Đang tải folder...');

  try {
    const response = await fetch('https://api.gologin.com/folders', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      setResult(`Không lấy được folder. Mã lỗi: ${response.status}`);
      return;
    }

    const data = await response.json();
    const folders = Array.isArray(data) ? data : [];

    cachedFolders = folders;
    renderFolders(folders);
    setResult(`Tải thành công ${folders.length} folder`);
  } catch (error) {
    setResult(`Có lỗi khi tải folder: ${error.message}`);
  } finally {
    setBusy(false);
  }
}

async function createFolder() {
  const token = getToken();
  const folderName = document.getElementById('newFolderName').value.trim();

  if (isBusy) return;

  if (!token) {
    setResult('Bạn chưa nhập token');
    return;
  }

  if (!folderName) {
    setResult('Bạn chưa nhập tên folder');
    return;
  }

  setBusy(true);
  setResult(`Đang tạo folder: ${folderName}...`);

  try {
    const response = await fetch('https://api.gologin.com/folders/folder', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName
      })
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      setResult(
        `Tạo folder thất bại. Mã lỗi: ${response.status} | ${
          data ? JSON.stringify(data) : 'Không có response body'
        }`
      );
      return;
    }

    document.getElementById('newFolderName').value = '';
    setResult(`Đã tạo folder: ${folderName}`);
    await loadFolders();
  } catch (error) {
    setResult(`Có lỗi khi tạo folder: ${error.message}`);
  } finally {
    setBusy(false);
  }
}

async function createProfile() {
  const token = getToken();
  const profileName = document.getElementById('newProfileName').value.trim();
  const folderName = document.getElementById('folderSelect').value;

  if (isBusy) return;

  if (!token) {
    setResult('Bạn chưa nhập token');
    return;
  }

  if (!profileName) {
    setResult('Bạn chưa nhập tên profile');
    return;
  }

  setBusy(true);
  setResult(`Đang tạo profile: ${profileName}...`);

  try {
    const payload = {
      name: profileName,
      os: 'win',
      osSpec: 'win11'
    };

    if (folderName) {
      payload.folderName = folderName;
    }

    const response = await fetch('https://api.gologin.com/browser/custom', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      setResult(
        `Tạo profile thất bại. Mã lỗi: ${response.status} | ${
          data ? JSON.stringify(data) : 'Không có response body'
        }`
      );
      return;
    }

    document.getElementById('newProfileName').value = '';
    setResult(`Đã tạo profile: ${profileName}`);
    await loadProfiles();
  } catch (error) {
    setResult(`Có lỗi khi tạo profile: ${error.message}`);
  } finally {
    setBusy(false);
  }
}

async function moveProfileToFolder(profileId, profileName, oldFolderName, newFolderName) {
  const token = getToken();

  if (isBusy) return;

  if (!token) {
    setResult('Bạn chưa nhập token');
    return;
  }

  if (!newFolderName) {
    setResult('Bạn chưa chọn folder mới');
    return;
  }

  if (oldFolderName === newFolderName) {
    setResult('Profile đã ở sẵn trong folder này');
    return;
  }

  setBusy(true);
  setResult(`Đang chuyển profile ${profileName} sang folder ${newFolderName}...`);

  try {
    if (oldFolderName) {
      const removeResponse = await fetch('https://api.gologin.com/folders/folder', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: oldFolderName,
          profiles: [profileId],
          action: 'remove'
        })
      });

      if (!removeResponse.ok) {
        let removeData = null;
        try {
          removeData = await removeResponse.json();
        } catch {
          removeData = null;
        }

        setResult(
          `Xóa khỏi folder cũ thất bại. Mã lỗi: ${removeResponse.status} | ${
            removeData ? JSON.stringify(removeData) : 'Không có response body'
          }`
        );
        return;
      }
    }

    const addResponse = await fetch('https://api.gologin.com/folders/folder', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: newFolderName,
        profiles: [profileId],
        action: 'add'
      })
    });

    let addData = null;
    try {
      addData = await addResponse.json();
    } catch {
      addData = null;
    }

    if (!addResponse.ok) {
      setResult(
        `Thêm vào folder mới thất bại. Mã lỗi: ${addResponse.status} | ${
          addData ? JSON.stringify(addData) : 'Không có response body'
        }`
      );
      return;
    }

    setResult(`Đã chuyển profile ${profileName} sang folder ${newFolderName}`);
    await loadProfiles();
  } catch (error) {
    setResult(`Có lỗi khi chuyển folder: ${error.message}`);
  } finally {
    setBusy(false);
  }
}

async function renameProfile(profileId, oldName, newName) {
  const token = getToken();
  const trimmedName = (newName || '').trim();

  if (isBusy) return;

  if (!token) {
    setResult('Bạn chưa nhập token');
    return;
  }

  if (!trimmedName) {
    setResult('Bạn chưa nhập tên profile mới');
    return;
  }

  if (oldName === trimmedName) {
    setResult('Tên mới đang giống tên cũ');
    return;
  }

  setBusy(true);
  setResult(`Đang đổi tên profile ${oldName}...`);

  try {
    const response = await fetch('https://api.gologin.com/browser/name/many', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        {
          profileId: profileId,
          name: trimmedName
        }
      ])
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      setResult(
        `Đổi tên profile thất bại. Mã lỗi: ${response.status} | ${
          data ? JSON.stringify(data) : 'Không có response body'
        }`
      );
      return;
    }

    setResult(`Đã đổi tên profile từ "${oldName}" thành "${trimmedName}"`);
    await loadProfiles();
  } catch (error) {
    setResult(`Có lỗi khi đổi tên profile: ${error.message}`);
  } finally {
    setBusy(false);
  }
}

function createFolderSelectForProfile(currentFolderName) {
  const folderSelect = document.createElement('select');
  folderSelect.style.marginLeft = '8px';

  const emptyOption = document.createElement('option');
  emptyOption.value = '';
  emptyOption.innerText = 'Chọn folder';
  folderSelect.appendChild(emptyOption);

  cachedFolders.forEach((folder) => {
    const option = document.createElement('option');
    option.value = folder.name || '';
    option.innerText = folder.name || 'Folder không tên';

    if ((currentFolderName || '') === (folder.name || '')) {
      option.selected = true;
    }

    folderSelect.appendChild(option);
  });

  return folderSelect;
}

function createRenameInput() {
  const renameInput = document.createElement('input');
  renameInput.placeholder = 'Tên mới';
  renameInput.style.marginLeft = '8px';
  renameInput.style.width = '160px';
  return renameInput;
}

function renderProfiles(profiles) {
  const profileList = document.getElementById('profileList');
  profileList.innerHTML = '';

  profiles.forEach((profile) => {
    const row = document.createElement('div');
    row.className = 'profile-row';

    const text = document.createElement('span');
    const folderText = profile.folderName ? ` | Folder: ${profile.folderName}` : '';
    text.innerText = `${profile.name || 'Không tên'} - ID: ${profile.id || 'Không có ID'}${folderText} `;

    const runButton = document.createElement('button');
    runButton.innerText = 'Run';
    runButton.className = 'run-btn';
    runButton.onclick = () => runProfile(profile.id, profile.name || '', runButton);

    const stopButton = document.createElement('button');
    stopButton.innerText = 'Stop';
    stopButton.className = 'stop-btn';
    stopButton.onclick = () => stopProfile(profile.id, profile.name || '', stopButton);

    const folderSelect = createFolderSelectForProfile(profile.folderName || '');

    const moveButton = document.createElement('button');
    moveButton.innerText = 'Chuyển folder';
    moveButton.className = 'move-btn';
    moveButton.onclick = () =>
      moveProfileToFolder(
        profile.id,
        profile.name || '',
        profile.folderName || '',
        folderSelect.value
      );

    const renameInput = createRenameInput();

    const renameButton = document.createElement('button');
    renameButton.innerText = 'Đổi tên';
    renameButton.className = 'rename-btn';
    renameButton.onclick = () =>
      renameProfile(
        profile.id,
        profile.name || '',
        renameInput.value
      );

    row.appendChild(text);
    row.appendChild(runButton);
    row.appendChild(stopButton);
    row.appendChild(folderSelect);
    row.appendChild(moveButton);
    row.appendChild(renameInput);
    row.appendChild(renameButton);

    profileList.appendChild(row);
  });
}

async function loadProfiles() {
  const token = getToken();

  if (isBusy) return;

  if (!token) {
    setResult('Bạn chưa nhập token');
    return;
  }

  setBusy(true);
  setResult('Đang tải danh sách profile...');

  try {
    const response = await fetch('https://api.gologin.com/browser/v2?page=1', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      setResult(`Không lấy được profile. Mã lỗi: ${response.status}`);
      return;
    }

    const data = await response.json();
    const profiles = data.profiles || [];

    if (!Array.isArray(profiles) || profiles.length === 0) {
      document.getElementById('profileList').innerHTML = '';
      setResult('Không có profile nào.');
      return;
    }

    renderProfiles(profiles);
    setResult(`Tải thành công ${profiles.length} profile.`);
  } catch (error) {
    setResult(`Có lỗi khi gọi API: ${error.message}`);
  } finally {
    setBusy(false);
  }
}

async function runProfile(profileId, profileName, clickedButton) {
  const token = getToken();
  const browserSection = document.getElementById('browserSection');
  const browserUrl = document.getElementById('browserUrl');

  if (isBusy) return;

  if (!token) {
    setResult('Bạn chưa nhập token');
    return;
  }

  const oldText = clickedButton.innerText;
  setBusy(true);
  clickedButton.innerText = 'Đang chạy...';
  setResult(`Đang chạy profile: ${profileName}...`);

  try {
    const response = await fetch(`https://api.gologin.com/browser/${profileId}/web`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      setResult(
        `Chạy profile thất bại. Mã lỗi: ${response.status} | ${
          data ? JSON.stringify(data) : 'Không có response body'
        }`
      );
      return;
    }

    currentRunningProfileId = profileId;
    currentRunningProfileName = profileName;
    currentRemoteOrbitaUrl = data?.remoteOrbitaUrl || '';

    setResult(`Đã chạy profile: ${profileName}`);

    if (currentRemoteOrbitaUrl) {
      browserSection.style.display = 'block';
      browserUrl.innerText = currentRemoteOrbitaUrl;
    }
  } catch (error) {
    setResult(`Có lỗi khi chạy profile: ${error.message}`);
  } finally {
    clickedButton.innerText = oldText;
    setBusy(false);
  }
}

async function stopProfile(profileId, profileName, clickedButton) {
  const token = getToken();
  const browserSection = document.getElementById('browserSection');
  const browserUrl = document.getElementById('browserUrl');

  if (isBusy) return;

  if (!token) {
    setResult('Bạn chưa nhập token');
    return;
  }

  const oldText = clickedButton.innerText;
  setBusy(true);
  clickedButton.innerText = 'Đang dừng...';
  setResult(`Đang dừng profile: ${profileName}...`);

  try {
    const response = await fetch(`https://api.gologin.com/browser/${profileId}/web`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      setResult(
        `Dừng profile thất bại. Mã lỗi: ${response.status} | ${
          data ? JSON.stringify(data) : 'Không có response body'
        }`
      );
      return;
    }

    if (currentRunningProfileId === profileId) {
      const { ipcRenderer } = require('electron');
      ipcRenderer.send('close-browser-window');

      currentRunningProfileId = '';
      currentRunningProfileName = '';
      currentRemoteOrbitaUrl = '';
      browserSection.style.display = 'none';
      browserUrl.innerText = '';
    }

    setResult(`Đã dừng profile: ${profileName}`);
  } catch (error) {
    setResult(`Có lỗi khi dừng profile: ${error.message}`);
  } finally {
    clickedButton.innerText = oldText;
    setBusy(false);
  }
}

function openBrowser() {
  if (!currentRemoteOrbitaUrl) {
    alert('Chưa có link browser');
    return;
  }

  const { ipcRenderer } = require('electron');
  ipcRenderer.send('open-browser-window', currentRemoteOrbitaUrl);
}

loadSavedToken();