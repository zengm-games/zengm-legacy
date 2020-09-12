// @flow

import {g} from '../../common';

let currentTitle = 'MOBA GM';
const setTitle = (newTitle: string) => {
    if (g.lid !== undefined) {
        newTitle += ` - ${g.leagueName}`;
    }
    newTitle = `${newTitle} - MOBA GM`;
    if (newTitle !== currentTitle) {
        currentTitle = newTitle;
        document.title = newTitle;
    }
};

export default setTitle;
