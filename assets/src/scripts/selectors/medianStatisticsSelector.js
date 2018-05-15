
const memoize = require('fast-memoize');
const find = require('lodash/find');
const reduce = require('lodash/reduce');
const { DateTime } = require('luxon');
const { createSelector } = require('reselect');

const { getCurrentParmCd, getRequestTimeRange, getIanaTimeZone } = require('./timeSeriesSelector');

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
 * @ return {Object} where keys are TsID and the properties are the median data.
 */
export const getCurrentVariableMedianStatistics = createSelector(
    getCurrentParmCd,
    getMedianStatistics,
    (parmCd, stats) => stats[parmCd] || null
);

/*
 * @ return {Object} where keys are tsID and the properties are date (universal) and value
 */
export const getCurrentVariableMedianStatPointsInDateRange = createSelector(
    getCurrentVariableMedianStatistics,
    getRequestTimeRange('current'),
    getIanaTimeZone,
    (stats, timeRange, ianaTimeZone) => {
        if (!stats || !timeRange) {
            return {};
        }

        let nextDateTime = DateTime.fromMillis(timeRange.start, {zone: ianaTimeZone}).startOf('day');
        const endTime = DateTime.fromMillis(timeRange.end, {zone: ianaTimeZone}).endOf('day').valueOf();
        let datesOfInterest = [];
        while (nextDateTime.valueOf() <= endTime) {
            datesOfInterest.push({
                year: nextDateTime.year,
                month: nextDateTime.month.toString(),
                day: nextDateTime.day.toString()
            });
            nextDateTime = nextDateTime.plus({days: 1});
        }
        datesOfInterest.push({
            year: nextDateTime.year,
            month: nextDateTime.month.toString(),
            day: nextDateTime.day.toString()
        });
        return reduce(stats, function (result, tsData, tsId) {
            result[tsId] = datesOfInterest
                .map((date) => {
                    let stat = find(tsData, {'month_nu': date.month, 'day_nu': date.day});
                    return {
                        value: stat ? stat.p50_va: null,
                        date: DateTime.fromObject({
                            year: date.year,
                            month: parseInt(date.month),
                            day: parseInt(date.day),
                            zone: ianaTimeZone
                        }).startOf('day').valueOf()
                    };
                })
                .filter((point) => {
                    return point.value;
                });
            return result;
        }, {});
    }
);

/*
 * @Return an object where the key is tsID and properties are meta data for that tsId
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