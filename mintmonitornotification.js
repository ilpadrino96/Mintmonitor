(function () {
  let volume = 0.3;
  const STORAGE_KEY = 'lastCoinReadyState';
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
        message,
        title: 'Tribal Wars Mint Monitor',
        priority: '1'
      })
    }).catch(console.error);
  };

  const getWasReady = () => localStorage.getItem(STORAGE_KEY) === 'true';
  const setWasReady = (val) => localStorage.setItem(STORAGE_KEY, val.toString());

  const updateMonitorStatus = (text, color) => {
    const el = document.getElementById('coinMonitorStatus');
    if (el) {
      el.textContent = text;
      el.style.color = color;
    }
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
      const wasReady = getWasReady();

      if (value >= 1 && !wasReady) {
        console.log(`[Mint Monitor] NEW: ${value} coins available`);
        playCoinSound();
        sendPushoverNotification(value);
        updateMonitorStatus(`💰 READY to mint ${value} coin${value > 1 ? 's' : ''}!`, '#228B22');
        setWasReady(true);
      } else if (value < 1 && wasReady) {
        updateMonitorStatus('💰 ON', '#DAA520');
        setWasReady(false);
      } else {
        console.log(`[Mint Monitor] No change (${value})`);
      }
    } catch (err) {
      console.error('[Mint Monitor] Fetch failed:', err);
    }
  };

  // === UI Setup ===

  // Header row
  const headerRows = document.querySelectorAll('table.vis tr');
  let headerRow = null;
  for (const tr of headerRows) {
    if ([...tr.querySelectorAll('th')].some(th => th.textContent.includes('Baterea talerilor de aur'))) {
      headerRow = tr;
      break;
    }
  }

  if (headerRow) {
    if (![...headerRow.children].some(th => th.textContent.trim() === 'Monitor')) {
      const thMonitor = document.createElement('th');
      thMonitor.textContent = 'Monitor';
      headerRow.appendChild(thMonitor);
    }

    if (![...headerRow.children].some(th => th.textContent.trim() === 'Volume')) {
      const thVolume = document.createElement('th');
      thVolume.textContent = 'Volume';
      headerRow.appendChild(thVolume);
    }
  }

  // Data row
  const formRow = document.querySelector('form[action*="coin"]')?.closest('tr') || document.querySelector('td span.inactive')?.closest('tr');
  if (!formRow) return;

  const existingCell = formRow.querySelector('td');
  const bgColor = existingCell ? getComputedStyle(existingCell).backgroundColor : 'transparent';

  // Monitor status cell
  if (!document.getElementById('coinMonitorStatus')) {
    const tdMonitor = document.createElement('td');
    tdMonitor.id = 'coinMonitorStatus';
    tdMonitor.style.color = '#DAA520';
    tdMonitor.style.fontWeight = 'bold';
    tdMonitor.style.backgroundColor = bgColor;
    tdMonitor.textContent = getWasReady() ? '💰 READY to mint!' : '💰 ON';
    formRow.appendChild(tdMonitor);
  }

  // Volume dropdown
  if (!document.getElementById('coinVolumeSelector')) {
    const tdVolume = document.createElement('td');
    tdVolume.style.backgroundColor = bgColor;

    const select = document.createElement('select');
    select.id = 'coinVolumeSelector';

    for (let v = 0; v <= 1; v += 0.1) {
      const option = document.createElement('option');
      option.value = v.toFixed(1);
      option.text = `${Math.round(v * 100)}%`;
      if (Math.abs(v - volume) < 0.01) option.selected = true;
      select.appendChild(option);
    }

    select.onchange = () => (volume = parseFloat(select.value));
    tdVolume.appendChild(select);
    formRow.appendChild(tdVolume);
  }

  // Start monitor loop
  fetchAndCheck();
  setInterval(fetchAndCheck, 10000);
})();
