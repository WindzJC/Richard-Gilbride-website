/* Reveal native playback only after explicit viewer activation. */
(function () {
  const button = document.querySelector('.film-play');
  const player = document.getElementById('film-player')?.content.querySelector('video');
  if (!button || !player) return;
  button.addEventListener('click', function () {
    button.replaceWith(player);
    player.focus({ preventScroll: true });
    player.play().catch(function () { /* Native controls remain available. */ });
  }, { once: true });
  button.disabled = false;
})();
