'use strict';

const Controller = require('../core/baseController');
class BattleController extends Controller {
    /*
     *
     * 查看用户对战记录
     */
    async query_user_battle_record() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        //参数验证
        let uid = Number(ctx.query.uid);
        if (isNaN(uid)) { //uid是非整形
            return handerThis.error('PARAMETERS_ERROR', "uid不能转化为整形");
        }
        try {
            let data = await service.battle.query_user_battle_record(uid);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /*
   *
   * 获取对战骰子数
   */
    async get_touzi() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        let n = Number(ctx.query.n);
        if (isNaN(n)) { //n是非整形
            return handerThis.error('PARAMETERS_ERROR', "uid不能转化为整形");
        }
        try {
            let data = await service.battle.get_touzi(n);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
    /**
    *  用户开始对战
    */
    async get_battle_user() {
        let handerThis = this;
        const { ctx, app, service } = handerThis;
        let uid = Number(ctx.query.uid);
        let type= Number(ctx.query.type);
        if (isNaN(uid)) { //n是非整形
            return handerThis.error('PARAMETERS_ERROR', "uid不能转化为整形");
        }
        if (isNaN(type)) { //n是非整形
            return handerThis.error('PARAMETERS_ERROR', "type不能转化为整形");
        }

        try {
            let data = await service.battle.get_battle_user(uid,type);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }

    }
 
     /**
      *  用户进行对战 
      */
    async battle(){
        let handerThis = this;
        const { ctx, app, service } = handerThis; 
    //参数验证
    try {
        //使用插件进行验证 validate    
        ctx.validate({
            user: {//整形 必填 不允许为空字符串 
                type: 'object', required: true, allowEmpty: false
            },
            battle_user:{
                type: 'object', required: true, allowEmpty: false
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
        let user=ctx.request.body.user;
        let battle_user=ctx.request.body.battle_user;
        try {
            let data = await service.battle.battle(user,battle_user);
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']);
        }
    }
}
module.exports = BattleController;