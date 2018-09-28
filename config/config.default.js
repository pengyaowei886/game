'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1536805618764_2318';

  // add your config here
  //登录中间件
  config.middleware = ['loginVerify'];
  return config;
};
