(function () {
  const EXCEPTIONS_KEY = 'yhcExceptions';
  const KNOWN_KEY = 'yhcKnownChannels';

  function getChannelId() {
    const link = document.querySelector('link[itemprop="channelId"]');
    return link ? link.getAttribute('content') : null;
  }

  function getChannelName() {
    const el = document.querySelector('ytd-channel-name a');
    return el ? el.textContent.trim() : null;
  }

  function recordKnownChannel(channelId, name) {
    if (!name) return;
    chrome.storage.sync.get(KNOWN_KEY, (data) => {
      const known = data[KNOWN_KEY] || {};
      if (known[channelId] !== name) {
        known[channelId] = name;
        chrome.storage.sync.set({ [KNOWN_KEY]: known });
      }
    });
  }

  function applyState() {
    const channelId = getChannelId();
    if (!channelId) return;

    recordKnownChannel(channelId, getChannelName());

    chrome.storage.sync.get(EXCEPTIONS_KEY, (data) => {
      const exceptions = data[EXCEPTIONS_KEY] || {};
      document.documentElement.classList.toggle('yhc-show-chat', !!exceptions[channelId]);
    });
  }

  applyState();
  document.addEventListener('yt-navigate-finish', applyState);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes[EXCEPTIONS_KEY]) applyState();
  });

  // Nome/ID do canal podem renderizar apos o document_idle (SPA) -> re-verifica ate achar.
  const observer = new MutationObserver(() => {
    if (getChannelId()) {
      applyState();
      observer.disconnect();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
