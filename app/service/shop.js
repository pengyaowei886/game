const Service = require('egg').Service;
class ShopService extends Service{
  /**
  * 查看商品列表
  */
 async query_shop_list(){
    let handerThis = this;
    const { ctx, app } = handerThis;
    let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord  
    let result = await db.collection('shop').find({},{projection:{name:1,price:1,pic:1}}).toArray();
    return result;
  }
  /**
  * 查看商品具体信息
  */
 async query_shop_equ(equ_id){
  let handerThis = this;
  const { ctx, app } = handerThis;
  let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord  
  let result = await db.collection('shop').findOne({_id:equ_id});
  return result;
 }
}
module.exports=ShopService;