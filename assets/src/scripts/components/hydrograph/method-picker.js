/**
 * Pick list for methods module
 */

import { select } from 'd3-selection';

import{ dispatch, link } from '../../lib/redux';
import config from '../../config';
import { Actions } from '../../store';
import { getAllMethodsForCurrentVariable } from './time-series';

export const drawMethodPicker = function(elem) {
    if (!config.MULTIPLE_TIME_SERIES_METADATA_SELECTOR_ENABLED) {
        return;
    }
    const pickerContainer = elem.insert('div', ':nth-child(2)')
        .attr('id', 'ts-method-select-container');

    pickerContainer.append('label')
        .attr('class', 'usa-label')
        .attr('for', 'method-picker')
        .text('Description');
    pickerContainer.append('select')
        .attr('class', 'usa-select')
        .attr('id', 'method-picker')
        .on('change', dispatch(function() {
            return Actions.setCurrentMethodID(parseInt(select(this).property('value')));
        }))
        .call(link(function(elem, methods) {
            elem.selectAll('option').remove();
            methods.forEach((method) => {
                elem.append('option')
                    .text(method.methodDescription ? `${method.methodDescription}` : 'None')
                    .node().value = method.methodID;
            });
            pickerContainer.property('hidden', methods.length <= 1);
            if (methods.length) {
                elem.dispatch('change');
            }
        }, getAllMethodsForCurrentVariable));
};

