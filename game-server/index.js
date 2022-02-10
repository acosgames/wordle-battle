import cup from './acosg';
import WordleBattle from './game';



cup.on('gamestart', (action) => WordleBattle.onNewGame(action));
cup.on('skip', (action) => WordleBattle.onSkip(action));
cup.on('join', (action) => WordleBattle.onJoin(action));
cup.on('leave', (action) => WordleBattle.onLeave(action));
cup.on('pick', (action) => WordleBattle.onAttempt(action));

cup.commit();