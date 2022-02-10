
import cup from './acosg';

let questions = cup.database();

let defaultGame = {
    state: {
        _index: 0,
        _rank: 10
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
        cup.setGame(defaultGame);
        this.startGame();
    }

    startGame() {
        let players = cup.players();

        let rules = cup.rules();

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
        let state = cup.state();
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
        let state = cup.state();
        let rules = cup.rules();
        let db = cup.database();
        state._index = this.getRandomInt(0, db.length);

        cup.next({ id: '*' });
        cup.setTimelimit(rules.maxtime);
    }

    onJoin(action) {
        if (!action.user.id)
            return;

        let players = cup.players();
        let player = players[action.user.id];
        if (!player)
            return;


        //new player defaults

    }



    onLeave(action) {
        let id = action.user.id;
        let players = cup.players();
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
        let rules = cup.rules();
        let state = cup.state();
        let player = cup.players(action.user.id);
        let db = cup.database();

        //get the picked cell
        let attempt = action.payload;
        let word = db[state._index];

        if (attempt.length != word.length) {
            cup.ignore();
            return;
        }

        player.attempt++;

        if (attempt == word) {
            let scoreFromTime = (rules.maxtime * 1000) - timeleft;
            let scoreBonus = (rules.maxattempts - player.attempt);
            player.score = scoreFromTime * scoreBonus;
            player.rank = state._rank++;
        }

        //map letters to capture counts and existance
        let letters = {};
        for (var i = 0; i < word.length; i++) {
            let letter = word[i];
            if (letters[letter])
                letters[letter]++;
            else
                letters[letter] = 1;
        }

        //give a status when letter matches or exists in the word somewhere else, or not exist
        let status = [];
        for (var i = 0; i < word.length; i++) {
            let letter = word[i];
            if (letter == attempt[i]) {
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
        player.status[player.attempt] = status;

        this.checkIfGameOver();
    }

    checkIfGameOver() {
        let rules = cup.rules();
        let maxattempts = rules.maxattempts;

        let finished = 0;
        let playerList = cup.playerList();
        for (var id of playerList) {
            let player = cup.players(id);
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
        let players = cup.players();
        let topPlayer = '';

        //add player id into the player data
        for (var id in players) {
            if (players[id].rank == 1) {
                topPlayer = id;
                break;
            }
        }

        cup.gameover(topPlayer);
    }


}

export default new WordleBattle();
