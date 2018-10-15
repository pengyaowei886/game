'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {

 const { router, controller, middleware } = app;
 let loginVerify=middleware.loginVerify({})//用户身份验证
// //验证用户身份
//  router.post('/ms_api/game/user/wechat_mini-app/accesstoken', controller.user.LoginCode);
//查看用户基本信息
 router.get('/ms_api/game/user/info',loginVerify, controller.user.query_user_info);
// //修改用户名字
//  router.post('/ms_api/game/user/update_name',loginVerify, controller.user.update_user_name);
// //获取用户分享信息
//  router.get('/ms_api/game/user/wechat_mini-app/share_info',loginVerify, controller.user.get_share_info);
// //用户完成邀请
//  router.post('/ms_api/game/user/wechat_mini-app/invite',loginVerify, controller.user.add_user_invite)
//查看用户装备
 router.get('/ms_api/game/user/equ',loginVerify,controller.equipment.query_user_equ);
// //查看用户对战记录
//  router.get('/ms_api/game/user/battle_record',loginVerify,controller.battle.query_user_battle_record);
// //查看用户排名
//  router.get('/ms_api/game/user/order',loginVerify,controller.user.query_user_order); 
//用户购买装备
 router.post('/ms_api/game/user/buy_equ',loginVerify,controller.equipment.user_buy_equ);
//用户准备对战
router.get('/ms_api/game/battle/begin',loginVerify,controller.battle.get_battle_user);
//用户进行攻击
router.post('/ms_api/game/battle/attack',loginVerify,controller.battle.battle);
// //用户完成新手引导
// router.post('/ms_api/game/user/test',loginVerify,controller.user.test);   
// //测试用户注册
// router.post('/ms_api/game/user/regite',controller.test.regite);   
// //测试用户登录
// router.post('/ms_api/game/user/login',controller.test.login);   
};