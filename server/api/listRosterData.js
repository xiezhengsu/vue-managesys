const P = require('./public')
module.exports = listRosterData

// 花名册列表
async function listRosterData (ctx) {
  const data = ctx.request.body
	
  let pageSize = Math.abs(data.pageSize >> 0) || 20// 分页率
  let page = Math.abs(data.page >> 0) || 1// 当前页码
  if(data.tag){
		pageSize=3000
	}
	const arr = []
  let querying = P.getMembersGroupQuery(data,arr)
  const connection = await P.mysql.createConnection(P.config.mysqlDB)
	const [rows] = await connection.execute('SELECT SQL_NO_CACHE COUNT(*) as total FROM `members_group`' + querying.replace('and', 'where'), arr)
	const total = rows[0].total// 总数量
	const pages = Math.ceil(total / pageSize)
	if (page > pages) {
		page = Math.max(1, pages)// 以防没数据
	}
	querying += ' order by id desc LIMIT ?, ?'
	arr.push((page - 1) * pageSize, pageSize)
	let [list] = await connection.execute('select * from `members_group`' + querying.replace('and', 'where'), arr)
	if(data.tag){
		[list] = await connection.execute('select `contract_no`,`username`,`member_sex`,`identity_id`,'+
		'`telephone`,`zhide_entry_time`,`zhide_quit_time`,`factory_entry_time`,`factory_quit_time`,`quit_work_type`,`salary_standard`,'+
		'`bank_card`,`bank_name`,`bank_addr`,`member_source`,`reference_fee`,`medical_invoice`,`data_in`'+
		 ',`content_1`,`content_2` from `members_group`' + querying.replace('and', 'where'), arr)
	}
	await connection.end()
  ctx.body = {
    success: true,
    message: '',
    data: {
      page, total, data: list.map(v => {
				const zhide_entry_time = P.getStrTime(v.zhide_entry_time).split(' ')[0]
				const zhide_quit_time = P.getStrTime(v.zhide_quit_time).split(' ')[0]
				const factory_entry_time = P.getStrTime(v.factory_entry_time).split(' ')[0]
				const factory_quit_time = P.getStrTime(v.factory_quit_time).split(' ')[0]

				var obj = Object.assign({}, v, {
					zhide_entry_time: zhide_entry_time,
					zhide_quit_time: zhide_quit_time,
					factory_entry_time: factory_entry_time,
					factory_quit_time: factory_quit_time,
				})
				if(!data.tag){
					const create_time =P.getStrTime(v.create_time)
					obj = Object.assign({},obj,{create_time})
				}
				return obj
			})
    }
  }
}
