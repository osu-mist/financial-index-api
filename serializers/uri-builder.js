const appRoot = require('app-root-path');
const config = require('config');
const fs = require('fs');
const yaml = require('js-yaml');
const url = require('url');

const { protocol, hostname } = config.get('server');
const { basePath } = yaml.safeLoad(fs.readFileSync(`${appRoot}/swagger.yaml`, 'utf8'));

/**
 * @summary Self link builder
 * @function
 * @param {string} id
 * @returns A self link URL
 */
const idSelfLink = (endpoint, id) => url.format({
  protocol,
  hostname,
  pathname: `${basePath}/${endpoint}/${id}`,
});

/**
 * @summary Top level query link builder
 * @function
 * @param {object} query
 * @returns A url formatted with query parameters in the query object.
 */
const querySelfLink = (endpoint, query) => url.format({
  protocol,
  hostname,
  pathname: `${basePath}/${endpoint}`,
  query,
});

module.exports = { idSelfLink, querySelfLink };
