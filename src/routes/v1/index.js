const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const healthRoute = require('./health.route');
const camerasRoute = require('./cameras.route');
const mediaRoute = require('./media.route');
const frigateRoute = require('./frigate.route');
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
