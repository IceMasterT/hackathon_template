function openPopup(url, title, w, h) {
  const left = (screen.width / 2) - (w / 2);
  const top = (screen.height / 2) - (h / 2);
  window.open(url, title, `width=${w},height=${h},top=${top},left=${left}`);
}
