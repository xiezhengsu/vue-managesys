<template>
  <div>
    <el-row class="grid-table">
      <el-form :inline="true" :model='search_data'>
        <el-form-item label="操作人">
          <el-input v-model="search_data.opt_user"></el-input>
        </el-form-item>
		<el-form-item label="操作内容">
		  <el-input v-model="search_data.opt_content"></el-input>
		</el-form-item>

        <el-form-item>
          <el-button icon="search" type="primary" @click='onSearch'>查询</el-button>
        </el-form-item>
      </el-form>
      <el-table stripe border style="width:100%;margin-top:10px" :data="table_data.data"
                @selection-change="handleSelectionChange">
        <el-table-column
          show-overflow-tooltip
          v-for="item in table_data.columns"
          :label="item.name"
          :key="item.key"
          :prop="item.key"
          :min-width="item.minWidth" :width="item.minWidth">
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
        opt_user: '',
        opt_content: '',
        page: 1,
        pageSize: 10
      },
      // 表格数据
      multipleSelection: [],
      table_data: {
        columns: [
          { 'key': 'opt_user', 'name': '操作人', minWidth: 150 },
          { 'key': 'opt_time', 'name': '操作时间', minWidth: 150 },
          { 'key': 'opt_content', 'name': '操作内容' }
        ],
        total: 0,
        data: []
      },
      loading: false,
      
    }
  },
  methods: {
    // ajax请求列表数据
    ajaxData () {
      utils.ajax.call(this, '/logslist', this.search_data, (obj, err) => {
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
