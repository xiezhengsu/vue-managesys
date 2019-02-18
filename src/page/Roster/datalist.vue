<template>
  <div>
    <el-row class="grid-table">
      <el-form :inline="true" :model='search_data' label-position="top">
        <el-form-item label="姓名">
          <el-input v-model="search_data.username"></el-input>
        </el-form-item>
        <el-form-item label="所属名册">
					<el-select v-model="search_data.roster_id" @change="handleSelect">
					  <el-option label="全部" value=""></el-option>
					  <el-option v-for="(item,key) in sort_data" :key="key"
					             :label="item.roster_name" :value="item.id" v-if="key!=='0'">
					  </el-option>
					</el-select>
        </el-form-item>
        <el-form-item label="权限">
          <el-select v-model="search_data.read_type">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="(value,key) in read_type" :key="key"
                       :label="value" :value="key" v-if="key!=='0'">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button icon="search" type="primary" @click='onSearch'>查询</el-button>
          <el-button icon="plus" @click="add" :disabled="grade.updateArticle">添加会员</el-button>
        </el-form-item>
      </el-form>
			<el-row>
				<el-col>
					<!-- <el-input v-model="''"></el-input> -->
					<up-file ref="upload" :upload="{}" @successUpload="successUpload" @progress="onProgress"></up-file>
					<el-button type="primary" @click="uploadExcel" style="margin-left:10px" :disabled="grade.upFile">{{upText}}</el-button>
					<el-button type="warning" @click="exportExcel" style="margin-left:10px">导出文件</el-button>
				</el-col>
			</el-row>
			<el-table stripe border style="width:100%;margin-top:10px" :data="table_data.data"
			          @selection-change="handleSelectionChange">
			  <el-table-column v-for='item in table_data.tableConfig' 
					:label="item.name" :fixed='item.fixed' 
					:prop='item.key' :width='item.minWidth' 
					:key="item.id"
					:formatter="columnFormatter"
					>
					<template v-if='item.children'>
						<el-table-column 
							v-for="item1 in item.children"
							:label="item1.name" 
							:prop='item1.key' 
							:width='item1.minWidth' 
							:key="item1.key">
						</el-table-column>
					</template>
				</el-table-column>
			</el-table>

      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="search_data.page"
        :page-size="search_data.pageSize"
        layout="total, prev, pager, next,jumper"
        :total="table_data.total">
      </el-pagination>
    </el-row>
    <Sidebar ref="view">
      <div slot='title'>{{article.title}}</div>
      <div slot="content" class="sidebar_content" v-loading="loading">
        <el-row :gutter="20" class="">
          <el-col :span="6"><strong>文章分类：</strong>{{article.sort_name}}</el-col>
          <el-col :span="6"><strong>作者：</strong>{{article.user_name}}</el-col>
          <el-col :span="6"><strong>阅读权限：</strong>{{read_type[article.read_type]}}</el-col>
          <el-col :span="6"><strong>时间：</strong>{{article.create_time}}</el-col>
        </el-row>
        <el-row :gutter="20" class="">
          <el-col :span="24"><strong>文章概要：</strong>{{article.description}}</el-col>
        </el-row>
        <div class="article_content" v-html="article.content">文章内容</div>
      </div>
      <div slot="foot" class="sidebar_foot">
        <p>上一条：<span v-if="!article.next.title">已经没有上一条数据</span>
          <a @click="getActiveContent(article.next.id)" href="javascript:void 0">{{article.next.title}}</a>
        </p>
        <p>下一条：<span v-if="!article.prev.title">已经没有下一条数据</span>
          <a @click="getActiveContent(article.prev.id)" href="javascript:void 0">{{article.prev.title}}</a>
        </p>
      </div>
    </Sidebar>
  </div>
