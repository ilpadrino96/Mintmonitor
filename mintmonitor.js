(function(){
  const volume = 0.3; // Set volume (0.0 to 1.0)
  let wasReady = false;

  const playCoinSound = () => {
    const audio = new Audio('https://www.myinstants.com/media/sounds/coin.mp3');
    audio.volume = volume;
    audio.play();
  };

  const updateMonitorStatus = (text, color) => {
    const monitorCell = document.getElementById('coinMonitorStatus');
    if (monitorCell) {
      monitorCell.textContent = text;
      monitorCell.style.backgroundColor = color;
    }
  };

  const checkMintValue = () => {
    const el = document.getElementById('coin_mint_fill_max');
    const inactiveNotice = document.querySelector('td span.inactive');

    if (el) {
      const match = el.textContent.match(/\d+/);
      const value = match ? parseInt(match[0], 10) : 0;

      if (value >= 1 && !wasReady) {
        wasReady = true;
        playCoinSound();
        updateMonitorStatus('💰 READY to mint!', '#90ee90'); // green
      } else if (value < 1 && wasReady) {
        wasReady = false;
        updateMonitorStatus('💰 Monitor: ON', '#ffd700'); // gold
      }
    } else if (inactiveNotice) {
      wasReady = false;
      updateMonitorStatus('🚫 Not available', '#f8d7da'); // red/pink
    } else {
      updateMonitorStatus('❓ Unknown state', '#d3d3d3'); // gray
    }
  };

  // Try to find where to insert the monitor status
  const targetRow = (() => {
    const forms = document.querySelectorAll('form[action*="action=coin"]');
    for (let form of forms) {
      const btn = form.querySelector('input[type="submit"]');
      const row = form.closest('tr');
      if (btn && row) return row;
    }
    // If no form/button found, look for inactive text row
    const inactive = document.querySelector('td span.inactive');
    return inactive ? inactive.closest('tr') : null;
  })();

  if (!targetRow || document.getElementById('coinMonitorStatus')) {
    alert('Could not find the correct row to insert monitor status.');
    return;
  }

  const monitorCell = document.createElement('td');
  monitorCell.id = 'coinMonitorStatus';
  monitorCell.style.padding = '5px 10px';
  monitorCell.style.fontWeight = 'bold';
  monitorCell.style.backgroundColor = '#ffd700';
  monitorCell.textContent = '💰 Monitor: ON';
  targetRow.appendChild(monitorCell);

  setInterval(checkMintValue, 10000);
})();
