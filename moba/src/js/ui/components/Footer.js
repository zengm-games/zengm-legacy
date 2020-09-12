// @flow

import React from 'react';

class Footer extends React.Component {
    // eslint-disable-next-line class-methods-use-this
    shouldComponentUpdate() {
        return false;
    }

    // eslint-disable-next-line class-methods-use-this
    render() {
        return <footer>
            <p className="clearfix" />

            <div style={{position: 'relative'}}>
                <div id="banner-ad-bottom-wrapper-1" />
                <div id="banner-ad-bottom-wrapper-logo" />
                <div id="banner-ad-bottom-wrapper-2" />
            </div>

            <div className="clearfix" />

            <div>

                <p className="footer-version">v1.156 · {window.bbgmVersion}</p>
            </div>
        </footer>;
    }
}

export default Footer;
