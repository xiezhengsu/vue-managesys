const P = require('./public')
module.exports = updateRosterMember

// 保存用户
async function updateRosterMember (ctx) {
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
  let arr_log
  data.roster_id = data.sort_id
  
  const opt_logs_data = {
    opt_user: data.opt_user,
    opt_ip:data.opt_ip
  }
  delete data.sort_id
  delete data.opt_ip
  const obj = data
  const obj_logs = opt_logs_data
  if(user.user_type !== 1 && obj.user_type !==0 && user.user_type >= obj.user_type){
    msg = '对不起，权限超越！'
  }
	data.zhide_entry_time = P.getStrTime(data.zhide_entry_time)
	data.zhide_quit_time = P.getStrTime(data.zhide_quit_time)
	data.factory_entry_time=P.getStrTime(data.factory_entry_time)
	data.factory_quit_time=P.getStrTime(data.factory_quit_time)
  if (!msg) {
    const connection = await P.mysql.createConnection(P.config.mysqlDB)
		// 修改
    if (id) {
		// 禁止操作相关属性留作后期用
//       delete obj.user_name  // 修改时不能修改帐号
//       delete obj.user_email // 修改时不能修改邮箱
      if (user.user_type > 1 || data.pass_word === P.common.defaultPassword) {
        delete obj.pass_word // 不修改原密码情况
      }
			obj.update_time = P.getStrTime()
      arr = Object.values(obj)
      arr.push(id)
			console.log('up------'+JSON.stringify(obj))
      const [result] = await connection.execute(`UPDATE members_group SET ${Object.keys(obj).map(k => k + '=?').join(',')} where id=?`, arr)
      msg = result.affectedRows === 1 ? '' : '修改失败',
			opt_logs_data.opt_content=`编辑合同编号：`+data.contract_no+`,员工姓名：`+data.username+`,名册id:`+data.roster_id
			    
    } else {// 新增
      // obj.create_time = new Date().toLocaleString('zh-cn', { timeZone: 'UTC' }).replace(/[^\d-:/]+/g,' ')
      obj.create_time = P.getStrTime()
			obj.update_time = P.getStrTime()
      // 先检查是否占用
      const [rows] = await connection.execute('SELECT contract_no,username FROM `members_group` where `contract_no`=? or `username`=?', [data.contract_no, data.username])
      if (rows.length > 0) {
        msg = rows[0].contract_no === data.contract_no ? '合同编号已经被占用！' : '姓名已经被占用！'
      } else {
				console.log('add------'+JSON.stringify(obj))
        arr = Object.keys(obj)
        const [result] = await connection.execute(`INSERT INTO members_group (${arr.join(',')}) VALUES (${arr.map(() => '?').join(',')})`, Object.values(obj))
        msg = result.affectedRows === 1 ? '操作成功' : '操作失败',
				opt_logs_data.opt_content=`添加合同编号：`+data.contract_no+`,员工姓名：`+data.username+`,名册id:`+data.roster_id
      }
    }
		
		// 添加日志
		opt_logs_data.opt_time = P.getStrTime()
		opt_logs_data.opt_ip = opt_logs_data.opt_ip
		arr_log = arr = Object.keys(obj_logs)
		opt_logs_data.opt_content += '  结果：'+msg
		console.log('addlogs--------',JSON.stringify(opt_logs_data))
		await connection.execute(`INSERT INTO logs (${arr_log.join(',')}) VALUES (${arr_log.map(() => '?').join(',')})`, Object.values(obj_logs))
    await connection.end()
  }
  ctx.body = {
    success: !msg,
    message: msg,
    data: {}
  }
}