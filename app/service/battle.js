const Service = require('egg').Service;
class BattleService extends Service {
  /**
  * 查看用户对战记录
  */
  async query_user_battle_record(uid) {
    let handerThis = this;
    const { ctx, app } = handerThis;
    let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord  
    let result = await db.collection('battle_record').findOne({ _id: uid },{projection:{battle_name:1,is_succ:1}});
    let skip = result.record.length;
    let data = [];
    //取得最新的10条记录，不足10条全部显示
    if (skip >= 10) {
      for (let i = skip; i > skip - 10; i--) {
        data.push(result.record[i - 1]);
      }
      return data;
    } else {
      for (let i = skip; i > 0; i--) {
        data.push(result.record[i - 1]);
      }
      return data;
    }
  }
  /**
  *  用户开始对战 
  */
 async get_battle_user(uid, type) {
  let handerThis = this;
  const { ctx, app } = handerThis;
  let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord 
  let self_info = await db.collection('user').findOne({ _id: uid }, { projection: { name: 1, now_strength: 1 } });
  let self_equ = await db.collection('user_equ').findOne({ _id: uid });
  let data = {
    user: {

    },
    battle_user: {

    }
  }
  if(self_info.now_strength==0){
    return data;
  }
  data.user.uid = self_info._id;
  let head = 0;
  let body = 0;
  let foot = 0;
  if ( self_equ.head.strength) {
    head = self_equ.head.strength;
  }
  if (self_equ.body.strength) {
    body = self_equ.body.strength;
  }
  if (self_equ.foot.strength) {
    foot = self_equ.foot.strength;
  }
  data.user.name=self_info.name;
  data.user.strength = self_info.now_strength+head+body+foot;//自身血量
  data.user.hand_id= self_equ.hand._id || 0;//自身攻击力
  if (type == 1) { //练习 (打斗计算放在前端做)
    data.user.attack = self_equ.hand.attack || 0;//自身攻击力
    data.battle_user = data.user; //对手信息
    return data;
  }
  if (type == 2) { //匹配 (不能匹配到自己)

    let result = await db.collection('user').find({}, { projection: { _id: 1 } }).toArray();
    let random = Math.floor(Math.random() * result.length + 1);
    let i = 0;
    while (i < 100 && uid == random) {
      random = Math.floor(Math.random() * result.length + 1);
      i++;
    }
    //正式版要修改
    random = 12;


    let battle_info = await db.collection('user').findOne({ _id: random }, { projection: { name: 1, now_strength: 1 } });
    let battle_equ = await db.collection('user_equ').findOne({ _id: random });
    data.battle_user.uid = random;
   data.battle_user.name=battle_info.name;
   data.battle_user.hand_id= battle_equ.hand._id||0;
    //计算对手装备附加体力信息
    let head = 0;
    let body = 0;
    let foot = 0;
    if (battle_equ.head.strength) {
      head = battle_equ.head.strength;
    }
    if (battle_equ.body.strength) {
      body = battle_equ.body.strength;
    }
    if (battle_equ.foot.strength) {
      foot = battle_equ.foot.strength;
    }
    data.battle_user.strength = battle_info.now_strength+head+body+foot;
    //插入对战表

    db.collection('battle').insertOne({
      _id: uid,
      type: 1, //1匹配 2排位
      battle_user: battle_info._id, //对手id
      self_strength: data.user.strength, //自身体力
      battle_strength: battle_info.now_strength + head + body + foot, //对手体力
      self_attack: self_equ.hand.attack || 0, //自己攻击力
      battle_attack: battle_equ.hand.attack || 0,//对手攻击力
      head: self_equ.head.naijiu || 0, //头部装备耐久
      body: self_equ.body.naijiu || 0,  //身部装备耐久
      foot: self_equ.foot.naijiu || 0,  //脚部装备耐久
    });

    return data;
  }
  if (type == 3) { //排位 (比自己排名高，如果自身在前十，前十任选一个)
    let self_order = await db.collection('user').findOne({ _id: uid });
    let order = self_order.order; //自身排名
    let result = await db.collection('user').find({}, { order: { $lt: order } });
    let n = 0;
    if (result.length < 10) {
      n = 10
    } else {
      n = result.length;
    }
    let random = Math.floor(Math.random() * n + 1);
    let i = 0;
    while (i < 100 && order == random) {
      random = Math.floor(Math.random() * n + 1);
      i++;
    }
    //暂定
    random = 12;
    let battle_info = await db.collection('user').findOne({ _id: random }, { projection: { name: 1, head_pic: 1, now_strength: 1 } });
    let battle_equ = await db.collection('user_equ').findOne({ _id: random });
    data.battle_user.uid = random;
    // //data.battle_user.name = battle_info.name;
    // data.battle_user.now_strength = battle_info.now_strength;
    //data.battle_user.attack = battle_equ.hand.attack||0;
    //计算对手装备附加体力信息
    let head = 0;
    let body = 0;
    let foot = 0;
    if (battle_equ.head.strength) {
      head = battle_equ.head.strength;
    }
    if (battle_equ.body.strength) {
      body = battle_equ.body.strength;
    }
    if (battle_equ.foot.strength) {
      foot = battle_equ.foot.strength;
    }
    data.battle_user.name=battle_info.name;
    data.battle_user.hand_id= battle_equ.hand._id||0;
    data.battle_user.strength = battle_info.now_strength+head+body+foot;
    //插入对战表
    let a=db.collection('battle').insertOne({
      _id: uid,
      type: 2, //1匹配 2排位
      battle_user: battle_info._id, //对手id
      self_strength: data.user.strength, //自身体力
      battle_strength: battle_info.now_strength + head + body + foot, //对手体力
      self_attack: self_equ.hand.attack || 0, //自己攻击力
      battle_attack: battle_equ.hand.attack || 0,//对手攻击力
      head: self_equ.head.niajiu || 0, //头部装备耐久
      body: self_equ.body.naijiu || 0, //身部装备耐久
      foot: self_equ.body.naijiu || 0  //脚部装备耐久
    });
    return data;
  }
}
  /**
   *  开始战斗
   * 
   */
  async battle(user, battle_user) {
    let handerThis = this;
    const { ctx, app } = handerThis;
    let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord  
    let data = {};
    //用户信息
    let self_info = await db.collection('user').findOne({ _id: user.uid });
    //用户对战信息
    let res_exist = await db.collection('battle').findOne({ _id: user.uid });
    //对手信息
    let battle_info = await db.collection('user').findOne({ _id: battle_user.uid });

    if (user.touzi > battle_user.touzi) { //自己先出手
      if (user.touzi + res_exist.self_attack >= res_exist.battle_strength) {
        //击败对手 直接删除临时对战表
        await db.collection('battle').deleteOne({ _id: user.uid });
        //并删除手部武器
        await db.collection('user_equ').updateOne({ _id: user.uid }, { $set: { hand: {} } });
        //如果用户相对战斗开始之前血量减少, 修改用户血量
        if (self_info.now_strength > res_exist.self_strength) {
          await db.collection('user').updateOne({ _id: user.uid }, { $set: { now_strength: res_exist.self_strength } });
        }
        //修改装备耐久
        let options = {
          $set: {
            head: {},
            body: {},
            foot: {}
          }
        }
        if (res_exist.head > 0) {
          options.$set[`head.naijiu`] = res_exist.head;
        }else{
          options.$set[`head`] = {};
        }
        if (res_exist.body > 0) {
          options.$set[`body.naijiu`] = res_exist.body;
        }else{
          options.$set[`body`] = {};
        }
        if (res_exist.foot > 0) {
          options.$set[`foot.naijiu`] = res_exist.foot;
        }else{
          options.$set[`body`] = {};
        }
        await db.collection('user_equ').updateOne({ _id: user.uid }, options);

        //如果是匹配对战
        if (res_exist.type == 1) {
          //获得十点金币奖励
          await db.collection('user').updateOne({ _id: user.uid }, { $inc: { money: 10 } });
          //保存对战记录
          this.save_battle(user.uid, battle_user.uid, 1, 1);
        }
        //如果是排位对战
        if (res_exist.type == 2) {
          //判断排名大小，交换排名
          if (self_info.order > battle_info.order) {
            await db.collection('user').updateOne({ _id: user.uid }, { order: battle_info.order });
            await db.collection('user').updateOne({ _id: battle_user.uid }, { order: self_info.order });
          }
          //保存对战记录
          this.save_battle(user.uid, battle_user.uid, 2, 1);
        }
        data.attack = user.touzi + res_exist.self_attack;
        data.finish=1;
        data.victory=1;
        return data;
      } else {
        //未击败对手，修改临时对战表
        await db.collection('battle').updateOne({ _id: user.uid }, {
          $set: {
            battle_strength: res_exist.battle_strength - (user.touzi + res_exist.self_attack), //修改对手体力
            self_attack: 0  //修改武器攻击力 
          }
        });
        // 自己先出手 对敌人造成 xxx伤害 战斗未结束
        data.attack = user.touzi + res_exist.self_attack;
        data.finish=0;
        data.victory=0;
        return data;
      }
    } else {   //自己后出手
      //被对方击败
      if (battle_user.touzi + res_exist.battle_attack >= res_exist.self_strength) {
        //修改各位置武器耐久
        let options = {
          $set: {
          }
        }
        if (res_exist.head > 0) {
          options.$set[`head.naijiu`] = res_exist.head;
        }else{
          options.$set[`head`] = {};
        }
        if (res_exist.body > 0) {
          options.$set[`body.naijiu`] = res_exist.body;
        }else{
          options.$set[`body`] = {};
        }
        if (res_exist.foot > 0) {
          options.$set[`foot.naijiu`] = res_exist.foot;
        }else{
          options.$set[`body`] = {};
        }
        // 直接删除临时对战表
        await db.collection('battle').deleteOne({ _id: user.uid });
        if (res_exist.type == 1) { //匹配对战
          this.save_battle(user.uid, battle_user.uid, 1, 0);
        }
        if (res_exist.type == 2) { //排位对战
          this.save_battle(user.uid, battle_user.uid, 2, 0);
        }
        // 各部位装备耐久度-1
        await db.collection('user_equ').updateOne({ _id: user.uid }, options);
        //扣除用户血量
        await db.collection('user').updateOne({ _id: user.uid }, { $set: { now_strength: 0 } });
        data.attack = battle_user.touzi + res_exist.battle_attack;
        data.finish=1;
        data.victory=0;
        return data;
      } else {
        //对方攻击自己，但未击败自己
        //修改装备耐久
        let options = {
          $set: {
          }
        };
        if (res_exist.head > 0) {
          options.$set[`head`] = res_exist.head - 1;
        }
        if (res_exist.body > 0) {
          options.$set[`body`] = res_exist.body - 1;
        }
        if (res_exist.foot > 0) {
          options.$set[`foot`] = res_exist.foot - 1;
        }
        //修改自身血量
        options.$set[`self_strength`] = res_exist.self_strength - (battle_user.touzi + res_exist.battle_attack);
        //修改对方攻击值
        options.$set[`battle_attack`] = 0;
        await db.collection('battle').updateOne({ _id: user.uid }, options);
        //对手先出手 对自己造成 xxx伤害 战斗未结束
        data.attack = battle_user.touzi + res_exist.battle_attack //造成的伤害值
        data.finish=0;
        data.victory=0;
        return data;
      }
    }
  }
  /**
  *  保存对战记录
  * 
  */
  async save_battle(uid, battle_uid, type, is_succ) {
    let handerThis = this;
    const { ctx, app } = handerThis;
    let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord  
    let is_exist = await db.collection('battle_record').findOne({ _id: uid });
    let result_name=await db.collection('user').findOne({ _id: uid});
    if (!is_exist) {
      await db.collection('battle_record').insertOne({
        _id: uid, record: [
          {
            _id: 1,
            uid: battle_uid, //对手用户id
            type: type,//对战类型 1实时对战 2排位战
            battle_name:result_name.name,
            is_succ: is_succ,//是否胜利 0否 1是
            time: new Date() //对战时间 
          }
        ]
      });
    } else {
      await db.collection('battle_record').updateOne({ _id: uid }, {
        $push: {
          "record": {
            _id: is_exist.record.length + 1,
            uid: battle_uid, //对手用户id
            type: type,//对战类型 1实时对战 2排位战
            battle_name:result_name.name,
            is_succ: is_succ,//是否胜利 0否 1是
            time: new Date() //对战时间 
          }
        }
      })
    }
  }

}
module.exports = BattleService;