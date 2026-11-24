/* Reveal native playback only after explicit viewer activation. */
(function () {
  const button = document.querySelector('.film-play');
  const player = document.querySelector('.film-screen video');
  if (!button || !player) return;
  player.hidden = true;
  button.hidden = false;
  button.addEventListener('click', function () {
    button.hidden = true;
    player.hidden = false;
    player.focus();
    player.play().catch(function () { /* Native controls remain available. */ });
  }, { once: true });
})();
