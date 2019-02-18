const P = require('./public')
module.exports = getRosterDetailById

// 获取用户信息
async function getRosterDetailById (ctx) {
  let id = ctx.request.body.id >> 0
  const connection = await P.mysql.createConnection(P.config.mysqlDB)
  const [list] = await connection.execute('SELECT * FROM members_group where id=?', [id])
  const success = list.length === 1
  await connection.end()
  ctx.body = {
    success,
    message: success ? '' : '没有该条数据',
    data: success ? list[0] : {}
  }
}
