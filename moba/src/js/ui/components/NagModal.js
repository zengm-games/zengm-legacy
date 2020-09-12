// @flow

import React from 'react';
import Modal from 'react-bootstrap/lib/Modal';

type Props = {
    close: () => void,
    show: boolean,
};

class NagModal extends React.Component {
    props: Props;

    shouldComponentUpdate(nextProps: Props) {
        return this.props.show !== nextProps.show;
    }

    render() {
        const {close, show} = this.props;

        return <Modal show={show} onHide={close}>
            <Modal.Header closeButton>
                <Modal.Title>Thank You!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
				<p> Thank you for getting MOBA GM. If you aren't aware, there is a subreddit /r/ZenGMLOL that users share files and report bugs. </p>
				<p> By purchasing the game you also have access on Steam and the web. If you currently only have access to one, feel free to e-mail commissioner@zengm.com to request access to the other. </p>				
            </Modal.Body>
        </Modal>;
    }
}

NagModal.propTypes = {
    close: React.PropTypes.func.isRequired,
    show: React.PropTypes.bool.isRequired,
};

export default NagModal;
