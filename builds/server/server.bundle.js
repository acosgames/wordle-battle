/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./game-server/acosg.js":
/*!******************************!*\
  !*** ./game-server/acosg.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });

class ACOSG {
    constructor() {
        try {
            this.actions = JSON.parse(JSON.stringify(globals.actions()));
        }
        catch (e) { this.error('Failed to load actions'); return }
        try {
            this.originalGame = JSON.parse(JSON.stringify(globals.game()));
        }
        catch (e) { this.error('Failed to load originalGame'); return }
        try {
            this.nextGame = JSON.parse(JSON.stringify(globals.game()));
        }
        catch (e) { this.error('Failed to load nextGame'); return }


        this.currentAction = null;

        this.isNewGame = false;
        // this.markedForDelete = false;
        this.defaultSeconds = 15;
        // this.nextTimeLimit = -1;
        this.kickedPlayers = [];

        // if (!this.nextGame || !this.nextGame.rules || Object.keys(this.nextGame.rules).length == 0) {
        //     this.isNewGame = true;
        //     this.error('Missing Rules');
        // }

        if (this.nextGame) {
            if (!('timer' in this.nextGame)) {
                this.nextGame.timer = {};
            }
            if (!('state' in this.nextGame)) {
                this.nextGame.state = {};
            }

            if (!('players' in this.nextGame)) {
                this.nextGame.players = {};
            }

            //if (!('prev' in this.nextGame)) {
            this.nextGame.prev = {};
            //}

            if (!('next' in this.nextGame)) {
                this.nextGame.next = {};
            }

            if (!('rules' in this.nextGame)) {
                this.nextGame.rules = {};
            }

            this.nextGame.events = {};
        }



    }

    on(type, cb) {

        // if (type == 'newgame') {
        //     //if (this.isNewGame) {
        //     this.currentAction = this.actions[0];
        //     if (this.currentAction.type == '')
        //         cb(this.actions[0]);
        //     this.isNewGame = false;
        //     //}

        //     return;
        // }

        for (var i = 0; i < this.actions.length; i++) {
            if (this.actions[i].type == type) {
                this.currentAction = this.actions[i];
                let result = cb(this.currentAction);
                if (typeof result == "boolean" && !result) {
                    this.ignore();
                    break;
                }
            }

        }

    }

    ignore() {
        globals.ignore();
    }

    setGame(game) {
        for (var id in this.nextGame.players) {
            let player = this.nextGame.players[id];
            game.players[id] = player;
        }
        this.nextGame = game;
    }

    commit() {
        if (this.kickedPlayers.length > 0)
            this.nextGame.kick = this.kickedPlayers;

        globals.finish(this.nextGame);
    }

    gameover(payload) {
        this.event('gameover', payload);
    }

    log(msg) {
        globals.log(msg);
    }
    error(msg) {
        globals.error(msg);
    }

    kickPlayer(id) {
        this.kickedPlayers.push(id);
    }

    database() {
        return globals.database();
    }

    action() {
        return this.currentAction;
    }

    state(key, value) {

        if (typeof key === 'undefined')
            return this.nextGame.state;
        if (typeof value === 'undefined')
            return this.nextGame.state[key];

        this.nextGame.state[key] = value;
    }

    playerList() {
        return Object.keys(this.nextGame.players);
    }
    playerCount() {
        return Object.keys(this.nextGame.players).length;
    }

    players(userid, value) {
        if (typeof userid === 'undefined')
            return this.nextGame.players;
        if (typeof value === 'undefined')
            return this.nextGame.players[userid];

        this.nextGame.players[userid] = value;
    }

    rules(rule, value) {
        if (typeof rule === 'undefined')
            return this.nextGame.rules;
        if (typeof value === 'undefined')
            return this.nextGame.rules[rule];

        this.nextGame.rules[rule] = value;
    }

    prev(obj) {
        if (typeof obj === 'object') {
            this.nextGame.prev = obj;
        }
        return this.nextGame.prev;
    }

    next(obj) {
        if (typeof obj === 'object') {
            this.nextGame.next = obj;
        }
        return this.nextGame.next;
    }

    setTimelimit(seconds) {
        seconds = seconds || this.defaultSeconds;
        if (!this.nextGame.timer)
            this.nextGame.timer = {};
        this.nextGame.timer.set = seconds;// Math.min(60, Math.max(10, seconds));
    }

    reachedTimelimit(action) {
        if (typeof action.timeleft == 'undefined')
            return false;
        return action.timeleft <= 0;
    }

    event(name, payload) {
        if (!payload)
            return this.nextGame.events[name];

        this.nextGame.events[name] = payload || {};
    }

    clearEvents() {
        this.nextGame.events = {};
    }
    // events(name) {
    //     if (typeof name === 'undefined')
    //         return this.nextGame.events;
    //     this.nextGame.events.push(name);
    // }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new ACOSG());

/***/ }),

/***/ "./game-server/game.js":
/*!*****************************!*\
  !*** ./game-server/game.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _acosg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./acosg */ "./game-server/acosg.js");



let questions = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].database();

