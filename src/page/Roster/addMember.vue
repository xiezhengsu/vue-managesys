<template>
  <div class="add-article">
    <el-form ref="form" :model="data" :rules="rules" label-width="300px">
      <el-form-item label="合同编号" prop="contract_no">
        <el-input v-model="data.contract_no"></el-input>
      </el-form-item>
      <el-form-item label="所属名册" prop="sort_id">
        <el-cascader :options="sort_data" v-model="sort_id" change-on-select
                     :props="defaultProps"></el-cascader>
      </el-form-item>
      <el-form-item label="姓名" prop="username">
        <el-input v-model="data.username"></el-input>
      </el-form-item>
	  <el-form-item label="性别" prop="member_sex">
		<el-radio v-model="data.member_sex" label="男">男</el-radio>
		<el-radio v-model="data.member_sex" label="女">女</el-radio>
	  </el-form-item>
	  <el-form-item label="身份证号" prop="identity_id">
	    <el-input v-model="data.identity_id"></el-input>
	  </el-form-item>
	  <el-form-item label="联系方式" prop="telephone">
	    <el-input v-model="data.telephone"></el-input>
	  </el-form-item>
	  <el-form-item label="(至德)入职日期" prop="zhide_entry_time">
		<el-date-picker
			value-format="yyyy-MM-dd"
		  v-model="data.zhide_entry_time"
		  type="date"
		  placeholder="选择(至德)入职日期">
		</el-date-picker>
	  </el-form-item>
	  <el-form-item label="(至德)离职日期" prop="zhide_quit_time">
		<el-date-picker
		value-format="yyyy-MM-dd"
		  v-model="data.zhide_quit_time"
		  type="date"
		  placeholder="选择(至德)离职日期">
		  </el-date-picker>
	  </el-form-item>
	  <el-form-item label="(厂方)入职日期" prop="factory_entry_time">
		<el-date-picker
		  v-model="data.factory_entry_time"
		  value-format="yyyy-MM-dd"
		  type="date"
		  placeholder="选择(厂方)入职日期">
		</el-date-picker>
	  </el-form-item>
	  <el-form-item label="(厂方)离职日期" prop="factory_quit_time">
		<el-date-picker
		  v-model="data.factory_quit_time"
		  value-format="yyyy-MM-dd"
		  type="date"
		  placeholder="选择(厂方)离职日期">
		  </el-date-picker>
	  </el-form-item>
	  <el-form-item label="离职类型" prop="quit_work_type">
		  <el-select v-model="data.quit_work_type" placeholder="请选择">
			<el-option
			  v-for="item in quitTypes"
			  :key="item.value"
			  :label="item.label"
			  :value="item.value">
			</el-option>
		  </el-select>
	  </el-form-item>
	  <el-form-item label="薪资标准" prop="salary_standard">
	    <el-input v-model="data.salary_standard"></el-input>
	  </el-form-item>
	  <el-form-item label="银行卡号" prop="bank_card">
	    <el-input v-model="data.bank_card"></el-input>
	  </el-form-item>
	  <el-form-item label="开户行" prop="bank_name">
	    <el-input v-model="data.bank_name"></el-input>
	  </el-form-item>
	  <el-form-item label="开户地" prop="bank_addr">
	    <el-input v-model="data.bank_addr"></el-input>
	  </el-form-item>
	  <el-form-item label="来源" prop="member_source">
	    <el-input v-model="data.member_source"></el-input>
	  </el-form-item>
	  <el-form-item label="参考返费" prop="reference_fee">
	    <el-input v-model="data.reference_fee"></el-input>
	  </el-form-item>
	  <el-form-item label="体检发票">
		<el-select v-model="data.medical_invoice" placeholder="请选择">
			<el-option key="已交" label="已交" value="已交"></el-option>
			<el-option key="未交" label="未交" value="未交"></el-option>
		</el-select>
	  </el-form-item>
	  <el-form-item label="资料入库">
		<el-select v-model="data.data_in" placeholder="请选择">
			<el-option key="已入库" label="已入库" value="已入库"></el-option>
			<el-option key="未入库" label="未入库" value="未入库"></el-option>
		</el-select>
	  </el-form-item>
	  <el-form-item label="其他1" prop="content_1">
	    <el-input v-model="data.content_1"></el-input>
	  </el-form-item>
	  <el-form-item label="其他2" prop="content_2">
	    <el-input v-model="data.content_2"></el-input>
	  </el-form-item>
	  <el-form-item label="操作人">
	    <el-input readonly="readonly" :value="data.opt_user" style="width:217px;opacity: 0.5"></el-input>
	  </el-form-item>
      <el-form-item style="text-align: left">
        <el-button @click="backList">返回列表</el-button>
        <el-button type="primary" :disabled="grade.updateArticle||loading" @click="saveRosterMember">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script type="text/javascript">
