'use strict';

var fs          = require('fs'),
    path        = require('path'),
    Promise     = require('bluebird'),
    util        = require('util'),
    storage     = require('@google-cloud/storage'),
    errors      = require('../../core/server/errors'),
    utils       = require('../../core/server/utils'),
    baseStore   = require('../../core/server/storage/base'),
    options     = {},
    bucket;

function GStore(config) {
    baseStore.call(this);
    options = config || {};

    var gcs = storage({
        projectId: options.projectId,
        keyFilename: options.key
    });
    bucket = gcs.bucket(options.bucket);

}

util.inherits(GStore, baseStore);

GStore.prototype.save = function(image) {
    var _self = this;
    if (!options) return Promise.reject('google cloud storage is not configured');

    var targetDir = _self.getTargetDir(),
    googleStoragePath = 'https://' + options.bucket + '.storage.googleapis.com/',
    targetFilename;

    return this.getUniqueFileName(this, image, targetDir).then(function (filename) {
        targetFilename = filename
        var opts = {
            destination: targetDir + targetFilename
        };
        return new Promise(function(resolve, reject) {
            bucket.upload(image.path, opts, function(err, file) {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(file);
                return;
            });
        })
    }).then(function(file){
        return new Promise(function(resolve, reject) {
            file.makePublic(function(err, apiResponse) {
                if(err) {
                    reject(err);
                    return;
                }
                resolve();
                return;
            });
        })
    }).then(function () {
        return googleStoragePath + targetDir + targetFilename;
    }).catch(function (e) {
        errors.logError(e);
        return Promise.reject(e);
    });

};

// middleware for serving the files
GStore.prototype.serve = function() {
    // a no-op, these are absolute URLs
    return function (req, res, next) {
      next();
    };
};

GStore.prototype.exists = function (filename) {
  return this.bucket.file(filename).exists();
};

GStore.prototype.read = function (filename) {
  var rs = this.bucket.file(filename).createReadStream(), contents = '';
  return new Promise(function (resolve, reject) {
    rs.on('error', function(err){
      return reject(err);
    });
    rs.on('data', function(data){
      contents += data;
    });
    rs.on('end', function(){
      return resolve(content);
    });
  });
}

GStore.prototype.delete = function(filename) {
  return new Promise(function (resolve, reject) {
    var file = this.bucket.file(filename);
    file.delete(function(err, apiResponse) {
      if (err) { return reject(err); }
      resolve(apiResponse);
    });
  });
};

module.exports = GStore;
