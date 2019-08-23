import { errorBuilder, errorHandler } from 'errors/errors';

import { getAccountIndexById } from '../../../db/oracledb/finance-dao';

/**
 * Get a specific account index
 *
 * @type RequestHandler
 */
const get = async (req, res) => {
  try {
    const { accountIndexCodeId } = req.params;
    const result = await getAccountIndexById({ accountIndexCodeId });
    if (!result) {
      errorBuilder(res, 404, 'The account index code was not found.');
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

export { get };
