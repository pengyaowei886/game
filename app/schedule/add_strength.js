/*
 * 定时器：每一个小时增加玩家一点体力
 */
module.exports = {
    schedule: {
      interval: '1h', // 1 小时间隔
      type: 'worker', // 指定随机一个worker 都需要执行
      immediate:'true',//配置了该参数为 true 时，这个定时任务会在应用启动并 ready 后立刻执行一次这个定时任务。
     // disable:'true',//配置该参数为 true 时，这个定时任务不会被启动
      env:['local']//仅在指定的环境下才启动该定时任务。

    },
    async task(ctx) {
      //调用service层方法
      ctx.service.user.add_strength();
    }
  };