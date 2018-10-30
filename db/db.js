const reqlib = require('app-root-path').require;
const config = require('config');
const _ = require('lodash');
const oracledb = require('oracledb');

const contrib = reqlib('/contrib/contrib');

const {
  accountIndexesSerializer,
  accountIndexSerializer,
  activityCodesSerializer,
  activityCodeSerializer,
} = reqlib('/serializers/jsonapi');

process.on('SIGINT', () => process.exit());

oracledb.outFormat = oracledb.OBJECT;
const dbConfig = config.get('database');

/**
 * @summary Increase 1 extra thread for every 5 pools but no more than 128
 */
const threadPoolSize = dbConfig.poolMax + (dbConfig.poolMax / 5);
process.env.UV_THREADPOOL_SIZE = threadPoolSize > 128 ? 128 : threadPoolSize;

/**
 * @summary Create a pool of connection
 * @returns {Promise} Promise object represents a pool of connections
 */
const poolPromise = oracledb.createPool(dbConfig);

/**
 * @summary Get a connection from created pool
 * @function
 * @returns {Promise} Promise object represents a connection from created pool
 */
const getConnection = () => new Promise(async (resolve, reject) => {
  poolPromise.then(async (pool) => {
    const connection = await pool.getConnection();
    resolve(connection);
  }).catch(err => reject(err));
});

/**
 * @summary Return a list account indexes
 * @function
 * @returns {Promise} Promise object represents a list of account indexes
 */
const getAccountIndexes = query => new Promise(async (resolve, reject) => {
  const connection = await getConnection();
  try {
    const { rows } = await connection.execute(
      contrib.getAccountIndexCodeQuery(query),
      query,
    );
    const jsonapi = accountIndexesSerializer(rows, query);
    resolve(jsonapi);
  } catch (err) {
    reject(err);
  } finally {
    connection.close();
  }
});

/**
 * @summary Return a specific account index code
 * @function
 * @param {string} acountIndexCode
 * @returns {Promise} Promise object represents a specific account index code
 */
const getAccountIndexByID = query => new Promise(async (resolve, reject) => {
  const connection = await getConnection();
  try {
    const { rows } = await connection.execute(
      contrib.getAccountIndexCodeQuery(query),
      query,
    );
    if (_.isEmpty(rows)) {
      /** Should return 404 if nothing found */
      resolve(undefined);
    } else if (rows.length > 1) {
      /** Should return 500 if get multiple results */
      reject(new Error('Expect a single object but got multiple results.'));
    } else {
      const [row] = rows;
      const jsonapi = accountIndexSerializer(row);
      resolve(jsonapi);
    }
  } catch (err) {
    reject(err);
  } finally {
    connection.close();
  }
});

/**
 * @summary Return a list activity codes
 * @function
 * @returns {Promise} Promise object represents a list of activity codes
 */
const getActivityCodes = query => new Promise(async (resolve, reject) => {
  const connection = await getConnection();
  try {
    const { rows } = await connection.execute(
      contrib.getActivityCodeQuery(query),
      query,
    );
    const jsonapi = activityCodesSerializer(rows, query);
    resolve(jsonapi);
  } catch (err) {
    reject(err);
  } finally {
    connection.close();
  }
});

/**
 * @summary Return a specific activity code
 * @function
 * @param {string} acountIndexCode
 * @returns {Promise} Promise object represents a specific activity code
 */
const getActivityCodeByID = query => new Promise(async (resolve, reject) => {
  const connection = await getConnection();
  try {
    const { rows } = await connection.execute(
      contrib.getActivityCodeQuery(query),
      query,
    );
    if (_.isEmpty(rows)) {
      /** Should return 404 if nothing found */
      resolve(undefined);
    } else if (rows.length > 1) {
      /** Should return 500 if get multiple results */
      reject(new Error('Expect a single object but got multiple results.'));
    } else {
      const [row] = rows;
      const jsonapi = activityCodeSerializer(row);
      resolve(jsonapi);
    }
  } catch (err) {
    reject(err);
  } finally {
    connection.close();
  }
});

module.exports = {
  getAccountIndexes,
  getAccountIndexByID,
  getActivityCodes,
  getActivityCodeByID,
};
