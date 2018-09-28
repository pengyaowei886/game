
const Service = require('egg').Service;

class EquipmentService extends Service{

/**
  * 查看用户装备
  */
 async query_user_equ(uid){
    let handerThis = this;
    const { ctx, app } = handerThis;
    let data={   
    }
    let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord  
    let result = await db.collection('user_equ').findOne({_id:uid});
    if(!result == null || !(result instanceof Object)){
       throw  new Error("uid不存在");
    }
    data.head=result.head;
    data.hand=result.hand;
    data.body=result.body;
    data.foot=result.foot;
    return data;
  } 
  /**
  * 用户购买装备
  */
  async user_buy_equ(uid,equ_id,place){
    let handerThis = this;
    const { ctx, app } = handerThis;
    let is_succ=0;
    let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord 
    //查询用户装备
    let equ=await db.collection('user_equ').findOne({_id:uid});
    if(!equ){
        throw  new Error("uid不存在");
    }
    if(equ.head._id==equ_id||equ.hand._id==equ_id||equ.body._id==equ_id||equ.foot._id==equ_id){
         return is_succ;//该部位已穿戴
    }else{
       let result= await this.take_equ(uid,equ_id,place);
       if(result.result.ok==1){
        is_succ=1;
        return is_succ;
       }else{
           throw new Error("穿戴装备异常")
       }
    }
 }
   //用户穿戴装备 (非api)
   async take_equ(uid,equ_id,place){
    let handerThis = this;
    const { ctx, app } = handerThis;
    let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord
    let result = await db.collection('equipment').findOne({_id:equ_id});
    let options={
      $set:{}
    }
    if (place==1){
          options.$set={
              head:{
                   _id:equ_id,
                   name:result.name,
                   attack_num:3,
                   pic:result.pic,
                   strength:result.strength,
                   naijiu:result.strength
              }
          }
        }
    if (place==2){
          options.$set={
              hand:{
                   _id:equ_id,
                   name:result.name,
                   skill_name:result.skill_name,
                   attack:result.attack,
                   pic:result.pic,
                   texiao_pic:[]
              }
          }
     }
    if (place==3){
        options.$set={
            body:{
                 _id:equ_id,
                 name:result.name,
                 attack_num:3,
                 pic:result.pic,
                 strength:result.strength,
                 naijiu:result.strength
            }
        }
      }
    if (place==4){
        options.$set={
            foot:{
                 _id:equ_id,
                 name:result.name,
                 attack_num:3,
                 pic:result.pic,
                 strength:result.strength,
                 naijiu:result.strength
            }
        }
      }
    let result_back= await db.collection('user_equ').updateOne({_id:uid},options); 
    return result_back;
   }
}

module.exports=EquipmentService;