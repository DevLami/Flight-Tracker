# Flight Tracker

Fiz este projeto para estudar React, TypeScript e integração com API. A ideia é acompanhar voos em um mapa usando uma interface mais próxima de uma tela de radar.

## O que usei

- React e TypeScript
- Vite
- Leaflet e React Leaflet
- API da OpenSky Network

## Rodando o projeto

Depois de baixar o repositório, instale as dependências:

```bash
npm install
```

Em seguida, inicie o servidor:

```bash
npm run dev
```

O Vite vai mostrar o endereço no terminal. Geralmente é `http://localhost:5173`.

Para a consulta à OpenSky funcionar, crie um `credentials.json` na raiz do projeto com as credenciais da sua conta:

```json
{
  "clientId": "seu-client-id",
  "clientSecret": "seu-client-secret"
}
```

Esse arquivo fica só na sua máquina. Não vale a pena subir essas credenciais para o Git.

## Organização

```text
src/
  api/           comunicação com a OpenSky
  app/           composição da tela principal
  components/    mapa, cabeçalho, busca e painel lateral
  hooks/         atualização periódica dos voos
  types/         tipos usados pela API e pela interface
```

