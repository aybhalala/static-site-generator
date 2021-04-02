const SSG = require('./engine');
const routes = require('./routes');

const ssg = new SSG({
  fileExtension: 'html',
  viewsPath: '/views',
  publicPath: '/public',
  routes,
  port: 7500,
});

module.exports = ssg;
