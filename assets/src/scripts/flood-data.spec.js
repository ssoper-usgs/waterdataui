import { fetchFloodExtent, fetchFloodFeatures } from './flood-data';


describe('flood_data module', () => {
    beforeEach(() => {
        jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
    });

    describe('fetchFloodFeatures', () => {
        const siteno = '12345678';

        describe('with valid response', () => {
            let promise;

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */
                promise = fetchFloodFeatures(siteno);
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: MOCK_FLOOD_FEATURE,
                    contentType: 'application/json'
                });
            });

            it('expected response is json object with the stages', () => {
                promise.then((resp) => {
                    expect(resp.length).toBe(3);
                    expect(resp[0].attributes.STAGE).toBe(30);
                    expect(resp[1].attributes.STAGE).toBe(29);
                    expect(resp[2].attributes.STAGE).toBe(28);
                });
            });
        });

        describe('with error response', () => {
            it('On failed response return an empty feature list', () => {
                fetchFloodFeatures(siteno).then((resp) => {
                   expect(resp.length).toBe(0);
                });
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 500
                });
            });
        });
    });

    describe('fetchFloodExtent', () => {
        let promise;
        const siteno = '12345678';

        describe('with valid response', () => {

            beforeEach(() => {
                /* eslint no-use-before-define: 0 */
                promise = fetchFloodExtent(siteno);
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: MOCK_FLOOD_EXTENT,
                    contentType: 'application/json'
                });
            });

            it('expected response is json object with the extent', () => {
                promise.then((resp) => {
                    expect(resp.extent).toBeDefined();
                    expect(resp.extent.xmin).toBe(-84.353211731250525);
                    expect(resp.extent.xmax).toBe(-84.223456338038901);
                    expect(resp.extent.ymin).toBe(34.016663666167332);
                    expect(resp.extent.ymax).toBe(34.100999075364072);
                });
            });
        });

        describe('with error response', () => {
            beforeEach(() => {
                /* eslint no-use-before-define: 0 */
                promise = fetchFloodExtent(siteno);
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 500
                });
            });

            it('On failed response return an empty feature list', () => {
               promise.then((resp) => {
                   expect(resp).toEqual({});
               });
            });
        });
    });
});

const MOCK_FLOOD_FEATURE = `
{
	"displayFieldName": "USGSID",
	"fieldAliases": {
		"USGSID": "USGSID",
		"STAGE": "STAGE"
	},
	"fields": [{
		"name": "USGSID",
		"type": "esriFieldTypeString",
		"alias": "USGSID",
		"length": 254
	}, {
		"name": "STAGE",
		"type": "esriFieldTypeDouble",
		"alias": "STAGE"
	}],
	"features": [{
		"attributes": {
			"USGSID": "03341500",
			"STAGE": 30
		}
	}, {
		"attributes": {
			"USGSID": "03341500",
			"STAGE": 29
		}
	}, {
		"attributes": {
			"USGSID": "03341500",
			"STAGE": 28
		}
	}]
}
`;

const MOCK_FLOOD_EXTENT = `
{
	"extent": {
		"xmin": -84.353211731250525,
		"ymin": 34.016663666167332,
		"xmax": -84.223456338038901,
		"ymax": 34.100999075364072,
		"spatialReference": {
			"wkid": 4326,
			"latestWkid": 4326
		}
	}
}
`;
