const appRoot = require('app-root-path');
const decamelize = require('decamelize');
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('lodash');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const { querySelfLink, idSelfLink } = appRoot.require('/serializers/uri-builder');

const swagger = yaml.safeLoad(fs.readFileSync(`${appRoot}/swagger.yaml`, 'utf8'));
const apiResourceProp = swagger.definitions.AccountIndexResourceObject.properties;
const apiResourceType = apiResourceProp.type.example;
const apiResourceKeys = _.keys(apiResourceProp.attributes.properties);
const api = appRoot.require('/package.json').name;

const accountIndexEndpoint = `${api}/account-indexes`;

/**
 * The column name getting from database is usually UPPER_CASE.
 * This block of code is to make the camelCase keys defined in swagger.yaml be
 * UPPER_CASE so that the serializer can correctly match the corresponding columns
 * from the raw data rows.
 */
_.forEach(apiResourceKeys, (key, index) => {
  apiResourceKeys[index] = decamelize(key).toUpperCase();
});

const accountIndexSerializerOptions = {
  attributes: apiResourceKeys,
  id: 'ACCOUNT_INDEX_CODE',
  keyForAttribute: 'camelCase',
  dataLinks: { self: row => idSelfLink(accountIndexEndpoint, row.ACCOUNT_INDEX_CODE) },
};

/**
 * @summary Serializer apiResources to JSON API
 * @function
 * @param {[Object]} rows Data rows from datasource
 * @param {Object} query Query parameters
 * @returns {Object} Serialized apiResources object
 */
const apiResourcesSerializer = (rows, query) => {
  accountIndexSerializerOptions.topLevelLinks = {
    self: querySelfLink(accountIndexEndpoint, query),
  };
  return new JSONAPISerializer(apiResourceType, accountIndexSerializerOptions).serialize(rows);
};

/**
 * @summary Serializer apiResource to JSON API
 * @function
 * @param {Object} row Data row from datasource
 * @param {string} endpointUri Endpoint URI for creating self link
 * @returns {Object} Serialized apiResource object
 */
const apiResourceSerializer = (row) => {
  accountIndexSerializerOptions.topLevelLinks = {
    self: idSelfLink(accountIndexEndpoint, row.ACCOUNT_INDEX_CODE),
  };
  return new JSONAPISerializer(apiResourceType, accountIndexSerializerOptions).serialize(row);
};

module.exports = { apiResourcesSerializer, apiResourceSerializer };