let defaultGame = {
    state: {
        _index: 0,
        _rank: 1
    },
    players: {},
    rules: {
        maxplayers: 10,
        maxattempts: 6,
        maxtime: 300
    },
    next: {},
    events: {}
}



class WordleBattle {

    onNewGame(action) {
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].setGame(defaultGame);
        this.startGame();
    }

    startGame() {
        let players = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players();

        let rules = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].rules();

        for (var id in players) {
            players[id].score = 0;
            players[id].rank = rules.maxplayers;
            players[id].attempt = 0;
        }


        this.nextRound();
    }

    onSkip(action) {

        this.endOfRound();
    }

    endOfRound() {
        let state = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].state();
        this.processWinners();

        let question = questions[state._qid];
        // cup.event('a', question.a);
        state.a = question.a;
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    }

    nextRound() {
        let state = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].state();
        let rules = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].rules();
        let db = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].database();
        state._index = this.getRandomInt(0, db.length);

        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].next({ id: '*' });
        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].setTimelimit(rules.maxtime);
    }

    onJoin(action) {
        if (!action.user.id)
            return;

        let players = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players();
        let player = players[action.user.id];
        if (!player)
            return;


        //new player defaults

    }



    onLeave(action) {
        let id = action.user.id;
        let players = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players();
        // let playerList = cup.playerList();
        let player = players[id];
        if (player) {
            player.forfeit = true;
        }

        this.checkIfGameOver();
    }

    onAttempt(action) {

        // if (cup.reachedTimelimit(action)) {
        //     this.nextRound();
        //     cup.log("Pick passed timelimit, getting new round");
        //     return;
        // }
        let rules = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].rules();
        let state = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].state();
        let player = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players(action.user.id);
        let db = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].database();

        //get the picked cell
        let attempt = action.payload;
        let word = db[state._index];

        if (attempt.length != word.length) {
            _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].ignore();
            return;
        }

        player.attempt++;

        if (attempt == word) {
            let scoreFromTime = (rules.maxtime) - (action.timeleft / 1000);
            let scoreBonus = (rules.maxattempts - player.attempt);
            if (scoreBonus < 0)
                scoreBonus = rules.maxattempts / player.attempt;
            player.score = Math.round(scoreFromTime * scoreBonus);
            player.rank = state._rank++;
        }

        if (!db.includes(attempt)) {
            _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].ignore();
            return;
        }

        //map letters to capture counts and existance
        let letters = {};
        for (var i = 0; i < attempt.length; i++) {
            let letter = word[i];
            if (letters[letter])
                letters[letter]++;
            else
                letters[letter] = 1;
        }

        //give a status when letter matches or exists in the word somewhere else, or not exist
        let status = [];
        for (var i = 0; i < attempt.length; i++) {
            let letter = attempt[i];
            if (letter == word[i]) {
                status.push(2);
                letters[letter]--;
            }
            else if (letters[letter] > 0) {
                status.push(1);
                letters[letter]--;
            }
            else
                status.push(0);
        }

        player.status = player.status || {};
        player.status[player.attempt - 1] = status;
        player._history = player._history || [];
        player._history.push(attempt);

        this.checkIfGameOver();
    }

    checkIfGameOver() {
        let rules = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].rules();
        let maxattempts = rules.maxattempts;

        let finished = 0;
        let playerList = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].playerList();
        for (var id of playerList) {
            let player = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players(id);
            if (player.attempt > maxattempts || player.forfeit || player.completed) {
                finished++;
            }
        }

        //end round
        if (finished >= playerList.length) {
            this.onSkip();
        }
    }


    processWinners() {
        let players = _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].players();
        let topPlayer = '';

        //add player id into the player data
        for (var id in players) {
            if (players[id].rank == 1) {
                topPlayer = id;
                break;
            }
        }

        _acosg__WEBPACK_IMPORTED_MODULE_0__["default"].gameover(topPlayer);
    }


}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new WordleBattle());


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!******************************!*\
  !*** ./game-server/index.js ***!
  \******************************/
/* harmony import */ var _acosg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./acosg */ "./game-server/acosg.js");
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./game */ "./game-server/game.js");





_acosg__WEBPACK_IMPORTED_MODULE_0__["default"].on('gamestart', (action) => _game__WEBPACK_IMPORTED_MODULE_1__["default"].onNewGame(action));
_acosg__WEBPACK_IMPORTED_MODULE_0__["default"].on('skip', (action) => _game__WEBPACK_IMPORTED_MODULE_1__["default"].onSkip(action));
_acosg__WEBPACK_IMPORTED_MODULE_0__["default"].on('join', (action) => _game__WEBPACK_IMPORTED_MODULE_1__["default"].onJoin(action));
_acosg__WEBPACK_IMPORTED_MODULE_0__["default"].on('leave', (action) => _game__WEBPACK_IMPORTED_MODULE_1__["default"].onLeave(action));
_acosg__WEBPACK_IMPORTED_MODULE_0__["default"].on('pick', (action) => _game__WEBPACK_IMPORTED_MODULE_1__["default"].onAttempt(action));

_acosg__WEBPACK_IMPORTED_MODULE_0__["default"].commit();
})();

/******/ })()
;
//# sourceMappingURL=server.bundle.js.map