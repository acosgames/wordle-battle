
import React, { Component } from 'react';
import fs from 'flatstore';

class RemainingTime extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let timeleft = fs.get('timeleft') || 0;
        timeleft = Number(timeleft) || 0;
        timeleft = Math.ceil(timeleft / 1000);

        if (timeleft <= 0)
            return (
                <div className="timeleft">
                    <div className="center">
                        <h3 className="gameover-text">Game Over</h3>
                        <h3 className="thanks-text">Thanks for playing!</h3>
                    </div>
                </div>

            )

        return (
            <div className="timeleft">
                <div className="center">
                    <span className="time-text">{timeleft}</span>
                </div>
            </div>

        )
    }

}

export default fs.connect(['timeleft'])(RemainingTime);