// @flow

import React from 'react';

class Header extends React.Component {
    // eslint-disable-next-line class-methods-use-this
    shouldComponentUpdate() {
        return false;
    }

    // eslint-disable-next-line class-methods-use-this
    render() {
        return <div>
            <div
                className="banner-ad"
                id="bbgm-ads-top"
                style={{
                    display: "none",
                    textAlign: "center",
                    minHeight: 90,
                    marginTop: 5,
                }}
            />
            <div
                className="banner-ad"
                id="bbgm-ads-mobile"
                style={{
                    display: "none",
                    textAlign: "center",
                    minHeight: 50,
                    marginTop: 5,
                }}
            />
        </div>;
    }
}

export default Header;
