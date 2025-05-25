(function(){
  let volume = 0.3; // default volume
  let wasReady = false;

  // Pushover settings — replace these!
  const pushoverUserKey = 'uet9xuivey6rrfbga3uzt4s369yds6';
  const pushoverApiToken = 'a738p4osx4o5mnea6pbcadjfz3au3i';

  const playCoinSound = () => {
    const audio = new Audio('https://www.myinstants.com/media/sounds/coin.mp3');
    audio.volume = volume;
    audio.play();
  };

  const sendPushoverNotification = () => {
    const message = '💰 Coin minting is READY!';
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

  const checkMintValue = () => {
    const el = document.getElementById('coin_mint_fill_max');

    if (el) {
      const match = el.textContent.match(/\d+/);
      const value = match ? parseInt(match[0], 10) : 0;

      if (value >= 1 && !wasReady) {
        wasReady = true;
        playCoinSound();
        updateMonitorStatus('💰 READY to mint!', '#228B22');
        sendPushoverNotification();
      } else if (value < 1 && wasReady) {
        wasReady = false;
        updateMonitorStatus('💰 ON', '#DAA520');
      }
    } else {
      // When no mint_fill_max element (inactive or missing), keep monitoring ON
      wasReady = false;
      updateMonitorStatus('💰 ON', '#DAA520');
    }
  };

  // Find header row with "Baterea talerilor de aur"
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

  // Add Monitor header if missing
  if (![...headerRow.children].some(th => th.textContent.trim() === 'Monitor')) {
    const th = document.createElement('th');
    th.textContent = 'Monitor';
    headerRow.appendChild(th);
  }

  // Add Volume header if missing
  if (![...headerRow.children].some(th => th.textContent.trim() === 'Volume')) {
    const th = document.createElement('th');
    th.textContent = 'Volume';
    headerRow.appendChild(th);
  }

  // Find target row (with form submit button or inactive)
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

  // Get background color from existing cell in target row
  const existingCell = targetRow.querySelector('td');
  const bgColor = existingCell ? getComputedStyle(existingCell).backgroundColor : 'transparent';

  // Insert Monitor cell if missing
  if (!document.getElementById('coinMonitorStatus')) {
    const tdMonitor = document.createElement('td');
    tdMonitor.id = 'coinMonitorStatus';
    tdMonitor.style.color = '#DAA520'; // goldenrod
    tdMonitor.style.fontWeight = 'bold';
    tdMonitor.style.backgroundColor = bgColor;
    tdMonitor.textContent = '💰 ON';
    targetRow.appendChild(tdMonitor);
  }

  // Insert Volume selector cell if missing
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

  setInterval(checkMintValue, 10000);
})();
