const SSG = require('./engine');
const routes = require('./routes');

const ssg = new SSG({
  viewsPath: '/views',
  publicPath: '/public',
  routes,
  port: 7500,
});

module.exports = ssg;
