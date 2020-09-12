// @flow

import {g, helpers} from '../../../common';
import {idb} from '../../db';
import type {MSISeries} from '../../../common/types';

const getCopy = async ({season}: {season: number} = {}): Promise<MSISeries> => {
    if (season === g.season) {
        return helpers.deepCopy(await idb.cache.msiSeries.get(season));
    }

    return idb.league.msiSeries.get(season);
};

export default getCopy;
