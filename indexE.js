import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import * as handler from './utils/handler.js';
import * as stat from './utils/static.js';
import * as session from './utils/session.js';
import * as csrf from './utils/csrf.js';
import { config } from './config.js';

const router = express();

// Checks for allowed host and protocol
router.use(handler.checkHost);

// Use Helmet for setting secure HTTP headers
router.use(helmet({
  xDnsPrefetchControl: { allow: true },
  contentSecurityPolicy: {
    directives: {
      "require-trusted-types-for": "script"
    }
  }
}));

// Parse body as JSON
router.use(bodyParser.json());

// Parese request cookies
router.use(cookieParser());

// Serve static files using utils/static.js
router.get('/static/*', handler.wrap(stat.serve, "csrf_exempt"));



// Example GET route to serve hello world json
router.get('/helloworld', handler.wrap((req, res) => {
  let url_params = req.query;                // Access GET params

  res.json({'hello world': true});
}, "csrf_exempt"));


// Create GET route to serve index
router.get('/', handler.wrap(async (req, res) => {
  let sid = await session.refresh(req, res); // Refreshes session
  await csrf.generate(res, sid);             // Generates csrf token cookie

  handler.render(res, "./views/index.ejs");
}, "csrf_exempt"));


// Example POST route for test API
router.post('/api/v0/test', handler.wrap(async (req, res) => {
  let body = await req.body;               // Access POST params

  res.json({'success': true});
}));



// Serve error page for incomplete responses
router.all('*', (req, res) => {
  if (!res.completed) {
    handler.setStatus(res, 403);
    handler.setInfo('err', "Nothing to serve :)");
    handler.sendError(res);
  }
  handler.log(req);
});

if (config.hyper) console.log("Warning: 'hyper' is set to true, but hyper-express webserver is not being used!");

// Start webserver
try {
  router.listen(3000);
  console.log('Webserver started on port 3000');
} catch (error) {
  console.log('Failed to start webserver on port 3000');
}
