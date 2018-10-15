
const Service = require('egg').Service;

class EquipmentService extends Service {

    /**
      * 查看用户装备
      */
    async query_user_equ(uid) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let data = {
            head:{},
            hand:{},
            body:{},
            foot:{}
        }
        let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord  
        let result = await db.collection('user_equ').findOne({ _id: uid });
        if (!result == null || !(result instanceof Object)) {
            throw new Error("uid不存在");
        }
        //查价格
        let price_head=await db.collection('equipment').findOne({place:1},{projection:{price:1}});
        let price_hand=await db.collection('equipment').findOne({place:2},{projection:{price:1}});
        let price_body=await db.collection('equipment').findOne({place:3},{projection:{price:1}});
        let price_foot=await db.collection('equipment').findOne({place:4},{projection:{price:1}});
       
        data.head.price=price_head.price;
        data.head._id=result.head._id||0;
        data.hand = result.hand;
        data.hand.price=price_hand.price;
        data.hand._id=result.hand._id||0;
        data.body = result.body;
        data.body.price=price_body.price;
        data.body._id=result.body._id||0;
        data.foot = result.foot;
        data.foot.price=price_foot.price;
        data.body._id=result.body._id||0;
        return data;
    }
    /**
     * 用户随机购买装备
     */
    async user_buy_equ(uid, place, num) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord  
        let data={
            
        }
        let user_info = await db.collection('user').findOne({ _id: uid });
        let result = await db.collection('equipment').findOne({place: place, num: num });
        if (result) {
            if (user_info.money < result.price) {
                data.is_succ=0;
                return data;  //金币不足
            }
            //扣除用户金币
            await db.collection('user').updateOne({ _id: uid }, { $set: { money: user_info.money - result.price } });
            //用户穿戴装备
           this.take_equ(uid,result._id,place);
           data.is_succ=1;//购买成功 
           return data; 
        } else {
            throw new Error("该装备不存在");
        }
    }
    //用户穿戴装备 (非api)
    async take_equ(uid, equ_id, place) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord
        let result = await db.collection('equipment').findOne({ _id: equ_id});
        let options = {
            $set: {}
        }
        if (place == 1) {
            options.$set = {
                head: {
                    _id: equ_id,
                    name: result.name,
                    strength: result.strength,
                    naijiu: result.naijiu
                }
            }
        }
        if (place == 2) {
            options.$set = {
                hand: {
                    _id: equ_id,
                    name: result.name,
                    skill_name: result.skill_name,
                    attack: result.attack
                }
            }
        }
        if (place == 3) {
            options.$set = {
                body: {
                    _id: equ_id,
                    name: result.name,
                    strength: result.strength,
                    naijiu: result.naijiu
                }
            }
        }
        if (place == 4) {
            options.$set = {
                foot: {
                    _id: equ_id,
                    name: result.name,
                    strength: result.strength,
                    naijiu: result.naijiu
                }
            }
        }
        await db.collection('user_equ').updateOne({ _id: uid }, options);
    }
}

module.exports = EquipmentService;