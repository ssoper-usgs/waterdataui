
import memoize from 'fast-memoize';
import reduce from 'lodash/reduce';
import { createSelector } from 'reselect';
import { getAllMethodsForCurrentVariable } from '../components/hydrograph/time-series';
import {getCurrentMethodID, getCurrentParmCd } from './time-series-selector';


/*
 * Selectors that return properties from the state
 */
export const getMedianStatistics = state => state.statisticsData.median || {};

/*
 * Selectors that return derived data
 */
export const getMedianStatisticsByParmCd = memoize(parmCd => createSelector(
    getMedianStatistics,
    stats => stats[parmCd] || null
));

// /*
//  * @return {Object} where keys are TsID and the properties are the median data.
//  */
// export const getCurrentVariableMedianStatistics = createSelector(
//     getCurrentParmCd,
//     getMedianStatistics,
//     (parmCd, stats) => stats[parmCd] || null
// );

 /*
  * @return {Object} where keys are TsID and the properties are the median data.
  */
// Need to return the median statistics whose method description matches the current method id's method description.
 export const getCurrentVariableMedianStatistics = createSelector(
     getCurrentParmCd,
     getCurrentMethodID,
     getMedianStatistics,
     getAllMethodsForCurrentVariable,
         (parmCd, currentMethodId, stats, methods) => {
             if (stats && parmCd && stats && methods) {
                 let currentVariableMedianStatistics = stats[parmCd];
                 if (currentVariableMedianStatistics) {

                     let tsids = Object.keys(currentVariableMedianStatistics);

                     let winningMethodDescription;

                     for (const method of methods){
                        if (method.methodID === currentMethodId) {
                            console.log('the winning method id and description is: ');
                            console.log(method.methodID);
                            console.log(method.methodDescription);
                            winningMethodDescription = method.methodDescription;
                        }
                     }

                     let winningStats = {};
                     for (const tsid of tsids) {
                         if (currentVariableMedianStatistics[tsid].map(key => key['loc_web_ds'])[0] === winningMethodDescription) {
                             winningStats.add(currentVariableMedianStatistics[tsid]);
                         }
                     }
                     // the raw stats
                     console.log(stats);
                     // the stats we currently provide
                     console.log(currentVariableMedianStatistics);
                     // the stats we now want to provide
                     console.log(winningStats);
                     return winningStats || null;
                 }
             }
         }
);

/*
 * @return {Object} where the key is tsID and properties are meta data for that tsId
 */
export const getCurrentVariableMedianMetadata = createSelector(
    getCurrentVariableMedianStatistics,
    (stats) => {
        return reduce(stats, (result, tsData, tsId) => {
            result[tsId] = {
                beginYear: tsData[0].begin_yr,
                endYear: tsData[0].end_yr,
                methodDescription: tsData[0].loc_web_ds
            };
            return result;
        }, {});
    }
);
