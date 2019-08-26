import { Serializer as JsonApiSerializer } from 'jsonapi-serializer';
import _ from 'lodash';

import { serializerOptions } from 'utils/jsonapi';
import { openapi } from 'utils/load-openapi';
import { apiBaseUrl, resourcePathLink, paramsLink } from 'utils/uri-builder';

const accountIndexProperties = openapi.definitions.AccountIndexResource.properties;
const accountIndexResourceType = accountIndexProperties.type.enum[0];
const accountIndexKeys = _.keys(accountIndexProperties.attributes.properties);
const accountIndexEndpoint = resourcePathLink(`${apiBaseUrl}/finance`, 'account-indexes');

const activityCodeProperties = openapi.definitions.ActivityCodeResource.properties;
const activityCodeResourceType = activityCodeProperties.type.enum[0];
const activityCodeKeys = _.keys(activityCodeProperties.attributes.properties);
const activityCodesEndpoint = resourcePathLink(`${apiBaseUrl}/finance`, 'activity-codes');

const accountIndexSerializerArgs = {
  identifierField: 'accountIndexCode',
  resourceKeys: accountIndexKeys,
  resourceUrl: accountIndexEndpoint,
  enableDataLinks: true,
  resourceType: accountIndexResourceType,
};

/**
 * @summary Serializer accountIndexes to JSON API
 * @function
 * @param {[Object]} rows Data rows from data source
 * @param {Object} query Query parameters
 * @returns {Object} Serialized accountIndexes object
 */
const accountIndexesSerializer = (rows, query) => new JsonApiSerializer(
  accountIndexResourceType,
  serializerOptions({
    ...accountIndexSerializerArgs,
    ...{
      topLevelSelfLink: paramsLink(accountIndexEndpoint, query),
      query,
    },
  }),
).serialize(rows);

/**
 * @summary Serializer accountIndex to JSON API
 * @function
 * @param {Object} row Data row from data source
 * @param {string} endpointUri Endpoint URI for creating self link
 * @returns {Object} Serialized accountIndex object
 */
const accountIndexSerializer = (row) => new JsonApiSerializer(
  accountIndexResourceType,
  serializerOptions({
    ...accountIndexSerializerArgs,
    ...{ topLevelSelfLink: resourcePathLink(accountIndexEndpoint, row.accountIndexCode) },
  }),
).serialize(row);

const activityCodeSerializerArgs = {
  identifierField: 'activityCode',
  resourceKeys: activityCodeKeys,
  resourceUrl: activityCodesEndpoint,
  enableDataLinks: true,
  resourceType: activityCodeResourceType,
};

/**
 * @summary Serializer activityCodes to JSON API
 * @function
 * @param {[Object]} rows Data rows from data source
 * @param {Object} query Query parameters
 * @returns {Object} Serialized activityCodes object
 */
const activityCodesSerializer = (rows, query) => new JsonApiSerializer(
  activityCodeResourceType,
  serializerOptions({
    ...activityCodeSerializerArgs,
    ...{
      topLevelSelfLink: paramsLink(activityCodesEndpoint, query),
      query,
    },
  }),
).serialize(rows);

/**
 * @summary Serializer activityCode to JSON API
 * @function
 * @param {Object} row Data row from data source
 * @param {string} endpointUri Endpoint URI for creating self link
 * @returns {Object} Serialized activityCode object
 */
const activityCodeSerializer = (row) => new JsonApiSerializer(
  activityCodeResourceType,
  serializerOptions({
    ...activityCodeSerializerArgs,
    ...{ topLevelSelfLink: resourcePathLink(activityCodesEndpoint, row.activityCode) },
  }),
).serialize(row);

export {
  accountIndexesSerializer,
  accountIndexSerializer,
  activityCodesSerializer,
  activityCodeSerializer,
};
