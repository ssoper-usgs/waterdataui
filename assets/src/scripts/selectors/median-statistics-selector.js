
import memoize from 'fast-memoize';
import reduce from 'lodash/reduce';
import { createSelector } from 'reselect';
import { getAllMethodsForCurrentVariable } from '../components/hydrograph/time-series';
import {getCurrentMethodID, getCurrentParmCd, getMethods } from './time-series-selector';


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

/*
 * @return {Object} where keys are TsID and the properties are the median data.
 */
export const getCurrentVariableMedianStatistics = createSelector(
    getCurrentParmCd,
    getMedianStatistics,
    (parmCd, stats) => stats[parmCd] || null
);

 /*
  * @return {Object} where keys are TsID and the properties are the median data.
  */
// Need to return the median statistics whose method description matches the current method id's method description.
 export const getCurrentMethodMedianStatistics = createSelector(
     getCurrentMethodID,
     getMethods,
     getCurrentVariableMedianStatistics,
     getAllMethodsForCurrentVariable,
         (currentMethodId, methods2, stats, methods) => {
             if (stats) {
                 let tsids = Object.keys(stats);

                 let matchingMethodDescription;
                 for (const method of methods){
                    if (method.methodID === currentMethodId) {
                        matchingMethodDescription = method.methodDescription;
                        // This shows us our filtered method in the context of all the methods available to us from
                        // the time series.
                        console.log(methods2);
                        console.log(methods);
                        console.log(currentMethodId);
                    }
                 }

                 let winningStats = {};
                 for (const tsid of tsids) {
                     // quick access to tsid
                     console.log(tsid);

                     // Note: the method descriptions we get from the stats response do not always match the method
                     // descriptions we get from the time series data.
                     console.log(stats[tsid].map(key => key['loc_web_ds'])[0]);

                     // Quick comparison to the method description from the console log above.
                     console.log(matchingMethodDescription);
                     if (stats[tsid].map(key => key['loc_web_ds'])[0] === matchingMethodDescription) {
                         // we might get more than one match here, since the method description text may not be
                         // unique all the time. This would result in more than 1 median line being rendered.
                         winningStats[tsid] = stats[tsid];
                         console.log(winningStats);
                     }
                 }

                 return winningStats;
             } else {
                 console.log('stats were null')
                 return null;
             }
         }
);

/*
 * @return {Object} where the key is tsID and properties are meta data for that tsId
 */
export const getCurrentVariableMedianMetadata = createSelector(
    getCurrentMethodMedianStatistics,
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
