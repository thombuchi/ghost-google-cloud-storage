'use strict';

var storage     = require('@google-cloud/storage'),
    BaseStore   = require('ghost-storage-base'),
    path        = require('path'),
    Promise     = require('bluebird'),
    options     = {};

class GStore extends BaseStore {
    constructor(config = {}){
        super(config);
        options = config;

        var gcs = storage({
            projectId: options.projectId,
            keyFilename: options.key
        });
        this.bucket = gcs.bucket(options.bucket);
        this.assetDomain = options.assetDomain || `${options.bucket}.storage.googleapis.com`;
        // only set insecure from config if assetDomain is set
        if(options.hasOwnProperty('assetDomain')){
            this.insecure = options.insecure;
        }
        // default max-age is 3600 for GCS, override to something more useful
        this.maxAge = options.maxAge || 2678400;
    }

    save(image) {
        if (!options) return Promise.reject('google cloud storage is not configured');

        var targetDir = this.getTargetDir(),
        googleStoragePath = `http${this.insecure?'':'s'}://${this.assetDomain}/`,
        targetFilename;

        return this.getUniqueFileName(image, targetDir).then(newFile => {
            targetFilename = newFile;
            var opts = {
                destination: newFile,
                metadata: {
                    cacheControl: `public, max-age=${this.maxAge}`
                },
                public: true
            };
            return this.bucket.upload(image.path, opts);
        }).then(function (data) {
            return googleStoragePath + targetFilename;
        }).catch(function (e) {
            return Promise.reject(e);
        });
    }

    // middleware for serving the files
    serve() {
        // a no-op, these are absolute URLs
        return function (req, res, next) { next(); };
    }

    exists (filename, targetDir) {
        return this.bucket
            .file(path.join(targetDir, filename))
            .exists()
            .then(function(data){
                return data[0];
            })
            .catch(err => Promise.reject(err));
    }

    read (filename) {
        var rs = this.bucket.file(filename).createReadStream(), contents = null;
        return new Promise(function (resolve, reject) {
            rs.on('error', function(err){
                return reject(err);
            });
            rs.on('data', function(data){
                if (contents) {
                    contents = data;
                } else {
                    contents = Buffer.concat([contents, data]);
                }
            });
            rs.on('end', function(){
                return resolve(content);
            });
      });
    }

    delete (filename) {
        return this.bucket.file(filename).delete();
    }
}

module.exports = GStore;
