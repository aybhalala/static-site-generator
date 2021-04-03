const express = require('express');
const ejs = require('ejs');
const path = require('path');
const _ = require('lodash');
const fse = require('fs-extra');

class StaticSiteGenerator {
  /**
     *
     * @param {Object} options Options to initiate the server
     * @param {Object} options.routes Routes
     * @param {string} options.viewsPath Path to the views directory in the project
     * @param {string} options.publicPath Path to the public directory in the project. This contains stylesheets, scripts and all public files.
     * @param {string} options.port Port for starting the dev server.
     */
  constructor(options = {}) {
    const {
      routes, viewsPath = 'views', publicPath = 'public', port = 3000,
    } = options;
    if (!routes) {
      throw new Error('routes parameter missing');
    }
    this.app = express();
    this.rootPath = process.cwd();
    this.viewsPath = path.join(this.rootPath, viewsPath);
    this.publicPath = path.join(this.rootPath, publicPath);
    this.routes = routes;
    this.port = port;

    this.app.set('views', this.viewsPath);
    this.app.set('view engine', 'html');
    this.app.engine('html', ejs.renderFile);
    this.app.use(express.static(this.publicPath));
    _.forOwn(routes, (v, k) => {
      this.app.get(this.fixGetPath(k), (req, res) => res.render(v));
    });
  }

  // eslint-disable-next-line class-methods-use-this
  fixGetPath(getPath) {
    let newGetPath = getPath;
    if (!_.startsWith(newGetPath, '/')) newGetPath = `/${newGetPath}`;
    if (_.endsWith(newGetPath, '/')) newGetPath = `${newGetPath}index.html`;
    if (!_.endsWith(newGetPath, '.html')) {
      throw new Error("routes path should either end with '/' or with '.html'");
    }
    return newGetPath;
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Server is listening at port ${this.port}`);
    });
  }

  async build() {
    const isDir = (p) => _.endsWith(p, '/');
    try {
      console.log('Build called');
      console.log(`viewsPath = ${this.viewsPath}`);
      console.log(`publicPath = ${this.publicPath}`);
      const buildPath = path.join(this.rootPath, 'build');
      await fse.ensureDir(buildPath);
      await fse.emptyDir(buildPath);
      await fse.copy(this.publicPath, buildPath);
      _.forOwn(this.routes, async (v, k) => {
        let fileName = path.join(buildPath, k);
        if (isDir(k)) {
          await fse.ensureDir(fileName);
          fileName += '/index.html';
        }
        const html = await ejs.renderFile(path.join(this.viewsPath, v));
        await fse.outputFile(fileName, html);
      });
    } catch (e) {
      console.log('There were errors in building the website');
      throw new Error(e);
    }
  }
}

module.exports = StaticSiteGenerator;