</template>
<script type="text/javascript">
import utils from '@/utils/index'
import common from '@/../server/common'
import '@/components/index'
import XLSX from 'xlsx'
import download from '../../exportExcel.js'
export default {
  name: 'list',
  data () {
    return {
      page_grade: common.page_grade,
      grade: {
        updateArticle: !0,
        passedArticle: !0,
        deleteArticle: !0
      },
      userInfo: {},
      read_type: common.user_type,
      sort_data: [],
      sort_id: [],
      defaultProps: {
        children: 'children',
        label: 'sort_name',
        value: 'id'
      },
      search_data: {
        title: '',
        sort_id: '',
        read_type: '',
        page: 1,
        pageSize: 10
      },
      // 表格数据
      multipleSelection: [],
      table_data: {
        tableConfig: [
					{ 'key': 'contract_no', 'name': '合同编号', minWidth: 120,fixed: true },
					{ 'key': 'username', 'name': '姓名', minWidth: 120 },
					{ 'key': 'member_sex', 'name': '性别', minWidth: 60 },
					{ 'key': 'identity_id', 'name': '身份证号', minWidth: 150 },
					{ 'key': 'telephone', 'name': '联系方式', minWidth: 120 },
					{
						name: '至德',
						key: '',
						children: [
							{ 'key': 'zhide_entry_time', 'name': '入职日期', minWidth: 100 },
							{ 'key': 'zhide_quit_time', 'name': '离职日期', minWidth: 100 }
						]
					},
					{
						name: '长方',
						key: '',
						children: [
							{ 'key': 'factory_entry_time', 'name': '入职日期', minWidth: 100 },
							{ 'key': 'factory_quit_time', 'name': '离职日期', minWidth: 100 }
						]
					},
					{ 'key': 'quit_work_type', 'name': '离职类型', minWidth: 100 },
					{ 'key': 'salary_standard', 'name': '薪资标准', minWidth: 100 },
					{ 'key': 'bank_card', 'name': '银行卡号', minWidth: 150 },
					{ 'key': 'bank_name', 'name': '开户行', minWidth: 100 },
					{ 'key': 'bank_addr', 'name': '开户地', minWidth: 100 },
					{ 'key': 'member_source', 'name': '来源', minWidth: 100 },
					{ 'key': 'reference_fee', 'name': '参考返费', minWidth: 100 },
					{ 'key': 'medical_invoice', 'name': '体检发票', minWidth: 100 },
					{ 'key': 'data_in', 'name': '资料入库', minWidth: 100 },
					{ 'key': 'content_1', 'name': '其他1', minWidth: 100 },
					{ 'key': 'content_2', 'name': '其他2', minWidth: 100 },
					{ 'key': 'create_time', 'name': '创建时间', minWidth: 150 },
					{ 'key': 'operations', 'name': '操作', minWidth: 100,fixed: 'right' }
        ],
        total: 0,
        data: []
      },
      loading: false,
      article: {
        title: '',
        sort_name: '',
        user_name: '',
        read_type: '',
        create_time: '',
        description: '',
        content: '',
        prev: { id: 0, title: '' },
        next: { id: 0, title: '' }
      },
			fileList: [],
			opt_user:'',
			exportData:[]
    }
  },
	computed: {
	  upText() {
	    let p = this.upProgress
	    return p > 0 && p < 100 ? p + '%' : '导入Excel文件'
	  }
	},
  methods: {
		handleRemove(file, fileList) {
			console.log(file, fileList);
		},
		handlePreview(file) {
			console.log(file);
		},
		handleExceed(files, fileList) {
			this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
		},
		beforeRemove(file, fileList) {
			return this.$confirm(`确定移除 ${ file.name }？`);
		},
		handleSelect(id){
			utils.storage.set('roster_id', id)
		},
		uploadExcel () {
			if(!this.search_data.roster_id){
				this.$message.warning(`请选择所属名册`);
				return false
			}
			this.$refs.upload.SelectFile()
		},
		exportExcel () {
			if(!this.search_data.roster_id){
				this.$message.warning(`请选择所属名册`);
				return false
			}
			utils.ajax.call(this, '/listRosterData', {tag:1,roster_id:this.search_data.roster_id}, (obj, err) => {
			  if (!err) {
					this.exportData = obj.data
					let list=[]
					
					if(this.exportData.length==0){
						this.$message.warning(`该名册下暂无数据,试试导入吧`);
						return false
					}
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
				
					let arr=[]
					arr.push(Object.keys(strObj))
					for(var i=0;i<this.exportData.length;i++){
						arr.push(Object.values(this.exportData[i]))
					}
					// 导出excel
					download.exportExcel(arr,'花名册.xlsx')
					// 记录操作日志
					utils.ajax.call(this,'/logsAdd',{opt_content:'excel导出，名册id为：'+this.search_data.roster_id+'，操作人：'+this.opt_user},(obj,err)=>{})
				}
			})
		},
		successUpload (data) {
			if (data.status) {
				this.$message.warning(`文件导入成功`)
			}else{
				this.$message.warning(`文件导入失败`)
			}
		},
    // 删除文章
    deleteArticle (arr) {
      if (!arr) {
        if (this.multipleSelection.length) {
          arr = this.multipleSelection
        } else {
          return this.$message('请先选择文章')
        }
      }
      this.$confirm(`确定要${arr.length > 1 ? '批量删除文章' : '删除此文章'}吗？`, '系统提醒', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        utils.ajax.call(this, '/deleteArticle', { ids: arr.map(o => o.id).join(',') }, (d, err) => {
          !err && this.ajaxData()
        })
      }).catch(() => {
      })
    },
    passedArticle (arr, pass) {
      if (!arr) {
        if (this.multipleSelection.length) {
          arr = this.multipleSelection
        } else {
          return this.$message('请先选择文章')
        }
      }
      utils.ajax.call(this, '/passedArticle', { ids: arr.map(o => o.id).join(','), passed: pass }, (obj, err) => {
        if (!err) {
          arr.forEach(row => {
            row.passed = obj.passed
          })
        }
      })
    },
    selectable (row) {
      let user = this.userInfo
      let result = !this.grade.deleteArticle || !this.grade.passedArticle
      result = result && user.id !== row.user_id
      return user.user_type < 3 || result
    },
    add () {
      this.$router.push('/article/add')
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    createButton (h, row, code, text) {
      let self = this
      let dis = false
      let user = this.userInfo
      if (code === 'passed') {
        dis = this.grade.passedArticle
      } else if (code === 'edit') {
        dis = user.user_type > 2 && user.id !== row.user_id ? true : this.grade.updateArticle
      } else if (code === 'delete') {
        dis = user.user_type > 2 && user.id !== row.user_id ? true : this.grade.deleteArticle
      }
      return h('el-button', {
        props: { size: 'small', disabled: dis },
        on: {
          click () {
            self.healColumnClick(code, row)
          }
        }
      }, [text])
    },
    // 格式化输出内容
    columnFormatter (row, column) {
      let self = this
      let key = column.property
      let str = row[key] || ''
      let h = this.$createElement
      if (key === 'create_time') {
        str = str.replace(/[^-\d].+/, '')
      } else if (key === 'title') {
        return h('span', {
          style: { cursor: 'pointer' },
          on: {
            click () {
              self.healColumnClick('view', row)
            }
          }
        }, [str])
      } else if (key === 'passed') {
        return str === 1 ? '通过' : this.createButton(h, row, key, '审核')
      } else if (key === 'operations') {
        return h('div', [
          this.createButton(h, row, 'editmember', '编辑'),
          // this.createButton(h, row, 'delete', '删除')
        ])
      } else if (key === 'read_type') {
        str = common.user_type[str] || '未知'
      }
      return str
    },
    // 处理列、按钮点击
    healColumnClick (code, row) {
      if (code === 'editmember') {
        this.$router.push('/roster/editmember/' + row.id)
      } else if (code === 'view') {
        this.$refs.view.open(!0)
        this.getActiveContent(row.id)
      } else if (code === 'passed') {
        this.passedArticle([row], row.passed === 1 ? 0 : 1)
      } else if (code === 'delete') {
        this.deleteArticle([row])
      }
    },
    getActiveContent (id) {
      this.loading = !0
      utils.ajax.call(this, '/getArticleById', Object.assign({ id }, this.search_data), (obj, err) => {
        this.loading = !1
        if (err) {
          this.$refs.view.open(!1)
        } else {
          Object.getOwnPropertyNames(this.article).forEach(key => {
            this.$set(this.article, key, obj[key])
          })
          this.article.create_time = new Date(this.article.create_time).toLocaleDateString()
          // 显示分类
          const cid = obj.sort_id
          let hasFind = false
          let cb = (array, a) => {
            !hasFind && array && array.forEach(item => {
              a = a || []
              let _a = [].concat(a)
              _a.push(item.id)
              if (item.id === cid) {
                hasFind = true
                this.sort_id = _a
              } else {
                cb(item.children, _a)
              }
            })
          }
          cb(this.sort_data)
        }
      })
    },
    // ajax请求列表数据
    ajaxData () {
      // let p = this.sort_id
      
			let id = this.$route.params.id
			// this.search_data.sort_id = p.length ? p.slice(-1)[0] : ''
			
			if (id) {
			  this.search_data.id = id
			}
			console.log(this.search_data)
      utils.ajax.call(this, '/listRosterData', this.search_data, (obj, err) => {
        if (!err) {
					
          this.table_data.data = obj.data
          this.table_data.total = obj.total
          this.search_data.page = obj.page
        }
      })
    },
    // 点击查询
    onSearch () {
      this.search_data.page = 1
      this.ajaxData()
    },
    handleCurrentChange (page) {
      if (page !== this.search_data.page) {
        this.search_data.page = page
        this.ajaxData()
      }
    }
  },
  mounted () {
		utils.storage.get('userInfo', obj => {
			this.userInfo = obj.userInfo
		  this.opt_user = obj.userInfo.user_name
		})
		utils.ajax.call(this, '/listRoster', {pageSize:100}, (data, err) => {
		  if (!err) {
		    let arr = data.data
		    arr.sort((a, b) => a.id > b.id ? 1 : -1)
		    this.sort_data = arr
		  }
		})
    this.ajaxData()
  },
  mixins: [common.mixin]
}
</script>
<style lang="less">
  .grid-table {
    .el-form-item {
      display: inline-block;
      max-height: 240px;
      width: ~'calc(24% - 10px)';
      &:first-child {
        .el-input {
          margin-right: 25px;
        }
      }
      &:last-child {
        overflow: hidden;
        white-space: nowrap;
        vertical-align: bottom;
      }
    }
    .el-pagination {
      margin-top: 5px;
      text-align: right;
    }
    .el-cascader--small .el-cascader__label {
      line-height: 40px;
    }
  }

  .sidebar_content {
    .el-row {
      font-size: 15px;
      color: #666;
      margin-bottom: 8px;
      strong {
        color: #555;
      }
    }
    .article_content {
      font-size: 12px;
      margin-top: 20px;
      padding: 10px;
      background: #f1f1f112;
      border: 1px solid #f9f9f9;
      .no_access {
        color: #999;
        font-size: 16px;
      }
    }
  }

  .sidebar_foot p {
    span {
      color: #999;
    }
    a {
      text-decoration: none;
      color: #444;
    }
  }
</style>
