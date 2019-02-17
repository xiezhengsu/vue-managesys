<template>
  <div class="add-article">
    <el-form ref="form" :model="data" :rules="rules" label-width="300px">
      <el-form-item label="花名册" prop="roster_name">
        <el-input v-model="data.roster_name"></el-input>
      </el-form-item>
      <el-form-item label="项目名称" prop="roster_pro_name">
        <el-input v-model="data.roster_pro_name"></el-input>
      </el-form-item>
      
      <el-form-item style="text-align: left">
        <el-button @click="backList">返回列表</el-button>
        <el-button type="primary" :disabled="grade.updateRoster||loading" @click="saveRoster">保存名册</el-button>
      </el-form-item>
    </el-form>
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
      upProgress: 0,
      page_grade: common.page_grade,
      grade: {
        updateRoster: !0
      },
      userInfo: {},
      read_type: common.user_type,
      loading: false,
      data: {
        id: 0,
        roster_name: '',
        roster_pro_name: ''
      },
      rules: {
        roster_name: [{
          required: true, message: '花名册不能为空', trigger: 'change'
        }, {
          pattern: /^.{1,100}$/, message: '请输入1-100个字符的花名册', trigger: 'blur'
        }],
        roster_pro_name: [{
          required: true, message: '项目名称不能为空', trigger: 'change'
        }, {
          pattern: /^.{1,100}$/, message: '请输入1-100个字符的项目名称', trigger: 'blur'
        }]
      }
    }
  },
  methods: {
    onProgress(p) {
      this.upProgress = p
    },
    saveRoster () {
      this.$refs.form.validate(v => {
        if (v) {
          // this.data.article_extend = JSON.stringify({ pic: this.data.pic })
          utils.ajax.call(this, '/updateRoster', this.data, (data, err) => {
            this.loading = false
            if (!err) {
              this.$message({
                message: '保存成功',
                type: 'success'
              })
              this.$router.push('/roster/list')
            }
          })
        }
      })
    },
    backList () {
      this.$router.push('/roster/list')
    }
  },
  mounted () {
    utils.storage.get('userInfo', obj => {
      this.data.user_name = obj.userInfo.user_name
    })
  },
  mixins: [common.mixin]
}
</script>
<style lang="less">
  .ql-editor{
    min-height:100px;
    max-height:600px;
  }
  .ql-toolbar.ql-snow{
    padding: 0;
  }
  .ql-snow .ql-picker{
    line-height:20px;
    outline: none;
  }
  .ql-snow .ql-tooltip{
    margin-left:50%;
  }
  .ql-snow .ql-tooltip a.ql-preview{
    vertical-align: middle;
  }
  .add-article {
    .el-input, .el-textarea__inner, .el-slider {
      max-width: 60%
    }
    .el-cascader {
      width: 100%;
      max-width: 60%;
      .el-input {
        width: 100%
      }
    }
  }
</style>
