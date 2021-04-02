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
     * @param {string} options.fileExtension File extension for views. Defaults to ejs.
     * @param {string} options.port Port for starting the dev server.
     */
  constructor(options = {}) {
    const {
      routes, viewsPath, publicPath, fileExtension, port = 3000,
    } = options;
    if (!routes) {
      throw new Error('routes parameter missing');
    }
    this.app = express();
    this.rootPath = process.cwd();
    this.viewsPath = path.join(this.rootPath, (viewsPath || 'views'));
    this.publicPath = path.join(this.rootPath, (publicPath || 'public'));
    this.port = port;

    this.app.set('views', this.viewsPath);
    this.app.set('view engine', (fileExtension || 'ejs'));
    this.app.engine((fileExtension || 'ejs'), ejs.renderFile);
    this.app.use(express.static(this.publicPath));
    _.forOwn(routes, (v, k) => {
      this.app.get(k, (req, res) => res.render(v));
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Server is listening at port ${this.port}`);
    });
  }

  async build() {
    try {
      console.log('Build called');
      console.log(`viewsPath = ${this.viewsPath}`);
      console.log(`publicPath = ${this.publicPath}`);
      const buildPath = path.join(this.rootPath, 'build');
      await fse.ensureDir(buildPath);
      await fse.emptyDir(buildPath);
    } catch (e) {
      console.log('There were errors in building the website');
      throw new Error(e);
    }
  }
}

module.exports = StaticSiteGenerator;
