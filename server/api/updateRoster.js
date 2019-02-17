const P = require('./public')
module.exports = updateRoster

// 保存用户
async function updateRoster (ctx) {
  let data = ctx.request.body
  // data.roster_name = data.roster_name 
  let id = data.id >> 0// 编辑的花名册ID
  const user = ctx.state.userInfo
  if (user.user_type > 1 && !id) {
    // 非超管添加用户:禁止添加比自己大的用户类型
    data.user_type = Math.max(data.user_type, user.user_type)
  }
  let msg
  let arr
  const obj = {
    roster_name: data.roster_name,
    roster_pro_name: data.roster_pro_name
  }
  // Object.keys(obj).forEach(key => {
//     if (data[key] === '' && key !== 'user_pic' && !msg) {
//       msg = obj[key] + '不能为空！'
//     }
//     obj[key] = data[key]
//   })

  if(user.user_type !== 1 && obj.user_type !==0 && user.user_type >= obj.user_type){
    msg = '对不起，权限超越！'
  }
  if (!msg) {
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
		// 修改
    if (id) {
      delete obj.user_name  // 修改时不能修改帐号
      delete obj.user_email // 修改时不能修改邮箱
      if (user.user_type > 1 || data.pass_word === P.common.defaultPassword) {
        delete obj.pass_word // 不修改原密码情况
      }
      arr = Object.values(obj)
      arr.push(id)
      const [result] = await connection.execute(`UPDATE user SET ${Object.keys(obj).map(k => k + '=?').join(',')} where id=?`, arr)
      msg = result.affectedRows === 1 ? '' : '修改失败'
    } else {// 新增
      // obj.create_time = new Date().toLocaleString('zh-cn', { timeZone: 'UTC' }).replace(/[^\d-:/]+/g,' ')
      obj.create_time = P.getStrTime()
			console.log('time------', obj.create_time)
      // 先检查是否占用
      const [rows] = await connection.execute('SELECT roster_name,roster_pro_name FROM `rosters` where `roster_name`=? or `roster_pro_name`=?', [data.roster_name, data.roster_pro_name])
      if (rows.length > 0) {
        msg = rows[0].roster_name === data.roster_name ? '花名册已经被占用！' : '项目已经被占用！'
      } else {
        arr = Object.keys(obj)
        const [result] = await connection.execute(`INSERT INTO rosters (${arr.join(',')}) VALUES (${arr.map(() => '?').join(',')})`, Object.values(obj))
        msg = result.affectedRows === 1 ? '添加成功' : '添加失败'
      }
    }
    await connection.end()
  }
  ctx.body = {
    success: !msg,
    message: msg,
    data: {}
  }
}

function getCurrentTime() {
	var d = new Date()
	return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()
}