import { errorBuilder, errorHandler } from 'errors/errors';

import { getActivityCodeById } from '../../../db/oracledb/finance-dao';

/**
 * Get a specific activity code
 *
 * @type {RequestHandler}
 */
const get = async (req, res) => {
  try {
    const { activityCodeId } = req.params;
    const result = await getActivityCodeById({ activityCodeId });
    if (!result) {
      errorBuilder(res, 404, 'The activity code was not found.');
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

export { get };
