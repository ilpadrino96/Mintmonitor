(function(){
  const volume = 0.3; // 🔊 Set your preferred volume here (0.0 to 1.0)

  const playCoinSound = () => {
    const audio = new Audio('https://www.myinstants.com/media/sounds/coin.mp3');
    audio.volume = volume;
    audio.play();
  };

  const checkMintValue = () => {
    const el = document.getElementById('coin_mint_fill_max');
    if (!el) return;
    const match = el.textContent.match(/\d+/);
    if (match && parseInt(match[0], 10) >= 1) {
      playCoinSound();
    }
  };

  // Find the row containing the "Bate" button
  const rows = document.querySelectorAll('table.vis tr');
  let found = false;

  for (let row of rows) {
    const btn = row.querySelector('input[type="submit"][value="Bate"]');
    if (btn) {
      // Insert new cell for monitor status
      const monitorCell = document.createElement('td');
      monitorCell.id = 'coinMonitorStatus';
      monitorCell.style.padding = '5px 10px';
      monitorCell.style.backgroundColor = '#ffd700';
      monitorCell.style.fontWeight = 'bold';
      monitorCell.textContent = '💰 Monitor: ON';
      row.appendChild(monitorCell);
      found = true;
      break;
    }
  }

  if (!found) {
    alert('Could not find the Bate button row.');
    return;
  }

  // Start monitoring
  setInterval(checkMintValue, 10000);
})();
