<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="游戏名称" prop="playName">
        <el-input
          v-model="queryParams.playName"
          placeholder="请输入游戏名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="语言" prop="language">
        <el-select
          v-model="queryParams.language"
          placeholder="请选择语言"
          clearable
          @change="handleQuery"
        >
          <el-option
            v-for="dict in languageOptions"
            :key="dict.dictLabel"
            :label="dict.dictValue"
            :value="dict.dictLabel"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="游戏编号" prop="playNum">
        <el-input
          v-model="queryParams.playNum"
          placeholder="请输入游戏编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="playList" @selection-change="handleSelectionChange">
      <el-table-column label="游戏编号" align="center" prop="playNum">
      </el-table-column>
      <el-table-column label="ICON" align="center" prop="icon">
        <template slot-scope="scope">
          <el-image
            :src="scope.row.icon"
            :preview-src-list="[scope.row.icon]"
            fit="cover"
            class="table-image"
            lazy
            style="width: 50px; height: 50px"
          >
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="封面" align="center" prop="cover">
        <template slot-scope="scope">
          <el-image
            :src="scope.row.cover"
            :preview-src-list="[scope.row.cover]"
            fit="cover"
            class="table-image cover-image"
            lazy
            style="width: 80px; height: 50px"
          >
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="游戏名称" align="center" prop="playName"/>
      <el-table-column label="游戏状态" align="center" prop="playStatusStr"/>
      <el-table-column label="游戏包" align="center" prop="playUrl"/>
      <el-table-column label="屏幕方向" align="center" prop="direction">
        <template slot-scope="scope">
          <span>{{ scope.row.direction === 'vertical' ? '竖屏' : '横屏' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="游戏排序" align="center" prop="sortNum"/>
      <el-table-column label="游戏标签" align="center" prop="playTag"/>
      <el-table-column label="游戏描述" align="center" prop="playDesc"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改游戏配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="游戏名称" prop="playNameList">
          <div v-for="(item, index) in form.playNameList" :key="index"
               style="display: flex; margin-bottom: 10px; align-items: center;">
            <el-input
              v-model="item.value"
              placeholder="请输入游戏名称"
              style="flex: 1"
            />
            <el-select
              v-model="item.language"
              placeholder="请选择语言"
              style="width: 120px; margin: 0 10px;"
              clearable
            >
              <el-option
                v-for="lang in languageOptions"
                :key="lang.dictLabel"
                :label="lang.dictValue"
                :value="lang.dictLabel">
              </el-option>
            </el-select>
            <el-button
              v-if="form.playNameList.length > 1"
              icon="el-icon-delete"
              circle
              @click="removePlayName(index)"
            ></el-button>
            <el-button
              v-if="index === form.playNameList.length - 1"
              icon="el-icon-plus"
              circle
              @click="addPlayName"
              style="margin-left: 10px;"
            ></el-button>
          </div>
        </el-form-item>

        <el-form-item label="游戏标签" prop="playTagList">
          <div v-for="(item, index) in form.playTagList" :key="index"
               style="display: flex; margin-bottom: 10px; align-items: center;">
            <el-input
              v-model="item.value"
              placeholder="请输入游戏标签"
              style="flex: 1"
            />
            <el-select
              v-model="item.language"
              placeholder="请选择语言"
              style="width: 120px; margin: 0 10px;"
              clearable
            >
              <el-option
                v-for="lang in languageOptions"
                :key="lang.dictLabel"
                :label="lang.dictValue"
                :value="lang.dictLabel">
              </el-option>
            </el-select>
            <el-button
              v-if="form.playTagList.length > 1"
              icon="el-icon-delete"
              circle
              @click="removePlayTag(index)"
            ></el-button>
            <el-button
              v-if="index === form.playTagList.length - 1"
              icon="el-icon-plus"
              circle
              @click="addPlayTag"
              style="margin-left: 10px;"
            ></el-button>
          </div>
        </el-form-item>

        <el-form-item label="游戏描述" prop="playDescList">
          <div v-for="(item, index) in form.playDescList" :key="index"
               style="display: flex; margin-bottom: 10px; align-items: center;">
            <el-input
              v-model="item.value"
              placeholder="请输入游戏描述"
              type="textarea"
              style="flex: 1"
            />
            <el-select
              v-model="item.language"
              placeholder="请选择语言"
              style="width: 120px; margin: 0 10px;"
              clearable
            >
              <el-option
                v-for="lang in languageOptions"
                :key="lang.dictLabel"
                :label="lang.dictValue"
                :value="lang.dictLabel">
              </el-option>
            </el-select>
            <el-button
              v-if="form.playDescList.length > 1"
              icon="el-icon-delete"
              circle
              @click="removePlayDesc(index)"
            ></el-button>
            <el-button
              icon="el-icon-plus"
              circle
              @click="addPlayDesc"
              style="margin-left: 10px;"
            ></el-button>
          </div>
        </el-form-item>

        <el-form-item label="游戏状态" prop="playStatus">
          <el-radio-group v-model="form.playStatus">
            <el-radio :label="1" :key="1">上架</el-radio>
            <el-radio :label="2" :key="2">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="屏幕方向" prop="direction">
          <el-radio-group v-model="form.direction">
            <el-radio label="horizontal">横屏</el-radio>
            <el-radio label="vertical">竖屏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="游戏编号" prop="playNum">
          <el-input v-model="form.playNum" class="number
"/>
        </el-form-item>
        <el-form-item label="游戏包" prop="playUrl">
          <el-upload
            class="avatar-uploader"
            action=""
            :http-request="uploadPlayGame"
            :show-file-list="false"
            :on-success="handleGameAvatarSuccess"
            :before-upload="beforeGameAvatarUpload"
            :data="{ id: form.id !== undefined ? form.id : '' }"
          >
            <img v-if="form.playUrl" :src="form.playUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="ICON" prop="icon">
          <el-upload
            class="avatar-uploader"
            action=""
            :http-request="uploadIcon"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :data="{  id: form.id !== undefined ? form.id : '' }"
          >
            <img v-if="form.icon" :src="form.icon" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="封面" prop="cover">
          <el-upload
            class="avatar-uploader"
            action=""
            :http-request="uploadCover"
            :show-file-list="false"
            :on-success="handleCoverAvatarSuccess"
            :before-upload="beforeCoverAvatarUpload"
            :data="{  id: form.id !== undefined ? form.id : '' }"
          >
            <img v-if="form.cover" :src="form.cover" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="游戏排序" prop="sortNum">
          <el-input-number v-model="form.sortNum" controls-position="right" :min="0"/>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {listPlay, delPlay, addPlay, updatePlay, uploadGame, uploadImg} from "@/api/play/play";
import {getDicts} from "@/api/system/dict/data";

export default {
  name: "PlayPreview",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      languageOptions: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      iconImg: "",
      coverImg: "",
      playUrl: "",
      // 游戏表格数据
      playList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        language: undefined,
        playName: undefined,
        startTime: '',
        endTime: '',
        playStatus: undefined,
        playNum: undefined
      },

      // 表单参数
      form: {},
      // 表单校验
      rules: {
        // playName: [
        //   { required: true, message: "游戏名称不能为空", trigger: "blur" }
        // ],
        playStatus: [
          {required: true, message: "游戏状态不能为空", trigger: "blur"}
        ],
        playNum: [
          {required: true, message: "游戏编号不能为空", trigger: "blur"}
        ],
        playUrl: [
          {required: true, message: "游戏地址不能为空", trigger: "blur"}
        ],
        icon: [
          {required: true, message: "ICON不能为空", trigger: "blur"}
        ],
        cover: [
          {required: true, message: "封面不能为空", trigger: "blur"}
        ],
        sortNum: [
          {required: true, message: "游戏排序不能为空", trigger: "blur"}
        ],
        direction: [
          {required: true, message: "屏幕方向不能为空", trigger: "blur"}
        ]
      }
    };
  },
  created() {
    this.getList();
    this.dictList();
  },
  methods: {


    dictList() {
      getDicts("language_type").then(response => {
        this.languageOptions = response.data;
      }).catch(error => {
        console.error("获取字典列表失败:", error);
        this.$message.error("获取字典列表失败，请稍后重试");
        this.loading = false;
      })
    },
    uploadPlayGame(option) {
      const formData = new FormData();
      formData.append('file', option.file);

      // 添加其他参数到formData中
      if (this.form.id !== undefined) {
        formData.append('id', this.form.id);
      }
      // 如果还有其他需要传递的参数，可以继续添加
      // 例如：formData.append('paramName', paramValue);
      uploadGame(formData).then(res => {
        if (res.code === 200) {
          // this.playUrl=res.data.path;
          // this.id=res.data.id;
          this.handleGameAvatarSuccess(res, option.file)
        }
        // this.backgroundUrl = res.data.backgroundUrl;
      });
    },
    uploadIcon(option) {
      const formData = new FormData();
      formData.append('file', option.file);
      formData.append('uploadType', 1);
      // 添加其他参数到formData中
      if (this.form.id !== undefined) {
        formData.append('id', this.form.id);

      }
      // 如果还有其他需要传递的参数，可以继续添加
      // 例如：formData.append('paramName', paramValue);
      uploadImg(formData).then(res => {
        if (res.code === 200) {
          // this.iconImg=res.data.path;
          // this.id=res.data.id;
          this.handleAvatarSuccess(res, option.file);

        }
        // this.backgroundUrl = res.data.backgroundUrl;
      });
    },
    uploadCover(option) {
      const formData = new FormData();
      formData.append('file', option.file);
      formData.append('uploadType', 2);
      // 添加其他参数到formData中
      if (this.form.id !== undefined) {
        formData.append('id', this.form.id);

      }
      // 如果还有其他需要传递的参数，可以继续添加
      // 例如：formData.append('paramName', paramValue);
      uploadImg(formData).then(res => {
        if (res.code === 200) {
          // this.coverImg=res.data.path;
          // this.id=res.data.id;
          this.handleCoverAvatarSuccess(res, option.file)
        }
        // this.backgroundUrl = res.data.backgroundUrl;
      });
    },
    handleGameAvatarSuccess(res, file) {
      this.playUrl = res.data.path;
      this.id = res.data.id;
      this.file = file;
      this.form.playUrl = res.data.path;
      this.form.id = res.data.id;
    },

    beforeGameAvatarUpload(file) {
      const isJPNG = file.type === 'application/x-zip-compressed';
      const isLt2M = file.size < 150 * 1024 * 1024;

      if (!isJPNG) {
        this.$message.error('上传游戏包只允许ZIP格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传游戏包大小不能超过 150MB!');
      }

      return isJPNG && isLt2M;
    },
    handleAvatarSuccess(res, file) {
      this.iconImg = res.data.path;
      this.id = res.data.id;
      this.file = file;
      this.form.icon = res.data.path;
      this.form.id = res.data.id;
    },

    beforeAvatarUpload(file) {
      const isJPNG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPNG) {
        this.$message.error('上传图片只允许 JPG或者PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }

      return isJPNG && isLt2M;
    },
    handleCoverAvatarSuccess(res, file) {
      this.coverImg = res.data.path;
      this.id = res.data.id;
      this.file = file;
      this.form.cover = res.data.path;
      this.form.id = res.data.id;
    },

    beforeCoverAvatarUpload(file) {
      const isJPNG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPNG) {
        this.$message.error('上传图片只允许 JPG或者PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }

      return isJPNG && isLt2M;
    },
    /** 查询游戏列表 */
    getList() {
      this.loading = true;
      listPlay(this.queryParams).then(response => {
        this.playList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      }).catch(error => {
        console.error("获取游戏列表失败:", error);
        this.$message.error("获取游戏列表失败，请稍后重试");
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        playNum: undefined,
        icon: undefined,
        cover: undefined,
        playUrl: undefined,
        playName: undefined,
        playStatus: undefined,
        sortNum: undefined,
        playTag: undefined,
        playDesc: undefined,
        direction: undefined,

        playNameList: [{value: '', language: ''}],
        playTagList: [{value: '', language: ''}],
        playDescList: [{value: '', language: ''}]
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加游戏";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.form = {...row};
      if (row.playNameList.length === 0) {
        this.form.playNameList = [{value: '', language: ''}]
      }
      if (row.playTagList.length === 0) {

        this.form.playTagList = [{value: '', language: ''}]
      }
      if (row.playDescList.length === 0) {
        this.form.playDescList = [{value: '', language: ''}]
      }
      // 初始化多语言列表
      // this.form.playNameList = [{ value: row.playName || '', language: '' }];
      // this.form.playTagList = [{ value: row.playTag || '', language: '' }];
      // this.form.playDescList = [{ value: row.playDesc || '', language: '' }];
      this.open = true;
      this.title = "修改游戏";
    },
    // 添加游戏名称输入框
    addPlayName() {
      this.form.playNameList.push({value: '', language: ''});
    },
    // 删除游戏名称输入框
    removePlayName(index) {
      this.form.playNameList.splice(index, 1);
    },
    // 添加游戏标签输入框
    addPlayTag() {
      this.form.playTagList.push({value: '', language: ''});
    },
    // 删除游戏标签输入框
    removePlayTag(index) {
      this.form.playTagList.splice(index, 1);
    },
    // 添加游戏描述输入框
    addPlayDesc() {
      this.form.playDescList.push({value: '', language: ''});
    },
    // 删除游戏描述输入框
    removePlayDesc(index) {
      this.form.playDescList.splice(index, 1);
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          // 准备提交数据
          const submitData = {...this.form};

          if (this.form.id != null) {
            updatePlay(submitData).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
            });
          } else {
            addPlay(submitData).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
            });
          }
        }
        this.getList()
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const playIds = row.id || this.ids;
      this.$modal.confirm('是否确认删除游戏编号为"' + playIds + '"的数据项？').then(function () {
        return delPlay(playIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
        this.$modal.msgError("删除失败");
      });
    },



  }
};
</script>

<style scoped>
.table-image {
  width: 50px;
  height: 50px;
  border-radius: 5px;
}

.cover-image {
  width: 80px;
  height: 50px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #909399;
  font-size: 20px;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
