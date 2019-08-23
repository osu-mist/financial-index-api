import { errorBuilder, errorHandler } from 'errors/errors';

import { getAccountIndexes } from '../../db/oracledb/finance-dao';

/**
 * Get account indexes
 *
 * @type {RequestHandler}
 */
const get = async (req, res) => {
  try {
    const { accountIndexCode, organizationCode } = req.query;
    if (!accountIndexCode && !organizationCode) {
      return errorBuilder(res, 400, ['At least one parameter is required.']);
    }
    // If there's additional parameters in the query object, oracle will complain
    // because it doesn't recognize them. Thus, we only add the ones we need,
    // and the ones that are defined.
    // TODO: There's got to be a less ugly way to do this.
    const params = {};
    if (accountIndexCode) {
      params.accountIndexCode = accountIndexCode;
    }
    if (organizationCode) {
      params.organizationCode = organizationCode;
    }
    const result = await getAccountIndexes(params);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

export { get };
