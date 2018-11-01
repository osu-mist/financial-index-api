const appRoot = require('app-root-path');
const decamelize = require('decamelize');
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('lodash');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const { querySelfLink, idSelfLink } = appRoot.require('/serializers/uri-builder');

const swagger = yaml.safeLoad(fs.readFileSync(`${appRoot}/swagger.yaml`, 'utf8'));

const api = appRoot.require('/package.json').name;

const accountIndexProperties = swagger.definitions.AccountIndexResourceObject.properties;
const accountIndexResourceType = accountIndexProperties.type.example;
const accountIndexKeys = _.keys(accountIndexProperties.attributes.properties);
const accountIndexEndpoint = `${api}/account-indexes`;

const activityCodeProperties = swagger.definitions.ActivityCodeResourceObject.properties;
const activityCodeResourceType = activityCodeProperties.type.example;
const activityCodeKeys = _.keys(activityCodeProperties.attributes.properties);
const activityCodesEndpoint = `${api}/activity-codes`;

/**
 * The column name getting from database is usually UPPER_CASE.
 * This block of code is to make the camelCase keys defined in swagger.yaml be
 * UPPER_CASE so that the serializer can correctly match the corresponding columns
 * from the raw data rows.
 */
_.forEach(accountIndexKeys, (key, index) => {
  accountIndexKeys[index] = decamelize(key).toUpperCase();
});

_.forEach(activityCodeKeys, (key, index) => {
  activityCodeKeys[index] = decamelize(key).toUpperCase();
});

const accountIndexSerializerOptions = {
  attributes: accountIndexKeys,
  id: 'ACCOUNT_INDEX_CODE',
  keyForAttribute: 'camelCase',
  dataLinks: { self: row => idSelfLink(accountIndexEndpoint, row.ACCOUNT_INDEX_CODE) },
};

/**
 * @summary Serializer accountIndexes to JSON API
 * @function
 * @param {[Object]} rows Data rows from datasource
 * @param {Object} query Query parameters
 * @returns {Object} Serialized accountIndexes object
 */
const accountIndexesSerializer = (rows, query) => {
  accountIndexSerializerOptions.topLevelLinks = {
    self: querySelfLink(accountIndexEndpoint, query),
  };
  return new JSONAPISerializer(accountIndexResourceType,
    accountIndexSerializerOptions).serialize(rows);
};

/**
 * @summary Serializer accountIndex to JSON API
 * @function
 * @param {Object} row Data row from datasource
 * @param {string} endpointUri Endpoint URI for creating self link
 * @returns {Object} Serialized accountIndex object
 */
const accountIndexSerializer = (row) => {
  accountIndexSerializerOptions.topLevelLinks = {
    self: idSelfLink(accountIndexEndpoint, row.ACCOUNT_INDEX_CODE),
  };
  return new JSONAPISerializer(accountIndexResourceType,
    accountIndexSerializerOptions).serialize(row);
};

const activityCodeSerializerOptions = {
  attributes: activityCodeKeys,
  id: 'ACTIVITY_CODE',
  keyForAttribute: 'camelCase',
  dataLinks: { self: row => idSelfLink(activityCodesEndpoint, row.ACTIVITY_CODE) },
};

/**
 * @summary Serializer activityCodes to JSON API
 * @function
 * @param {[Object]} rows Data rows from datasource
 * @param {Object} query Query parameters
 * @returns {Object} Serialized activityCodes object
 */
const activityCodesSerializer = (rows, query) => {
  activityCodeSerializerOptions.topLevelLinks = {
    self: querySelfLink(activityCodesEndpoint, query),
  };
  return new JSONAPISerializer(activityCodeResourceType,
    activityCodeSerializerOptions).serialize(rows);
};

/**
 * @summary Serializer activityCode to JSON API
 * @function
 * @param {Object} row Data row from datasource
 * @param {string} endpointUri Endpoint URI for creating self link
 * @returns {Object} Serialized activityCode object
 */
const activityCodeSerializer = (row) => {
  activityCodeSerializerOptions.topLevelLinks = {
    self: idSelfLink(activityCodesEndpoint, row.ACTIVITY_CODE),
  };
  return new JSONAPISerializer(activityCodeResourceType,
    activityCodeSerializerOptions).serialize(row);
};

module.exports = {
  accountIndexesSerializer,
  accountIndexSerializer,
  activityCodesSerializer,
  activityCodeSerializer,
};
