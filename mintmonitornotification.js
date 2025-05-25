(function () {
  let volume = 0.3; // default volume
  const STORAGE_KEY = 'lastCoinNotifiedValue';

  // Pushover settings — replace these!
  const pushoverUserKey = 'uet9xuivey6rrfbga3uzt4s369yds6';
  const pushoverApiToken = 'a738p4osx4o5mnea6pbcadjfz3au3i';

  const playCoinSound = () => {
    const audio = new Audio('https://www.myinstants.com/media/sounds/coin.mp3');
    audio.volume = volume;
    audio.play();
  };

  const sendPushoverNotification = (value) => {
    const message = `💰 You can mint ${value} coin${value > 1 ? 's' : ''} now!`;
    fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      body: new URLSearchParams({
        token: pushoverApiToken,
        user: pushoverUserKey,
        message: message,
        title: 'Tribal Wars Mint Monitor',
        priority: '1'
      })
    }).then(res => {
      if (!res.ok) {
        console.error('Failed to send Pushover notification');
      }
    }).catch(console.error);
  };

  const updateMonitorStatus = (text, color) => {
    const monitorCell = document.getElementById('coinMonitorStatus');
    if (monitorCell) {
      monitorCell.textContent = text;
      monitorCell.style.color = color;
      monitorCell.style.backgroundColor = monitorCell.style.backgroundColor || 'transparent';
    }
  };

  const getLastNotifiedValue = () => {
    const val = localStorage.getItem(STORAGE_KEY);
    return val ? parseInt(val, 10) : 0;
  };

  const setLastNotifiedValue = (val) => {
    localStorage.setItem(STORAGE_KEY, val.toString());
  };

  const fetchAndCheck = async () => {
    try {
      const response = await fetch(window.location.href, { credentials: 'include' });
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const fillMax = doc.querySelector('#coin_mint_fill_max');
      const match = fillMax?.textContent.match(/\d+/);
      const value = match ? parseInt(match[0], 10) : 0;
      const lastNotified = getLastNotifiedValue();

      console.log(`[Mint Monitor] Checking value: ${value}, last notified: ${lastNotified}`);

      if (value >= 1 && value > lastNotified) {
        console.log(`[Mint Monitor] NEW: ${value} coins available`);
        playCoinSound();
        sendPushoverNotification(value);
        updateMonitorStatus(`💰 READY to mint ${value} coin${value > 1 ? 's' : ''}!`, '#228B22');
        setLastNotifiedValue(value);
      } else if (value < 1 && lastNotified !== 0) {
        updateMonitorStatus('💰 ON', '#DAA520');
        setLastNotifiedValue(0);
      } else {
        console.log(`[Mint Monitor] No change (${value})`);
      }
    } catch (err) {
      console.error('[Mint Monitor] Fetch failed:', err);
    }
  };

  // Find header row
  const headerRows = document.querySelectorAll('table.vis tr');
  let headerRow = null;
  for (const tr of headerRows) {
    if ([...tr.querySelectorAll('th')].some(th => th.textContent.trim().includes('Baterea talerilor de aur'))) {
      headerRow = tr;
      break;
    }
  }
  if (!headerRow) {
    alert('Could not find the header row.');
    return;
  }

  // Add Monitor + Volume headers if missing
  if (![...headerRow.children].some(th => th.textContent.trim() === 'Monitor')) {
    const th = document.createElement('th');
    th.textContent = 'Monitor';
    headerRow.appendChild(th);
  }
  if (![...headerRow.children].some(th => th.textContent.trim() === 'Volume')) {
    const th = document.createElement('th');
    th.textContent = 'Volume';
    headerRow.appendChild(th);
  }

  // Find the row to modify
  const forms = document.querySelectorAll('form[action*="action=coin"]');
  let targetRow = null;
  for (const form of forms) {
    const btn = form.querySelector('input[type="submit"]');
    if (btn) {
      const row = form.closest('tr');
      if (row) {
        targetRow = row;
        break;
      }
    }
  }
  if (!targetRow) {
    const inactive = document.querySelector('td span.inactive');
    if (inactive) targetRow = inactive.closest('tr');
  }
  if (!targetRow) {
    alert('Could not find the row with Bate button or inactive message.');
    return;
  }

  const existingCell = targetRow.querySelector('td');
  const bgColor = existingCell ? getComputedStyle(existingCell).backgroundColor : 'transparent';

  // Add Monitor status cell
  if (!document.getElementById('coinMonitorStatus')) {
    const tdMonitor = document.createElement('td');
    tdMonitor.id = 'coinMonitorStatus';
    tdMonitor.style.color = '#DAA520';
    tdMonitor.style.fontWeight = 'bold';
    tdMonitor.style.backgroundColor = bgColor;
    tdMonitor.textContent = getLastNotifiedValue() > 0 ? `💰 READY to mint ${getLastNotifiedValue()} coin${getLastNotifiedValue() > 1 ? 's' : ''}!` : '💰 ON';
    targetRow.appendChild(tdMonitor);
  }

  // Add volume control
  if (!document.getElementById('coinVolumeSelector')) {
    const tdVolume = document.createElement('td');
    tdVolume.style.backgroundColor = bgColor;

    const select = document.createElement('select');
    select.id = 'coinVolumeSelector';

    for (let v = 0; v <= 1; v += 0.1) {
      const option = document.createElement('option');
      option.value = v.toFixed(1);
      option.textContent = Math.round(v * 100) + '%';
      if (Math.abs(v - volume) < 0.01) option.selected = true;
      select.appendChild(option);
    }

    select.style.fontSize = '90%';
    select.style.padding = '2px 4px';

    select.onchange = function () {
      volume = parseFloat(this.value);
    };

    tdVolume.appendChild(select);
    targetRow.appendChild(tdVolume);
  }

  // Start monitor every 10 seconds
  setInterval(fetchAndCheck, 10000);

  // Run one check immediately
  fetchAndCheck();

})();
