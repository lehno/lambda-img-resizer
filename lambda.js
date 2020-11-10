'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3({ signatureVersion: 'v4' });
const BUCKET = 'immigreat-static';
const Sharp = require('sharp');

exports.handler = async (event, context) => {
  let key = event.Records[0].s3.object.key;
  let srcKey = decodeURIComponent(key.replace(/\+/g, ' '));
  let parts = key.split('/');
  let output = parts[parts.length - 1].split('.')[0];
  let format = parts[parts.length - 1].split('.')[1];

  try {
    const data = await S3
      .getObject({ Bucket: BUCKET, Key: srcKey })
      .promise();

    const result = await Sharp(data.Body, { failOnError: false })
      .resize(300, 300, { withoutEnlargement: true, fit: 'cover' })
      .rotate()
      .toBuffer();

    await S3.putObject({
      Body: result,
      Bucket: BUCKET,
      ContentType: data.ContentType,
      Key: output + '-300x300.' + format
    }).promise();

  } catch (e) {
    context.done(e);
  }
  context.done();
};
