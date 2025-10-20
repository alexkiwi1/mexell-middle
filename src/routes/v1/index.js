const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const healthRoute = require('./health.route');
const camerasRoute = require('./cameras.route');
const mediaRoute = require('./media.route');
const frigateRoute = require('./frigate.route');
const employeesRoute = require('./employees.route');
const zonesRoute = require('./zones.route');
const analyticsRoute = require('./analytics.route');
const websocketRoute = require('./websocket.route');
const mobileRoute = require('./mobile.route');
const performanceRoute = require('./performance.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  // Frigate API routes
  {
    path: '/',
    route: healthRoute,
  },
  {
    path: '/',
    route: camerasRoute,
  },
  {
    path: '/',
    route: mediaRoute,
  },
  {
    path: '/',
    route: frigateRoute,
  },
  {
    path: '/',
    route: employeesRoute,
  },
  {
    path: '/',
    route: zonesRoute,
  },
      {
        path: '/',
        route: analyticsRoute,
      },
      {
        path: '/',
        route: websocketRoute,
      },
      {
        path: '/',
        route: mobileRoute,
      },
      {
        path: '/',
        route: performanceRoute,
      },
    ];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
