<template>
  <div class="image-upload">
    <el-upload
      class="image-uploader"
      :action="uploadUrl"
      :headers="headers"
      :data="data"
      :show-file-list="false"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
      drag
    >
      <img v-if="value" :src="value" class="image-preview" />
      <i v-else class="el-icon-plus image-uploader-icon"></i>
    </el-upload>
    <div v-if="value" class="image-preview-action">
      <el-button
        size="mini"
        type="success"
        icon="el-icon-check"
        circle
        @click="previewImage"
      ></el-button>
      <el-button
        size="mini"
        type="danger"
        icon="el-icon-delete"
        circle
        @click="deleteImage"
      ></el-button>
    </div>
  </div>
</template>

<script>
import { getToken } from "@/utils/auth";

export default {
  name: "ImageUpload",
  props: {
    value: {
      type: String,
      default: ""
    },
    // 自定义上传参数
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      uploadUrl: process.env.VUE_APP_BASE_API + "/play/info/uploadImg", // 请根据实际的上传接口地址修改
      headers: {
        Authorization: "Bearer " + getToken()
      },
      method: "get"
    };
  },
  methods: {
    handleSuccess(response) {
      console.log("上传成功:", response);
      if (response.code === 200) {
        this.$emit("input", response.fileName);
        this.$emit("change", response.fileName);
        this.$modal.msgSuccess("上传成功");
      } else {
        this.$modal.msgError(response.msg);
      }
    },
    handleError(error, file, fileList) {
      this.$modal.msgError("上传失败");
    },
    beforeUpload(file) {
      const isJPG = file.type === "image/jpeg" || file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$modal.msgError("上传头像图片只能是 JPG 或 PNG 格式!");
      }
      if (!isLt2M) {
        this.$modal.msgError("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    previewImage() {
      // 创建一个临时数组用于预览
      const previewImages = [this.value];
      this.$imagePreview.open(previewImages);
    },
    deleteImage() {
      this.$emit("input", "");
      this.$emit("change", "");
    }
  }
};
</script>

<style scoped>
.image-upload {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.image-uploader {
  width: 300px;
}

.image-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.image-uploader .el-upload:hover {
  border-color: #409EFF;
}

.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 300px;
  height: 150px;
  line-height: 150px;
  text-align: center;
}

.image-preview {
  width: 300px;
  height: 150px;
  display: block;
  object-fit: cover;
}

.image-preview-action {
  margin-top: 10px;
}

.image-preview-action .el-button {
  margin: 0 5px;
}
</style>

