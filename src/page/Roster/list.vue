<template>
  <div>
    <el-row class="grid-table">
      <el-form :inline="true" :model='search_data'>
        <el-form-item label="名册名称">
          <el-input v-model="search_data.roster_name"></el-input>
        </el-form-item>
        <el-form-item label="项目名称">
          <el-input v-model="search_data.roster_pro_name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button icon="search" type="primary" @click='onSearch'>查询</el-button>
          <el-button icon="plus" @click="add" :disabled="grade.updateRoster">添加名册
          </el-button>
        </el-form-item>
      </el-form>

			<el-table stripe border style="width:100%;margin-top:10px" :data="table_data.data"
			          @selection-change="handleSelectionChange">
			  <el-table-column type="selection" :selectable="selectable" width="55"></el-table-column>
			  <el-table-column
			    show-overflow-tooltip
			    v-for="item in table_data.columns"
			    :label="item.name"
			    :key="item.key"
			    :prop="item.key"
			    :formatter="columnFormatter"
			    :min-width="item.minWidth" :width="item.width">
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
  </div>
</template>
<script type="text/javascript">
import utils from '@/utils/index'
import common from '@/../server/common'
import '@/components/index'

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
        columns: [
          { 'key': 'roster_name', 'name': '名册名称'},
          { 'key': 'roster_pro_name', 'name': '项目名称' },
          { 'key': 'create_time', 'name': '创建时间', width: 150 },
          { 'key': 'operations', 'name': '操作', width: 240 }
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
      }
    }
  },
  methods: {
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
      this.$router.push('/roster/addroster')
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
          this.createButton(h, row, 'datalist', '查看'),
          this.createButton(h, row, 'edit', '编辑'),
          this.createButton(h, row, 'delete', '失效')
        ])
      } else if (key === 'read_type') {
        str = common.user_type[str] || '未知'
      }
      return str
    },
    // 处理列、按钮点击
    healColumnClick (code, row) {
      if (code === 'datalist') {
        this.$router.push('/roster/datalist/' + row.id)
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
      let p = this.sort_id
      this.search_data.sort_id = p.length ? p.slice(-1)[0] : ''
      utils.ajax.call(this, '/listRoster', this.search_data, (obj, err) => {
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
    this.ajaxData()
    utils.ajax.call(this, '/listSort', {}, (data, err) => {
      if (!err) {
        let arr = data.data
        arr.sort((a, b) => a.parent_id > b.parent_id ? 1 : -1)
        for (let i = arr.length; i--;) {
          if (arr[i].parent_id > 0) {
            let obj = arr.pop()
            arr.forEach(item => {
              if (item.id === obj.parent_id) {
                item.children = item.children || []
                item.children.push(obj)
              }
            })
          }
        }
        this.sort_data = arr
      }
    })
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
