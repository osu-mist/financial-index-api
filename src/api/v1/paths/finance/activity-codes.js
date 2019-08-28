import { errorBuilder, errorHandler } from 'errors/errors';

import { getActivityCodes } from '../../db/oracledb/finance-dao';

/**
 * Get activity codes
 *
 * @type RequestHandler
 */
const get = async (req, res) => {
  try {
    const { activityCode } = req.query;
    if (!activityCode) {
      errorBuilder(res, 400, ['activityCode (query parameter) is required.']);
    } else {
      const params = { activityCode };
      const result = await getActivityCodes(params);
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

export { get };
