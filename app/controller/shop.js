
const Controller = require('../core/baseController');

class ShopController extends Controller {
/**
 * 查看商品列表
*/
    async query_shop_list(){
        let handerThis = this;
        const { ctx, app, service} = handerThis; 
         try {
            let data =await service.shop.query_shop_list();
            return handerThis.succ(data);
        } catch (error) {
            return handerThis.error('HANDLE_ERROR', error['message']); 
        }
    }
/**
* 查看商品具体信息
*/
async query_shop_equ(){
    let handerThis = this;
    const { ctx, app, service} = handerThis; 
    let equ_id=Number(ctx.query.equ_id);
    if (isNaN(equ_id)) { //uid是非整形
       return handerThis.error('PARAMETERS_ERROR', "uid不能转化为整形");
   }
     try {
        let data =await service.shop.query_shop_equ(equ_id);
        return handerThis.succ(data);
    } catch (error) {
        return handerThis.error('HANDLE_ERROR', error['message']); 
    }
}
}
module.exports=ShopController