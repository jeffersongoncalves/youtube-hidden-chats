# YouTube Hidden Chats

![YouTube Hidden Chats](banners/youtube-hidden-chats.png)

Extensao Chrome (Manifest v3) que oculta o chat ao vivo do YouTube. Sempre ativa, sem configuracao.

## Instalar

1. Abra `chrome://extensions`
2. Ative **Modo desenvolvedor** (canto superior direito)
3. Clique **Carregar sem compactacao**
4. Selecione esta pasta

## Como funciona

`hide.css` e injetado em `document_start` e esconde o chat (`ytd-live-chat-frame`),
o container vazio e o card "Chat ao vivo" da metadata. Tambem zera o `padding-right`
da grade pra nao sobrar coluna vazia.

## Arquivos

| Arquivo | Funcao |
|---|---|
| `manifest.json` | Config MV3 |
| `hide.css` | Esconde o chat e ajusta o layout |
| `icons/` | Icones 16/48/128 |
