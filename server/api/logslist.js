const P = require('./public')
module.exports = listRoster

// 日志列表
async function listRoster (ctx) {
  const data = ctx.request.body
  let pageSize = Math.abs(data.pageSize >> 0) || 10// 分页率
  let page = Math.abs(data.page >> 0) || 1// 当前页码
  const arr = []
  let querying = P.getLogsQuery(data,arr)
  const connection = await P.mysql.createConnection(P.config.mysqlDB)
  const [rows] = await connection.execute('SELECT SQL_NO_CACHE COUNT(*) as total FROM `rosters`' + querying.replace('and', 'where'), arr)
  const total = rows[0].total// 总数量
  const pages = Math.ceil(total / pageSize)
  if (page > pages) {
    page = Math.max(1, pages)// 以防没数据
  }
  querying += ' order by id desc LIMIT ?, ?'
  arr.push((page - 1) * pageSize, pageSize)
	const [list] = await connection.execute('select * from `rosters`' + querying.replace('and', 'where'), arr)
  await connection.end()
  ctx.body = {
    success: true,
    message: '',
    data: {
      page, total, data: list
    }
  }
}
