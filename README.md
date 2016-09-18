# Ghost Google Cloud Storage Plugin
A simple plugin to add Google Cloud Storage support for a Ghost Blog

## Installation

    npm install --save ghost-google-cloud-storage

## Create storage module

Create index.js file with folder path 'content/storage/gcloud/index.js' (manually create folder if not exist)

    'use strict';
    module.exports = require('ghost-google-cloud-storage');

## Configuration

Create a bucket on your google cloud storage project. In storage settings you will find your project id as `x-goog-project-id`, after  that  you need to go to your API credentials and create a server to server auth with json key. 

Add this key on your root ghost folder or any folder you want.

Add `storage` block to file `config.js` in each environment as below:

    storage: {
        active: 'gcloud',
        'gcloud': {
            projectId: 'Your_project_id',
            key: 'Your_key_path', // if is in the ghost root folder just add the name of the file
            bucket: 'Your_bucket_name',
        }
    },

Future updates -->
Add possibility to change asset domain. Right now it uses the default  `bucket_name.storage.googleapis.com/


## Contrinutors
thombuchi
prenaudin
