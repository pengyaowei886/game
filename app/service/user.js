
const Service = require('egg').Service;
class UserService extends Service {
    /*
    * 验证用户登录身份
    *  2018年9月17日
    */
    async LoginCode(code, userInfo) {//接收客户端发送过来的信息，其中包括code和appid
        /*
        * 首先读取本地 3_rdSession 是否存在，如果存在。判断是否过期。过期再生成一个存放本地（前端做）
        * 如果不存在 往下走
        */
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord
        let databack = 0;
        let code = userInfo.code;
        //console.log("code:",code);
        let appid = app.config.app.game.game_appid;
        let secret = app.config.app.game.game_appid;
        let r_url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + appid + "&secret=" + secret + "&js_code=" + code + "&grant_type=authorization_code";
        let res1 = await ctx.curl(r_url, {
            method: "GET",
            contentType: "json",
            dataType: "json"
        });
        //用户服务器返回的数值
        //console.log("微信返回的信息：",res1.body);
        let session_key = JSON.parse(res1.body).session_key;//session_key
        let open_id = JSON.parse(res1.body).open_id;//open_id
        /*
         ** 拿到session_key和open_id，3_rdSession（随机生成）为key，session_key和open_id为value 存入微信小游戏缓存目录，下次登录直接读取，要设置有效期
         */

        //解密用户信息
        let signature2 = sha1(body.userInfo.rawData + session_key);
        if (body.userInfo.signature != signature2) {
            return res.json("数据签名校验失败");
        }
        // 解密
        let pc = new WXBizDataCrypt(appid, sessionkeyList[i]);
        let data = pc.decryptData(body.userInfo.encryptedData, body.userInfo.iv);
        // console.log('解密后用户信息: ', data);
        // console.log('解密后用户信息类型: ', typeof data);
        let result_user = db.collection('user').findOne({ open_id: open_id }, { _id: 1 });
        //查询条件
        let filter = {
        }
        if (result_user._id) {
            filter._id = result_user._id;
        } else {
            let seqs = await handerThis.ctx.service.counter.getNextSequenceValue('user', 1); //获取自增序列
            filter._id = seqs;
        }
        //更新字段
        let update = {
            $set: {
                open_id: open_id,
                name: data,//要修改
                head_pic: data,//要修改
                play_pic:"http://127.0.0.1/public/user.png",
                name_allow: 1, //名字是否可以修改 0不可修改 1可修改
                now_strength: 10,
                max_strength: 10,
                order: seqs,//排名
                is_test: 0 //是否完成引导页 0未完成 1已完成
            }
        }
        //操作参数
        let options = {
            upsert: true//如果没有数据新增一条 
        }
        let yuanzicaozuo = await db.collection('user').findOneAndUpdate(filter, update, options);
        if (yuanzicaozuo.result.ok != 1) {
            throw new Error("更新用户数据失败");
        }
        //生成该用户的初始装备信息
        await db.collection('user_equ').insertOne({ _id: uid, head: {}, hand: {}, body: {}, foot: {}});
        return databack;
    };
    /*
    * 查看用户基本信息
    */
    async query_user_info(uid) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord
        //查询是否存在未完成的战斗记录
        let exist = await db.collection('battle').findOne({ _id: uid });

