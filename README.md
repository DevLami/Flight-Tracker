# Flight Tracker (v0.1)

Projeto de estágio — protótipo de interface de um flight tracker, inspirado em consoles de radar/ATC.

## Stack

- React + TypeScript
- Vite
- Leaflet / react-leaflet (mapa, zoom e navegação — ainda sem aviões)

## Estrutura

```
src/
  components/
    Header/      -> cabeçalho com marca e status
    SearchBar/    -> busca flutuante sobre o mapa (ainda sem lógica de busca real)
    Sidebar/      -> painel lateral com lista de voos (dados fictícios)
    MapView/      -> mapa Leaflet com tema escuro e leitura de coordenadas
  App.tsx          -> grid geral da página
  index.css        -> tokens de cor/tipografia globais
```

## Como rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Próximos passos (v0.2+)

- Conectar a uma API de posições de voo (ex.: OpenSky Network) e plotar aviões no mapa
- Ligar a busca da SearchBar aos dados reais
- Painel de detalhes ao clicar em um voo (na lista ou no mapa)
- Estado de loading / erro de conexão com a API
