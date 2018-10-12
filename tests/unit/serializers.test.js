const reqlib = require('app-root-path').require;
const camelCase = require('camelcase');
const chai = require('chai');
const chaiString = require('chai-string');
const _ = require('lodash');

const { apiResourceSerializer } = reqlib('/serializers/jsonapi');
const rows = reqlib('/tests/unit/mock-data.json').apis;

const { assert } = chai;
chai.use(chaiString);

describe('Test JSON API serializer', () => {
  const jsonapi = apiResourceSerializer(rows, 'exampleUri');
  it('keys should be camelCase', (done) => {
    const newKeys = _.keys(jsonapi.data[0].attributes);
    _.forEach(newKeys, key => assert.equal(key, camelCase(key)));
    done();
  });
});
