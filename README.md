# YouTube Hidden Chats

![YouTube Hidden Chats](banners/youtube-hidden-chats.png)

Extensao Chrome (Manifest v3) que oculta o chat ao vivo do YouTube por padrao,
com excecao por canal.

## Instalar

1. Abra `chrome://extensions`
2. Ative **Modo desenvolvedor** (canto superior direito)
3. Clique **Carregar sem compactacao**
4. Selecione esta pasta

## Como funciona

`hide.css` e injetado em `document_start` e esconde o chat (`ytd-live-chat-frame`),
o container vazio e o card "Chat ao vivo" da metadata, exceto quando o canal
atual esta na lista de excecoes.

`content.js` identifica o canal da pagina (via `link[itemprop="channelId"]`),
consulta a excecao salva em `chrome.storage.sync` e aplica a classe
`yhc-show-chat` no `<html>` quando o chat deve ficar visivel. Reage a
navegacao SPA do YouTube (`yt-navigate-finish`) e a mudancas de storage em
tempo real.

Clicar no icone da extensao abre a pagina de gerenciamento (`options.html`),
onde da pra listar os canais ja visitados, adicionar um canal manualmente
(URL, `@handle` ou ID `UC...`) e alternar "Mostrar chat" por canal.

## Arquivos

| Arquivo | Funcao |
|---|---|
| `manifest.json` | Config MV3 |
| `hide.css` | Esconde o chat por padrao e ajusta o layout |
| `content.js` | Detecta o canal e aplica/remove a excecao |
| `background.js` | Abre a pagina de opcoes ao clicar no icone |
| `options.html` / `options.js` | Pagina de gerenciamento de canais |
| `icons/` | Icones 16/48/128 |
