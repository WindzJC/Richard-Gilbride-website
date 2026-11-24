/* Keep the YouTube player dormant until the reader opens it. */
(function () {
  const button = document.querySelector('.film-play');
  if (!button || !/^https?:$/.test(window.location.protocol)) return;
  const screen = document.querySelector('.film-screen');

  button.addEventListener('click', function () {
    const player = document.createElement('iframe');
    player.title = 'The Paper He Kept — Richard Gilbride author film';
    player.src = 'https://www.youtube-nocookie.com/embed/4OgIeYve98k?playsinline=1&autoplay=1';
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    player.setAttribute('allowfullscreen', '');
    screen.replaceChildren(player);
    player.focus();
  }, { once: true });

  button.disabled = false;
})();
