const P = require('./public')
module.exports = saveExcel

// 保存上传记录
async function saveExcel (ctx) {
	
	let {opt_user, roster_id, arr} = ctx.request.body
	arr = JSON.parse(arr)
	const strObj={
		"合同编号": "contract_no",
		"姓名": "username",
		"性别":"member_sex",
		"身份证号": "identity_id",
		"联系方式": "telephone",
		"(至德)入职日期":"zhide_entry_time",
		"(至德)离职日期":"zhide_quit_time",
		"(厂方)入职日期":"factory_entry_time",
		"(厂方)离职日期":"factory_quit_time",
		"离职类别":"quit_work_type",
		"薪资标准": "salary_standard",
		"银行卡号": "bank_card",
		"开户行":"bank_name",
		"开户地":"bank_addr",
		"来源":"member_source",
		"参考返费":"reference_fee",
		"体检发票":"medical_invoice",
		"资料入库": "data_in",
		"其他1": "content_1",
		"其他2": "content_2"
	}
	const vlist = Object.values(strObj)
	const keylist = Object.keys(strObj)
	let list = []
	for(var i=0;i<arr.length;i++){
		arr[i].map(v=>{
			let obj = {}
			for(var j in v){
				if(j != "序号"){
					obj[strObj[j]] = v[j]
				}
			}
			const create_time = P.getStrTime()
			list.push(Object.assign({}, obj, {
			    opt_user,create_time,roster_id
			}))
		})
	}
	vlist.push('opt_name')
	vlist.push('create_time')
	const connection = await P.mysql.createConnection(P.config.mysqlDB)
	let resultlist=[]
	let keys = Object.keys(list[0])
	for(var i=0;i<list.length;i++){
	  // console.log(JSON.stringify(list[i]))
	  const [result] = await connection.execute(`INSERT INTO members_group (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`, Object.values(list[i]))
	  resultlist.push(result)	  
	}
	const ids = resultlist.map(v=>v.insertId)
	const user = ctx.state.userInfo
	const opt_logs_data = {
	  opt_user: opt_user,
	  opt_content: `excel导入,生成id集合为:`+JSON.stringify(ids)+`,操作人：`+opt_user+`,关联名册ID:`+roster_id,
	  opt_time:P.getStrTime(),
	  opt_ip:user.login_ip
	}
	// 添加日志
	await connection.execute(`INSERT INTO logs (${Object.keys(opt_logs_data).join(',')}) VALUES (${Object.keys(opt_logs_data).map(() => '?').join(',')})`, Object.values(opt_logs_data))
	
	if(resultlist.length){
		ctx.body = {
		  success: true,
		  data: resultlist
		}
	}else{
		ctx.body = {
		  success: false,
		  message: '文件导入失败'
		}
	}
	await connection.end()
}
