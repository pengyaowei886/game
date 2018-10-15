const Service = require('egg').Service;
class TestService extends Service {

     //注册
     async regite(name,password){
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord  
        let result = await db.collection('test').insertOne(
             {
                 name:name,
                 password:password
             }
         );
         if(result.result.ok==1){
             return 1 ;
         }else{
             return 0;
         }
    }
    //登录
    async login(name,password){
        let handerThis = this;
        const { ctx, app } = handerThis;
        let db = this.app.mongo.get('GAME')['db'];//获取数据库WLWord  
        let result = await db.collection('test').findOne({name:name,password:password});
        if(result){
            return 1;
        }else{
            return 0;
        }
    }
}
module.exports=TestService