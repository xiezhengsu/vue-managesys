<template>
  <input style="display: none" type="file" name="file" ref="input" :accept="upload.accept" @change="upFile"/>
</template>

<script>
import utils from '@/utils/index'
import common from '@/../server/common'

export default {
  name: 'upFile',
  props: {
    upload: {
      type: Object,
      required: true,
      validator: (obj) => {
        obj.accept = obj.accept || 'image/gif, image/jpeg, image/jpg, image/png, application/vnd.ms-excel'
        obj.disabled = obj.disabled || false
        return Object.prototype.toString.call(obj) === '[object Object]'
      }
    },
		roster_id:{
			type: Number,
			required: true,
		}
  },
  data () {
    return this.upload
  },
  methods: {
    upFile (ev) {
      const files = ev.target.files
      if (!files) return
      let formData = new window.FormData()
      let file = files[0]
      formData.append('file', file)
			formData.append("roster_id",this.roster_id)
			console.log(file)
      if (!common.upFile_accept.test(file.type)) {
        this.$message('非法上传文件格式！')
      } else if (file.size > common.upFile_maxSize) {
        this.$message('上传文件大小超出！')
      } else {
				let rosterid=1
        utils.ajax.call(this, '/upFile', formData, (data, err) => {
          if (!err) {
            this.$emit('successUpload', data)
          }
        }, progress => {
          this.$emit('progress', progress)
        })
      }
    },
    SelectFile () {
      if (!this.upload.disabled) {
        this.$refs.input.value = null
        this.$refs.input.click()
      }
    }
  }
}
</script>
