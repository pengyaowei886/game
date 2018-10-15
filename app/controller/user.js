'use strict';



const Controller = require('../core/baseController');

class UserController extends Controller {
    /*
     * 验证用户身份
     */
    async LoginCode() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                code: {//字符串 必填 不允许为空字符串 ， 小程序使用wx.login得到的 临时登录凭证code,开发者服务器使用,临时登录凭证code获取 session_key和openid
                    type: 'string', required: true, allowEmpty: false
                },
                user_info: {
                    type: 'object', required: true
                }
            }, ctx.request.body);
        } catch (e) {
            ctx.logger.warn(e);
            let logContent = e.code + ' ' + e.message + ',';
            for (let i in e.errors) {
                logContent += e.errors[i]['code'] + ' ' + e.errors[i]['field'] + ' ' + e.errors[i]['message'] + ' '
            }
            return handerThis.error('PARAMETERS_ERROR', logContent);
        }
        //业务逻辑
        let user_info = ctx.request.body.userInfo;
        let code = ctx.request.body.code;
        try {
            let data = await service.user.LoginCode(code, user_info);
            if (data == 0) {
                return handerThis.succ();
            }
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /*
     * 查看用户基本信息
     */
    async query_user_info() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        let uid = Number(ctx.query.uid);
        if (isNaN(uid)) { //uid是非整形
            return handerThis.error('PARAMETERS_ERROR', 'uid不能转化为整形');
        }
        //逻辑判断  
        try {
            let data = await service.user.query_user_info(uid);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /*
   * 修改用户名
   */
    async update_user_name() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        //参数校验
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                uid: {//字符串 必填 不允许为空字符串 // 小程序使用wx.login得到的 临时登录凭证code,开发者服务器使用,临时登录凭证code获取 session_key和openid
                    type: 'int', required: true, allowEmpty: false
                },
                name: {
                    type: 'string', required: true, allowEmpty: true
                }
            }, ctx.request.body);
        } catch (e) {
            ctx.logger.warn(e);
            let logContent = e.code + ' ' + e.message + ',';
            for (let i in e.errors) {
                logContent += e.errors[i]['code'] + ' ' + e.errors[i]['field'] + ' ' + e.errors[i]['message'] + ' '
            }
            return handerThis.error('PARAMETERS_ERROR', logContent);
        }

        //逻辑判断  
        try {
            let uid = ctx.request.body.uid;
            let name = ctx.request.body.name;
            let data = await service.user.update_user_name(uid, name);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /**
     * 获取用户分享信息
     */
    async get_share_info() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;

        let uid = handerThis.user().uid;

        //逻辑判断
        try {
            let data = await service.user.get_share_info(uid);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /**
    * 用户完成邀请
    */
    async add_user_invite() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                open_id: {//字符串 必填 不允许为空字符串 
                    type: 'string', required: true, allowEmpty: false
                }
            }, ctx.request.body);
        } catch (e) {
            ctx.logger.warn(e);
            let logContent = e.code + ' ' + e.message + ',';
            for (let i in e.errors) {
                logContent += e.errors[i]['code'] + ' ' + e.errors[i]['field'] + ' ' + e.errors[i]['message'] + ' '
            }
            return handerThis.error('PARAMETERS_ERROR', logContent);
        }
        let uid = handerThis.user().uid;

        let open_id = ctx.request.body.open_id;
        //逻辑判断
        try {
            let data = await service.user.add_user_invite(uid,  open_id);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }


    /*
     *
     * 查看用户排名
     */
    async query_user_order() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数验证
        let uid = Number(ctx.query.uid);
        if (isNaN(uid)) { //uid是非整形
            throw new Error('uid参数异常');
        }
        try {
            let data = await service.user.query_user_order(uid);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /*
     *
     * 用户完成引导
     */
    async test() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        //参数校验
        //参数验证
        let uid = Number(ctx.query.uid);
        if (isNaN(uid)) { //uid是非整形
            throw new Error('uid参数异常');
        }
        try {
            let data = await service.user.test(uid);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
}
module.exports = UserController;
