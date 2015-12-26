'use strict';

var fs          = require('fs'),
    path        = require('path'),
    Promise     = require('bluebird'),
    util        = require('util'),
    gcloud      = require('gcloud'),
    errors      = require('../../core/server/errors'),
    utils       = require('../..//core/server/utils'),
    baseStore   = require('../../core/server/storage/base'),
    options     = {},
    bucket;

function GStore(config) {
    options = config || {};

    var gcs = gcloud.storage({
        projectId: options.projectId,
        keyFilename: options.key
    });

    bucket = gcs.bucket(options.bucket);
    Promise.promisifyAll(bucket);
}

util.inherits(GStore baseStore);

GStore.prototype.save = function(image) {
    var _self = this;
    if (!options) return Promise.reject('google cloud storage is not configured');

    var targetDir = _self.getTargetDir(),
    googleStoragePath = options.bucket + 'storage.googleapis.com/',
    targetFilename;

    return this.getUniqueFileName(this, image, targetDir).then(function (filename) {
        targetFilename = filename
        var opts = {
            destination: targetDir+ targetFilename;
        }
        return bucket.upload(image.path, opts);
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


module.exports = GStore;