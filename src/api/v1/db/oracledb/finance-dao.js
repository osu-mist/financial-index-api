import _ from 'lodash';

import { getConnection } from './connection';
import contrib from './contrib/contrib';
import * as financeSerializer from '../../serializers/finance-serializer';

/**
 * Return a list account indexes
 *
 * @param {string} query query
 * @returns {Promise} Promise object represents a list of account indexes
 */
const getAccountIndexes = async (query) => {
  const connection = await getConnection();
  try {
    const { rows } = await connection.execute(
      contrib.getAccountIndexCodeQuery(query),
      query,
    );
    const serializedAccountIndexes = financeSerializer.accountIndexesSerializer(rows, query);
    return serializedAccountIndexes;
  } finally {
    connection.close();
  }
};

/**
 * Return a specific account index code
 *
 * @param {string} query
 * @returns {Promise} Promise object represents a specific account index code
 */
const getAccountIndexById = async (query) => {
  const connection = await getConnection();
  try {
    const { rows } = await connection.execute(
      contrib.getAccountIndexCodeQuery(query),
      query,
    );
    if (_.isEmpty(rows)) {
      return undefined;
    }
    if (rows.length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else {
      const [row] = rows;
      const serializedAccountIndex = financeSerializer.accountIndexSerializer(row);
      return serializedAccountIndex;
    }
  } finally {
    connection.close();
  }
};

/**
 * Return a list activity codes
 *
 * @param {string} query
 * @returns {Promise} Promise object represents a list of activity codes
 */
const getActivityCodes = async (query) => {
  const connection = await getConnection();
  try {
    const { rows } = await connection.execute(
      contrib.getActivityCodeQuery(query),
      query,
    );
    const serializedActivityCodes = financeSerializer.activityCodesSerializer(rows, query);
    return serializedActivityCodes;
  } finally {
    connection.close();
  }
};

/**
 * Return a specific activity code
 *
 * @param {string} query
 * @returns {Promise} Promise object represents a specific activity code
 */
const getActivityCodeById = async (query) => {
  const connection = await getConnection();
  try {
    const { rows } = await connection.execute(
      contrib.getActivityCodeQuery(query),
      query,
    );
    if (_.isEmpty(rows)) {
      return undefined;
    }
    if (rows.length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else {
      const [row] = rows;
      const serializedActivityCode = financeSerializer.activityCodeSerializer(row);
      return serializedActivityCode;
    }
  } finally {
    connection.close();
  }
};

export {
  getAccountIndexes,
  getAccountIndexById,
  getActivityCodes,
  getActivityCodeById,
};
