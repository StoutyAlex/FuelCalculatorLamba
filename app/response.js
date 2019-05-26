const headers = {
  'X-Content-Type-Options': 'nosniff',
  'access-control-allow-headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'access-control-allow-methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
  'access-control-allow-origin': '*',
  'Content-Type': 'application/json',
};

module.exports = {
  send: (callback, data) => callback(null, {
    statusCode: 200,
    isBase64Encoded: false,
    headers,
    body: JSON.stringify({
      success: true,
      data,
    }),
  }),
  error: (callback, err, code=500) => {
    if (!err || err == {}) {
      err = 'Unexpected error occurred.';
    }
    callback(null, {
      statusCode: code,
      isBase64Encoded: false,
      headers,
      body: JSON.stringify({
        success: false,
        error: err,
      }),
    });
  },
};
