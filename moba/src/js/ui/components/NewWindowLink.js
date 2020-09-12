// @flow

import React from 'react';
import {helpers} from '../../common';

type Props = {
    parts: (number | string)[],
};

class NewWindowLink extends React.Component {
    props: Props;

    handleClick: () => void;

    constructor(props: Props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        const url = this.props.parts ? helpers.leagueUrl(this.props.parts) : document.URL;

        // Window name is set to the current time, so each window has a unique name and thus a new window is always opened
        window.open(`${url}?w=popup`, Date.now(), "height=600,width=800,scrollbars=yes");
    }

    render() {
        return (
            <img
                alt="Open In New Window"
                className="new_window"
                title="Open In New Window"
                height="16"
                width="16"
                onClick={this.handleClick}
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAaVBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAAD8pYtkAAAAInRSTlMABIAfFSkMCT1TbC5fRxAFC2JCTB1EZAMOTyhqBntuGg0TfbcOWAAAAAFiS0dEAIgFHUgAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAB7SURBVBjTVc/bEoMgDATQzYIo1tpqq73f/v8nS3BgYJ8yZ5JMAkBYBgrGpjSEiGMbuPPe9ztLaJvCoMVewYwRDseJnBWsRIBnX8GJw7mEhevlertn6Ph46lwC93rHPRnw+aKEX5tiNqh+oQ3XbxnpRMAmf2YoYU3VH+APeMEEiOzi4DMAAAAASUVORK5CYII="
            />
        );
    }
}

NewWindowLink.propTypes = {
    parts: React.PropTypes.arrayOf(React.PropTypes.oneOfType([
        React.PropTypes.number,
        React.PropTypes.string,
    ])),
};

export default NewWindowLink;
