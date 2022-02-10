# Wordle Battle
Battle up to 5 opponents to conquer the Wordle

[View Acos Documentation](https://docs.acos.games)

--- 

## Getting Started

Requires Node v16+

### Installation 
```bash
npm install
```

### Run Simulator, Client, and Server
```bash
npm start
```

### Playing the game

1. Open 2 tabs at [http://localhost:3200/](http://localhost:3200/)
2. Enter a username on each tab and click 'Join'
3. When ready, press "Start Game"

The game was designed to play in Fixed Resolution, 4:4 mode.


## About Client

Game Client is built using ReactJS.  It will run inside an iframe and communicate with the parent frame which is the [Simulator's](https://github.com/acosgames/acosgames) client.  

All assets (images, svg, audio) should be packed into a single javascript file:

- `client.bundle.dev.js` for development
- `client.bundle.js` for production.

A browser-sync is included so that your changes are reflected immediately.

## About Server

Game Server code is built using NodeJS code and bundled into a single `server.bundle.js` file for both developmet and production.

`database.json` is used to store large amounts of data in JSON format, and must be in the `./game-server/` folder

It is accessed via `globals.database()` in the server code.  It is not shared with client.

## About Simulator

[Simulator](https://github.com/acosgames/acosgames) runs a simple frontend that displays your `client.bundle.js` inside an iframe.  

[Simulator](https://github.com/acosgames/acosgames) also runs a NodeJS express/socket.io server with a worker that uses vm2 to run your `server.bundle.js` code.
