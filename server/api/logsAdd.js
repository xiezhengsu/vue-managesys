const P = require('./public')
module.exports = logsAdd

// 添加日志
async function logsAdd (ctx) {
  const data = ctx.request.body
  const user = ctx.state.userInfo// 获取用户信息
	const create_time = P.getStrTime()
  let err
  const obj = {
    opt_user: user.user_name,
    opt_content: data.opt_content,
		opt_ip: user.login_ip,
		opt_time: create_time
  }
  
  const array = Object.keys(obj)
  if (!err) {
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
		const [result] = await connection.execute(`INSERT INTO logs (${array.join(',')}) VALUES (${array.map(() => '?').join(',')})`, Object.values(obj))
    await connection.end()
  }
  ctx.body = {
    success: !err,
    message: err
  }
}
