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

            <div className="banner-ad" style={{position: "relative"}}>
                <div
                    id="bbgm-ads-bottom1"
                    style={{
                        display: "none",
                        textAlign: "center",
                        height: "250px",
                        position: "absolute",
                        top: "5px",
                        left: 0,
                    }}
                    data-refresh-time="-1"
                />
                <div
                    id="bbgm-ads-logo"
                    style={{
                        display: "none",
                        height: "250px",
                        margin: "5px 310px 0 310px",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <img
                        alt=""
                        src="/img/moba-logo1.png"
                        style={{
                            maxHeight: "100%",
                            maxWidth: "100%",
                        }}
                    />
                </div>
                <div
                    id="bbgm-ads-bottom2"
                    style={{
                        display: "none",
                        textAlign: "center",
                        height: "250px",
                        position: "absolute",
                        top: "5px",
                        right: 0,
                    }}
                    data-refresh-time="-1"
                />
            </div>

            <div className="clearfix" />

            <div>
                <p className="footer-version">v1.156 · {window.bbgmVersion}</p>
            </div>
        </footer>;
    }
}

export default Footer;