import utils from '@/utils/index'
import common from '@/../server/common'
import '@/components/index'
import { quillEditor } from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

export default {
  name: 'list',
  data () {
    return {
      upProgress: 0,
      editorOption: {
        modules: {
          placeholder: 'xxx',
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean'],
            ['link', 'image', 'video']
          ]
        }
      },
      page_grade: common.page_grade,
      grade: {
        updateArticle: !0,
        upFile: !0
      },
      userInfo: {},
      read_type: common.user_type,
      loading: false,
      sort_id: [],
      sort_data: [],
	  quitTypes:[
		  {
			  value: '正常离职',
			  label: '正常离职'
		  },{
			  value: '旷离',
			  label: '旷离'
		  },{
			  value: '劝退',
			  label: '劝退'
		  },{
			  value: '开除',
			  label: '开除'
		  },
	  ],
      data: {
        id: 0,
        contract_no: '',
        sort_id: '',
        username: '',
        member_sex: '男',
        identity_id: '',
        telephone: '',
        zhide_entry_time: '',
        zhide_quit_time: '',
        factory_entry_time: '',
        factory_quit_time: '',
        quit_work_type: '',
        salary_standard: '',
        bank_card: '',
        bank_name: '',
        bank_addr: '',
        member_source: '',
        reference_fee: '',
        medical_invoice: '',
        data_in: '',
        opt_user: '',
        content_1: '',
        content_2: ''
      },
      rules: {
        sort_id: { required: true, message: '所属名册不能为空' },
		quit_work_type: {required: true, message: '离职类型不能为空'},
		contract_no: {required: true, message: '合同编号不能为空'},
        telephone: [{
          required: true, message: '标题不能为空', trigger: 'change'
        }, {
          pattern: /^[1][3,4,5,7,8][0-9]{9}$/, message: '请输入正确的手机号', trigger: 'blur'
        }],
        description: [{
          required: true, message: '文章概要不能为空', trigger: 'change'
        }, {
          pattern: /^.{5,255}$/, message: '请输入5-255个字符的文章概要', trigger: 'blur'
        }],
        read_type: [{
          required: true, type: 'number', min: 1, max: 4, message: '请选择阅读权限', trigger: 'change'
        }],
        content: {
          required: true, message: '文章内容不能为空'
        }
      },
      defaultProps: {
        children: 'children',
        label: 'roster_name',
        value: 'id'
      }
    }
  },
  computed: {
    upText() {
      let p = this.upProgress
      return p > 0 && p < 100 ? p + '%' : '上传图片'
    }
  },
  methods: {
    onProgress(p) {
      this.upProgress = p
    },
    saveRosterMember () {
      this.$refs.form.validate(v => {
        if (v) {
          utils.ajax.call(this, '/updateRosterMember', this.data, (data, err) => {
            this.loading = false
            if (!err) {
              this.$message({
                message: '保存成功',
                type: 'success'
              })
			  
              this.$router.push('/roster/datalist/:id')
            }
          })
        }
      })
    },
    backList () {
      this.$router.push('/roster/datalist/:id')
    },
    successUpload (data) {
      this.data.pic = data.filename
      this.data.content += '<img src="' + data.filename + '" />'
    }
  },
  mounted () {
    utils.storage.get('userInfo', obj => {
      this.data.opt_user = obj.userInfo.user_name
			this.data.opt_ip = obj.userInfo.login_ip
    })
    utils.ajax.call(this, '/listRoster', {pageSize:100}, (data, err) => {
      if (!err) {
        let arr = data.data
        arr.sort((a, b) => a.id > b.id ? 1 : -1)
        this.sort_data = arr
      }
    })
  },
  watch: {
    sort_id (val) {
      this.data.sort_id = val.length ? val.slice(-1)[0] : ''
    }
  },
  mixins: [common.mixin],
  components: {
    quillEditor
  }
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
