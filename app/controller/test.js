const Controller = require('../core/baseController');
class TestController extends Controller {
    //注册
    async regite(){
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                name: {//字符串 必填 不允许为空字符串 ， 小程序使用wx.login得到的 临时登录凭证code,开发者服务器使用,临时登录凭证code获取 session_key和openid
                    type: 'string', required: true, allowEmpty: false
                },
                password: {
                    type: 'string', required: true
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
        let name = ctx.request.body.name;
        let password = ctx.request.body.password;
        try {
            let data = await service.test.regite(name, password);
            if (data == 1) {
                return handerThis.succ(data);
            }
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
        //
    }
    //登录
    async login(){
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数校验
        try {
            //使用插件进行验证 validate    
            ctx.validate({
                name: {
                    type: 'string', required: true, allowEmpty: false
                },
                password: {
                    type: 'string', required: true
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
        let name = ctx.request.body.name;
        let password = ctx.request.body.password;
        try {
            let data = await service.test.login(name, password);
            if (data == 1) {
                return handerThis.succ(data);
            }
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }

    }
}
module.exports=TestController