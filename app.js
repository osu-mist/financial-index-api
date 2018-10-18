const appRoot = require('app-root-path');
const config = require('config');
const express = require('express');
const fs = require('fs');
const yaml = require('js-yaml');
const git = require('simple-git/promise');
const https = require('https');
const moment = require('moment');

const db = appRoot.require('/db/db');
const { badRequest, notFound, errorHandler } = appRoot.require('/errors/errors');
const { authentication } = appRoot.require('/middlewares/authentication');
const { logger } = appRoot.require('/middlewares/logger');
const api = appRoot.require('/package.json').name;

const {
  port,
  adminPort,
  basePathPrefix,
  keyPath,
  certPath,
  secureProtocol,
} = config.get('server');
const { basePath, info: { title } } = yaml.safeLoad(fs.readFileSync(`${appRoot}/swagger.yaml`, 'utf8'));

/**
 * @summary Initialize Express applications and routers
 */
const app = express();
const appRouter = express.Router();
const adminApp = express();
const adminAppRouter = express.Router();

/**
 * @summary Middlewares
 */
if (logger) app.use(logger);
app.use(`${basePathPrefix}${basePath}`, appRouter);
appRouter.use(authentication);

adminApp.use(`${basePathPrefix}${basePath}`, adminAppRouter);
adminAppRouter.use(authentication);
adminAppRouter.use('/healthcheck', require('express-healthcheck')());

/**
 * @summary Get application information
 */
adminAppRouter.get('/', async (req, res) => {
  try {
    const commit = await git().revparse(['--short', 'HEAD']);
    const now = moment();
    const info = {
      meta: {
        name: title,
        time: now.format('YYYY-MM-DD HH:mm:ssZZ'),
        unixTime: now.unix(),
        commit: commit.trim(),
        documentation: 'swagger.yaml',
      },
    };
    res.send(info);
  } catch (err) {
    errorHandler(res, err);
  }
});

/**
 * @summary Get account indexes
 */
appRouter.get(`/${api}`, async (req, res) => {
  try {
    const { accountIndexCode, organizationCode } = req.query;
    if (!accountIndexCode && !organizationCode) {
      res.status(400).send(badRequest(['At least one parameter is required.']));
    } else {
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
      const result = await db.getAccountIndexes(params);
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
});

/**
 * @summary Get API by unique ID
 */
appRouter.get(`/${api}/:accountIndexCodeID`, async (req, res) => {
  try {
    const { accountIndexCodeID } = req.params;
    const result = await db.getAccountIndexByID({ accountIndexCodeID });
    if (!result) {
      res.status(404).send(notFound('The account index code was not found.'));
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
});

/**
 * @summary Create and start HTTPS servers
 */
const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
  secureProtocol,
};
const httpsServer = https.createServer(httpsOptions, app);
const adminHttpsServer = https.createServer(httpsOptions, adminApp);

httpsServer.listen(port);
adminHttpsServer.listen(adminPort);
