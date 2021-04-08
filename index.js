'use strict';

const { Storage } = require('@google-cloud/storage');
const BaseStore   = require('ghost-storage-base');
const path        = require('path');
let options     = {};

class GStore extends BaseStore {
    constructor(config = {}){
        super(config);
        options = config;

        const gcs = new Storage({
            keyFilename: options.key
        });

        this.bucket = gcs.bucket(options.bucket);
        this.assetDomain = options.assetDomain || `${options.bucket}.storage.googleapis.com`;
        

        if(options.hasOwnProperty('assetDomain')){
            this.insecure = options.insecure;
        }
        
        this.maxAge = options.maxAge || 2678400;
    }

    async save(image) {
        if (!options) {
            throw new Error('Google Cloud Storage is not configured.')
        }

        const targetDir = this.getTargetDir();
        const googleStoragePath = `http${this.insecure?'':'s'}://${this.assetDomain}/`;
        let targetFilename;

        const newFile = await this.getUniqueFileName(image, targetDir);
        targetFilename = newFile;

        const opts = {
            destination: newFile,
            metadata: {
                cacheControl: `public, max-age=${this.maxAge}`
            },
            public: true
        };
        
        await this.bucket.upload(image.path, opts);
        return googleStoragePath + targetFilename;
        
    }

    // middleware for serving the files
    serve() {
        // a no-op, these are absolute URLs
        return function (req, res, next) { next(); };
    }

    async exists (filename, targetDir) {
        const data = await this.bucket.file(path.join(targetDir, filename)).exists();
        return data[0];
    }

    read (filename) {
        const rs = this.bucket.file(filename).createReadStream();
        let contents = null;

        return new Promise((resolve, reject) => {
            rs.on('error', err => {
                return reject(err);
            });

            rs.on('data', data => {
                if (!contents) {
                    contents = data;
                } else {
                    contents = Buffer.concat([contents, data]);
                }
            });

            rs.on('end', () => {
                return resolve(contents);
            });
      });
    }

    delete (filename) {
        return this.bucket.file(filename).delete();
    }
}

module.exports = GStore;
