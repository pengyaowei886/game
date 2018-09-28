'use strict';
module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1536805618764_2318';

  // add your config here
  config.middleware = ['loginVerify'];

//安全验证
  config.security = {
    csrf: {
      enable: false
    }
  };
  //请求格式和是否跨域
    config.cors = {
      allowMethods: 'GET,POST,PUT,DELETE',
      credentials: true
    }

  config.mongo = {
    clients: {
      GAME: {
        host: '116.196.93.58',
        port: '27017',
        name: 'game',
        user: '',
        password: '',
        options: {useNewUrlParser: true},
      }
    }
  };
  config.app ={
    game: {
      game_client: "asbdhdkldjkdkdjd",//小游戏 应用编号
      game_secret: "dshapfdjsopjc",//小游戏应用秘钥
      game_appid: "wx85be97f2d833b05a" //小游戏 微信编号
    }
  };
  return config;
};