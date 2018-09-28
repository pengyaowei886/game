'use strict';



const Controller = require('../core/baseController');
class EquipmentController extends Controller {
 /*
 *
 * 查看用户装备信息
 */
 async query_user_equ(){
    let handerThis = this;
    const { ctx, app, service} = handerThis; 
    //参数验证
    let uid=Number(ctx.query.uid);
    if (isNaN(uid)) { //uid是非整形
      throw new Error('uid参数异常');
    }
    try {
        let data =await service.equipment.query_user_equ(uid);
        return handerThis.succ(data);
    } catch (error) {
        return handerThis.error('HANDLE_ERROR', error['message']); 
    }
  }
 /*
  *用户购买装备
  */
 async user_buy_equ(){
    let handerThis = this;
    const { ctx, app, service} = handerThis; 
    //参数验证
    try {
        //使用插件进行验证 validate    
        ctx.validate({
            uid: {//整形 必填 不允许为空字符串 
                type: 'int', required: true, allowEmpty: false
            },
            equ_id:{
                type: 'int', required: true, allowEmpty: false
            },
            place:{
                type: 'int', required: true, allowEmpty: false
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
    let uid=ctx.request.body.uid;
    let equ_id=ctx.request.body.equ_id;
    let place=ctx.request.body.place;
    try {
        let data = await service.equipment.user_buy_equ(uid,equ_id,place);
        return handerThis.succ(data);
    } catch (error) {
        return handerThis.error('HANDLE_ERROR', error['message']);  
    }
    
  }
}
module.exports=EquipmentController;