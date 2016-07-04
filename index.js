/**
 * @file index
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project pomegranate-express-preroute-middleware
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

"use strict";
var _ = require('lodash');

/**
 * Configures the Express application and mounts all pre-route middleware.
 * @module PreMiddleware
 * @injector {None} Adds nothing to the injector.
 * @property {Object} options Plugin Options
 * @property {Array} options.order Mount order of middleware functions.
 *
 */

module.exports = {
  options: {
    middlewareOrder: ['compress', 'serveStatic','responseTime', 'logger']
  },
  metadata: {
    name: 'PreRouter',
    type: 'none',
    optional: ['Middleware']
  },
  plugin: {
    load: function(inject, loaded){
      var self = this;
      inject(function(Express, Middleware, ExpressConfig){

        // Bring in all of the Express configurations.
        self.Logger.log('Configuring Express.')
        var a = _.chain(ExpressConfig)
          .map(function(fn, prop){
            return {name: prop, fn: fn}
          })
          .filter(function(obj) {
            return _.isFunction(obj.fn)
          })
          .each(function(confFn){
            self.Logger.log('Setting config for ' + confFn.name)
            confFn.fn(Express)
          })
          .value()

        // Bring in all of the merged middlewares.
        self.Logger.log('Adding Pre-Router middleware.')
        _.chain(self.options.middlewareOrder)
          .map(function(p){
            return {fn: Middleware[p], name: p}
          })
          .filter(function(mw){
            return _.isFunction(mw.fn);
          })
          .each(function(vmw){
            self.Logger.log(vmw.name + ' Middleware added before routes.');
            Express.use(vmw.fn)
          })
          .value()
      });

      loaded(null, null)
    },
    start: function(done){
      done()
    },
    stop: function(done){
      done()
    }
  }
}