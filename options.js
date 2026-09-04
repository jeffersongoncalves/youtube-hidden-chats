(function () {
  const EXCEPTIONS_KEY = 'yhcExceptions';
  const KNOWN_KEY = 'yhcKnownChannels';

  const rowsEl = document.getElementById('rows');
  const form = document.getElementById('add-form');
  const input = document.getElementById('add-input');

  function getState() {
    return new Promise((resolve) => {
      chrome.storage.sync.get([EXCEPTIONS_KEY, KNOWN_KEY], (data) => {
        resolve({
          exceptions: data[EXCEPTIONS_KEY] || {},
          known: data[KNOWN_KEY] || {},
        });
      });
    });
  }

  async function render() {
    const { exceptions, known } = await getState();
    const ids = Object.keys(known).sort((a, b) => known[a].localeCompare(known[b]));

    rowsEl.innerHTML = '';
    if (ids.length === 0) {
      rowsEl.innerHTML = '<tr><td colspan="3" class="empty">Nenhum canal ainda. Visite um canal no YouTube ou adicione acima.</td></tr>';
      return;
    }

    for (const id of ids) {
      const tr = document.createElement('tr');

      const nameTd = document.createElement('td');
      nameTd.textContent = known[id];
      tr.appendChild(nameTd);

      const toggleTd = document.createElement('td');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = !!exceptions[id];
      checkbox.addEventListener('change', () => setException(id, checkbox.checked));
      toggleTd.appendChild(checkbox);
      tr.appendChild(toggleTd);

      const actionsTd = document.createElement('td');
      actionsTd.className = 'actions';
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remover';
      removeBtn.className = 'remove';
      removeBtn.addEventListener('click', () => removeChannel(id));
      actionsTd.appendChild(removeBtn);
      tr.appendChild(actionsTd);

      rowsEl.appendChild(tr);
    }
  }

  async function setException(id, show) {
    const { exceptions } = await getState();
    if (show) {
      exceptions[id] = true;
    } else {
      delete exceptions[id];
    }
    chrome.storage.sync.set({ [EXCEPTIONS_KEY]: exceptions });
  }

  async function removeChannel(id) {
    const { exceptions, known } = await getState();
    delete exceptions[id];
    delete known[id];
    chrome.storage.sync.set({ [EXCEPTIONS_KEY]: exceptions, [KNOWN_KEY]: known });
  }

  async function addChannel(id, name) {
    const { known } = await getState();
    known[id] = name || id;
    await chrome.storage.sync.set({ [KNOWN_KEY]: known });
  }

  function extractChannelIdFromHtml(html) {
    const m = html.match(/<link itemprop="channelId" content="(UC[\w-]+)"/);
    return m ? m[1] : null;
  }

  function extractTitleFromHtml(html) {
    const m = html.match(/<meta property="og:title" content="([^"]+)"/);
    return m ? m[1] : null;
  }

  function toChannelUrl(raw) {
    const value = raw.trim();
    if (/^UC[\w-]{10,}$/.test(value)) return null; // ja e um ID, sem URL pra resolver
    if (value.startsWith('@')) return `https://www.youtube.com/${value}`;
    if (/^https?:\/\//.test(value)) return value;
    return `https://www.youtube.com/@${value}`;
  }

  async function resolveChannel(raw) {
    const value = raw.trim();

    const directIdMatch = value.match(/\/channel\/(UC[\w-]+)/) || value.match(/^(UC[\w-]{10,})$/);
    if (directIdMatch) {
      return { id: directIdMatch[1], name: directIdMatch[1] };
    }

    const url = toChannelUrl(value);
    const response = await fetch(url, { credentials: 'omit' });
    if (!response.ok) throw new Error(`Falha ao carregar ${url} (HTTP ${response.status})`);
    const html = await response.text();

    const id = extractChannelIdFromHtml(html);
    if (!id) throw new Error('Nao foi possivel identificar o ID do canal nessa URL.');

    const name = extractTitleFromHtml(html) || id;
    return { id, name };
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const raw = input.value;
    const submitBtn = form.querySelector('button');
    submitBtn.disabled = true;
    try {
      const { id, name } = await resolveChannel(raw);
      await addChannel(id, name);
      input.value = '';
      await render();
    } catch (err) {
      alert(err.message || 'Nao foi possivel adicionar esse canal.');
    } finally {
      submitBtn.disabled = false;
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') render();
  });

  render();
})();
