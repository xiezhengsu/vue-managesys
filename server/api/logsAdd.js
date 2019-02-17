const P = require('./public')
module.exports = logsAdd

// 添加日志
async function logsAdd (ctx) {
  const data = ctx.request.body
  const user = ctx.state.userInfo// 获取用户信息
  let err
  const obj = {
    opt_name: user.user_name,
    opt_content: data.opt_content,
	opt_ip: data.opt_ip
  }
  const create_time = P.getStrTime()
  const array = [user.user_name, data.opt_content, data.opt_ip, create_time]
  if (!err) {
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
	const [result] = await connection.execute('INSERT INTO `logs` (opt_name,opt_content,opt_ip,opt_time) VALUES (?,?,?)', array)
	data.id = result.insertId// 插入数据库的ID
    await connection.end()
  }
  ctx.body = {
    success: !err,
    message: err,
    data: {
      data
    }
  }
}
