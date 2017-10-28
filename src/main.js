const WebSocket = require('ws');
const url = require('url');
const Game = require('../lib/LifeGameVirtualDom');

/**
 * Creates a new Server class
 */
class Server {
    /**
     * Constructor
     */
    constructor() {
        this.initGame = this.initGame.bind(this);
        this.createServer = this.createServer.bind(this);
        this.setupListeners = this.setupListeners.bind(this);
        this.onConnection = this.onConnection.bind(this);


        this.sendUpdates = this.sendUpdates.bind(this);
        this.getColor = this.getColor.bind(this);

        this.init = this.init.bind(this);

        this.init();
    }

    /**
     * Init game
     */
    initGame() {
        this.game = new Game();
        this.game.sendUpdates = this.sendUpdates;
    }

    /**
     * Create server
     */
    createServer() {
        this.wss = new WebSocket.Server({port: 4000});
    }

    /**
     * Add events listeners
     */
    setupListeners() {
        this.wss.on('connection', this.onConnection);
    }

    /**
     * Handle connection event
     * @param {Object} ws
     * @param {Object} req
     */
    onConnection(ws, req) {
        const q = url.parse(req.url, true);
        const query = q.query;
        const token = query.token;

        if (token) {
            const state = this.game.state;
            const settings = this.game.settings;
            const user = {
                token: token,
                color: this.getColor()
            };

            const message = {
                type: 'INITIALIZE',
                data: {
                    state: state,
                    settings: settings,
                    user: user
                }
            };

            ws.send(JSON.stringify(message));
        }
    }


    /**
     * Send game updates to clients
     * @param {Object} data
     */
    sendUpdates(data) {
        const message = {
            type: 'UPDATE_STATE',
            data: data
        };

        this.wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }

    /**
     * Generate random hex color
     * @returns {string}
     */
    getColor() {
        return "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
    }

    /**
     * Init server app
     */
    init() {
        this.createServer();
        this.initGame();
        this.setupListeners();
    }
}

new Server();




// const wss = new WebSocket.Server({port: 4000});

// wss.on('connection', function connection(ws, req) {
//     const q = url.parse(req.url, true);
//     const query = q.query;
//     const token = query.token;
//
//     console.log('token:', token);
//     // ws.on('message', function incoming(message) {
//     //     console.log('received: %s', message);
//     // });
//
//     // ws.send('something');
// });


// const clients = {};

// wss.on('connection', function connection(ws) {
//     const id = Math.random();
//
//     clients[id] = ws;
//     console.log("новое соединение " + id);
//
//     ws.on('message', function(message) {
//         console.log('получено сообщение ' + message);
//
//         ws.send(message);
//     });
//
//     ws.on('close', function() {
//         console.log('соединение закрыто ' + id);
//         delete clients[id];
//     });
// });