# Ghost Google Cloud Storage Plugin
A simple plugin to add Google Cloud Storage support for a Ghost Blog

## Installation
```bash
cd /var/www/ghost # or wherever you ran ghost-cli, this is your ghost base directory
npm install --save ghost-google-cloud-storage
```
Note that if you do not have a `package.json` file in your ghost base directory, this will warn. You do not need to add one, the `node_modules` directory will be created and populated either way. You can create one by running `npm init`.

## Create storage module
```bash
# This assumes that you are operating on your production environemnt, change the following variable if necessary.
export GHOST_ENVIRONMENT=production
# Your content path will be determined by your config file: https://docs.ghost.org/v1.0/docs/config#section-paths
# You can run the jq command to get it for you
export CONTENT_PATH=$(jq -r '.paths.contentPath // "."' config.${GHOST_ENVIRONMENT}.json)
mkdir -p ${CONTENT_PATH}/adapters/storage/gcloud
cat > ${CONTENT_PATH}/adapters/storage/gcloud/index.js << EOL
'use strict';
module.exports = require('ghost-google-cloud-storage');
EOL
```

## Configuration

Create a bucket in your google cloud project. In the storage settings you will find your project id as `x-goog-project-id`, after that you need to go to your [API Credentials](https://console.cloud.google.com/apis/credentials) settings and create a `Service account key`, choosing `JSON` as the key type.

Add this key on your root ghost folder or any folder you want.

Add a `storage` block to your `config.${GHOST_ENVIRONMENT}.json` as below:

```json
"storage": {
    "active": "gcloud",
    "gcloud": {
        "projectId": "Your_project_id",
        "key": "Your_key_path",
        "bucket": "Your_bucket_name",
        "assetDomain": "domain-for-bucket.example.com"
    }
}
```

Notes:
- For the key path, if it is in the ghost root directory, just use the name of the file. Otherwise use an absolute path.
- The `assetDomain` is an optional config entry, and is only required if you want to use a [custom domain](https://cloud.google.com/storage/docs/hosting-static-website) for your cloud storage bucket. Note that these instructions only allow for http, not https, as the storage servers do not present a custom certificate for your domain. Here is a [list of workarounds](https://cloud.google.com/storage/docs/static-website#https).

## Verify Ghost config
```bash
ghost stop
ghost run
```
You will see some logs or an error if the install was not successful. Fix any errors and then run `ghost run` again until you see the `Ghost boot` log entry.

## Restart ghost
```bash
ghost start
```

### Here is a transcript of the above, with errors
```bash

user@ghost:/var/www/ghost$ ghost stop
ghost run
Running sudo command: systemctl stop ghost_example-com
✔ Stopping Ghost
user@ghost:/var/www/ghost$ ghost run
The `ghost run` command is used by the configured Ghost process manager and for debugging. If you're not running this to debug something, you should run `ghost start` instead.
Running sudo command: node current/index.js
[2017-10-02 16:18:26] ERROR

NAME: IncorrectUsageError
CODE: MODULE_NOT_FOUND
MESSAGE: We have detected an error in your custom storage adapter.

level:critical

IncorrectUsageError: We have detected an error in your custom storage adapter.
    at new IncorrectUsageError (/var/www/ghost/versions/1.10.0/node_modules/ghost-ignition/lib/errors/index.js:79:23)
    at Object.getStorage (/var/www/ghost/versions/1.10.0/core/server/adapters/storage/index.js:43:19)
    ...

# fix the issue and retry

user@ghost:/var/www/ghost$ ghost run
The `ghost run` command is used by the configured Ghost process manager and for debugging. If you're not running this to debug something, you should run `ghost start` instead.
Running sudo command: node current/index.js
[2017-10-02 18:31:58] INFO Ghost is running in production... 
[2017-10-02 18:31:58] INFO Your blog is now available on http://example.com/ 
[2017-10-02 18:31:58] INFO Ctrl+C to shut down 
[2017-10-02 18:31:58] INFO Ghost boot 11.834s 
^C[2017-10-02 18:32:02] WARN Ghost has shut down 
[2017-10-02 18:32:02] WARN Your blog is now offline 
user@ghost:/var/www/ghost$ ghost start
✔ Validating config
Running sudo command: systemctl start ghost_example-com
✔ Starting Ghost
You can access your blog at http://example.com

```

## Contributors
- thombuchi
- prenaudin
- gcochard
