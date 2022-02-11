import fs from 'flatstore';
import db from '../database.json'
import WordInput from './WordInput'
import { send } from '../acosg';

function HistoryRow(props) {

    let local = fs.get('local');
    if (!local)
        return <RemainingRow key={"remainrow-" + props.index} />

    let history = local._history || {};
    let word = history[props.index];
    if (!word) {
        return <RemainingRow key={"remainrow-" + props.index} />
    }

    let status = local.status[props.index];
    if (!status) {
        return <RemainingRow key={"remainrow-" + props.index} />
    }
    return (
        <div className="squares">
            {status.map((s, i) => {
                if (s == 0) {
                    return <div className="square gray">{word[i]}</div>
                }
                if (s == 1) {
                    return <div className="square yellow">{word[i]}</div>
                }
                if (s == 2) {
                    return <div className="square green">{word[i]}</div>
                }
            })}
        </div>
    )
}



function InputRow(props) {
    var word = "";
    const onChange = (e) => {
        word = e;
    }
    const clickedGo = (e) => {
        if (!db.includes(word.toLowerCase())) {
            console.log("The word ", word, "does not exist.");
            return;
        }

        if (word.length != 5) {
            console.log("The word ", word, "must be at least 5 characters.");
            return;
        }

        send('pick', word.toLowerCase())
    }
    return (
        <div className="row hstack-zero">
            <WordInput onChange={onChange} type='text' />
            <button className="goButton" onClick={clickedGo}>GO</button>
        </div>
    )
}

function RemainingRow(props) {
    return (
        <div className="squares">
            <div className="square gray"></div>
            <div className="square gray"></div>
            <div className="square gray"></div>
            <div className="square gray"></div>
            <div className="square gray"></div>
        </div>
    )
}


function Board(props) {

    let elements = [];
    let state = fs.get('state');
    let rules = fs.get('rules');
    let player = fs.get('local');

    for (var i = 0; i < rules.maxattempts; i++) {
        if (i < player.attempt) {
            elements.push(<HistoryRow index={i} key={"row-" + i} status={player.status[i]} />)
        }
        else if (i == player.attempt) {
            elements.push(<InputRow key={"row-" + i} />);
        }
        else if (i > player.attempt) {
            elements.push(<RemainingRow key={"row-" + i} />);
        }
    }

    return (
        <div className="board">
            {elements}
        </div>
    )
}

export default fs.connect(['state-gamestatus', 'rules', 'local'])(Board);