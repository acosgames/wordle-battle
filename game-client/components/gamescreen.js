
import React, { Component } from 'react';
import fs from 'flatstore';

import AlertPanel from './alertpanel';
import Players from './Players';
import Question from './Question';

import WinScreen from './WinScreen';
import PlayButton from './PlayButton';
import RemainingTime from './RemainingTime';

import ReactCodeInput from 'react-code-input';

fs.set('userActivation', false);

class Gamescreen extends Component {
    constructor(props) {
        super(props);
        this.ref = null;
    }

    updatePosition() {
        if (!this.ref)
            return;

        let rect = JSON.stringify(this.ref.getBoundingClientRect());
        rect = JSON.parse(rect);
        rect.offsetWidth = this.ref.offsetWidth;
        rect.offsetHeight = this.ref.offsetHeight;

        fs.set('gamearea', rect);
    }


    render() {
        // let userActivation = fs.get('userActivation');
        // if (!userActivation) {
        //     return <PlayButton />
        // }

        let events = fs.get('events');
        if (events?.gameover) {
            return (
                <div className="vstack vcenter relative">
                    <h3 className="gameover-text">Game Over</h3>
                    <WinScreen></WinScreen>

                    <h3 className="thanks-text">Thanks for playing!</h3>
                </div>
            )
        }

        let local = fs.get('local');

        return (
            <div className="vstack vcenter relative" ref={el => {
                if (!el) return;
                this.ref = el;
                setTimeout(this.updatePosition.bind(this), 2000);
            }}>


                <Players />
                <RemainingTime />
                <Board playerid={local.id} />


            </div>

        )
    }

}

const inputProps = {
    className: 'react-code-input',
    inputStyle: {
        fontFamily: 'monospace',
        margin: '4px',
        MozAppearance: 'textfield',
        width: '15px',
        borderRadius: '3px',
        fontSize: '14px',
        height: '26px',
        paddingLeft: '7px',
        backgroundColor: 'white',
        color: 'lightskyblue',
        border: '1px solid lightskyblue',
        textTransform: 'uppercase'
    },
    inputStyleInvalid: {
        fontFamily: 'monospace',
        margin: '4px',
        MozAppearance: 'textfield',
        width: '15px',
        borderRadius: '3px',
        fontSize: '14px',
        height: '26px',
        paddingLeft: '7px',
        backgroundColor: 'white',
        color: 'red',
        border: '1px solid red',
        textTransform: 'uppercase'
    }
}

function HistoryRow(props) {
    return (
        <ReactCodeInput type='text' fields={5} {...inputProps} />
    )
}
function InputRow(props) {
    return (
        <ReactCodeInput type='text' fields={5} {...inputProps} />
    )
}
function RemainingRow(props) {
    return (
        <ReactCodeInput type='text' fields={5} {...inputProps} />
    )
}
function Board(props) {

    let elements = [];
    let state = fs.get('state');
    let rules = fs.get('rules');
    let players = fs.get('players');
    let playerid = props.playerid;

    let player = players[playerid];

    for (var i = 0; i < rules.maxattempts; i++) {

        if (i < player.attempt) {
            elements.push(<div className="row"><HistoryRow key={"row-" + i} status={player.status[i]} /></div>)
        }
        else if (i == player.attempt) {
            elements.push(<div className="row"><InputRow key={"row-" + i} /></div>);
        }
        else if (i > player.attempt) {
            elements.push(<div className="row"><RemainingRow key={"row-" + i} /></div>);
        }

    }

    return (
        <div>
            {elements}
        </div>
    )
}

export default fs.connect(['userActivation', 'rules', 'players', 'events-gameover'])(Gamescreen);