        if (exist) {
            //删除对战表信息
            await db.collection('battle').deleteOne({ _id: uid });
            //装备清空
            await db.collection('user_equ').updateOne({ _id: uid }, {
                $set: {
                    head: {},
                    hand: {},
                    body: {},
                    foot: {}
                }
            });
            //体力清0
            await db.collection('user').updateOne({ _id: uid }, {
                $set: {
                    now_strength: 0
                }
            })
        }
        let options = {
            name: 1,
            play_pic: 1,//游戏人物形象
            head_pic: 1,
            head_num: 1,
            now_strength: 1,
            max_strength: 1,
            money: 1,
            is_test: 1 //是否完成引导页面 
        };
        let result = await db.collection('user').findOne({ _id: uid }, { projection: options });
        if (result) {
            return result;
        } else {
            throw new Error("没有这个uid");
        }
    }
    /*
    ** 定时任务（每一个小时增加用户一点体力）
    */
    async add_strength() {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord
        let result = await db.collection('user').find({}, { projection: { 'now_strength': 1, 'max_strength': 1 } }).toArray();
        let id_array = [];
        //遍历出体力值没有达到最大的玩家id
        for (let i = 0; i < result.length; i++) {
            if (result[i].now_strength != result[i].max_strength) {
                id_array.push(result[i]._id);
            }
        }
        //增加一点体力
        if (id_array.length != 0) {
            await db.collection('user').updateMany({ _id: { $in: id_array } }, { $inc: { now_strength: 1 } });
        }
    }
    /**
     * 获取用户分享信息
     */
    async get_share_info(uid) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord
        //获取用户配置
        let user_result = await db.collection('user').findOne({ _id: uid });
        if (!user_result == null || !(user_result instanceof Object)) {
            throw new Error('获取用户配置失败 uid不存在');
        }
        //查询用户分享记录
        //用户建立角色之后第一次分享
        if (!user_result.share) {
            await db.collection('user').updateOne({ _id: uid }, {
                $addToSet: {
                    share: {
                        num: 1,
                        time: new Date()
                    }, invite_logs: []
                }
            });
        }
        //重复分享
        //查找当天分享记录
        let share_now = await db.collection('user').findOne({
            _id: uid, 'share.time': {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lte: new Date(new Date().setHours(0, 0, 0, 0) + 1 * 24 * 60 * 60 * 1000)
            }
        });
        if (share_now) {
            if (share_now.share.num > 3) { //大于三次，不再回复满体力
                await db.collection('user').updateOne({ _id: uid }, { $inc: { 'share.num': 1 } })
            } else {
                //回复满体力
                await db.collection('user').updateOne({ _id: uid }, {
                    $set: {
                        share: {
                            num: share_now.share.num + 1,
                            time: new Date()
                        }, now_strength: user_result.max_strength
                    }
                })
            }
        } else { //当天第一次分享
            await db.collection('user').updateOne({ _id: uid }, {
                $set: {
                    share: {
                        num: 1,
                        time: new Date()
                    }, now_strength: user_result.max_strength
                }
            })
        }
        return user_result.open_id;
    }
    /**
     * 用户完成邀请
     */
    async add_user_invite(uid, open_id) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord

        //获取用户配置
        let user_result = await db.collection('user').findOne({ _id: uid });
        if (!user_result == null || !(user_result instanceof Object)) {
            throw new Error('获取用户配置失败 uid ');
        }
        //判断自己有没有完成过其他人的邀请
        if (user_result.accept_people) {
            return null;
        }
        //查询分享人邀请记录
        let invite_logs_result = await db.collection('user').findOne({
            open_id: open_id
        })
        if (!invite_logs_result.invite_logs) {
            throw new Error('获取邀请记录失败');
        }
        //更新数据
        await db.collection('user').updateOne({ _id: uid }, { $set: { accept_people: invite_logs_result._id } }, { upsert: true });
        
        //添加到邀请记录（原子操作）
        await db.collection('user').findOneAndUpdate({
            _id: invite_logs_result._id
        }, {
                $push: {
                    invite_logs: {
                        uid: uid,                  //被邀请人uid
                        time: new Date()         //接受邀请时间
                    }
                }, $set: { max_strength: invite_logs_result.max_strength + 1 } //用户体力上限+1
            }
        );
        return null;
    }
    /**
    * 查看用户排名
    */
    async query_user_order(uid) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let return_data = {
        };
        let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord 
        let user_order = await db.collection('user').findOne({ _id: uid });
        let order = user_order.order;
        if (order >= 10) { //如果排名大于等于10
            let result = await db.collection('user').find({
                order: {
                    $gte: order - 9,
                    $lte: order
                }
            }, { projection: { name: 1, order: 1, _id: 0 } }).toArray();
            return_data.order = result;
            return return_data;
        }
        if (order < 10) { //如果排名小于10
            let result = await db.collection('user').find({
                order: {
                    $gte: 1,
                    $lte: 10
                }
            }, { projection: { name: 1, order: 1, _id: 0 } }).toArray();
            return_data.order = result;
            return return_data;
        }
    }
    /*
    * 修改用户角色名
    * 
    */
    async update_user_name(uid, name) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let data = {
            is_succ: 0
        };
        let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord 
        let result = await db.collection('user').findOne({ _id: uid });
    
        if (result.name_allow == 0) {
            return data;
        }
        if (result.name_allow == 1) {
            if (name == result.name || name == "" || name == null) {
                data.is_succ = 1
                return data;
            }
            let result_update = await db.collection('user').updateOne({ _id: uid }, { $set: { name: name, name_allow: 0 } });
            if (result_update.result.ok == 1) {
                data.is_succ = 1
                return data;
            }
        }
    }
    /*
   * 用户完成引导
   * 
   */
    async test(uid) {
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord 
        let data = {};
        let result = await db.collection('user').findOne({ _id: uid });
        if (result.is_test == 1) {
            return data;
        }
        if (result.is_test == 0) {
            let succ = await db.updateOne({ _id: uid }, { $set: { is_test: 1 } });
            if (succ.result.ok == 1) {
                return data;
            }
        }
    }
}
module.exports = UserService;