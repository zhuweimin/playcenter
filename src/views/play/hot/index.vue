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
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
          v-model="queryParams.startTime"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="请选择开始时间"
          clearable
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker
          v-model="queryParams.endTime"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="请选择结束时间"
          clearable
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="启用" value="1"/>
          <el-option label="禁用" value="2"/>
        </el-select>
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

      <right-toolbar :showSearch.sync="showSearch" @queryTable="listHot"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="hotList" @selection-change="handleSelectionChange">
      <el-table-column label="游戏名称" align="center" prop="playName"/>
      <el-table-column label="状态" align="center" prop="statusStr"/>
      <el-table-column label="ICON" align="center" prop="icon">
        <template slot-scope="scope">
          <el-image
            :src="scope.row.icon"
            :preview-src-list="[scope.row.icon]"
            fit="cover"
            class="table-image"
            lazy
            style="width: 100px; height: 50px"
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
            class="table-image"
            lazy
            style="width: 100px; height: 50px"
          >
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sortNum"/>
      <el-table-column label="创建时间" align="center" prop="createTime"/>
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
      @pagination="listHot"
    />

    <!-- 添加或修改游戏横幅对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="选择游戏">
          <el-select
            v-model="form.playId"
            filterable
            remote
            reserve-keyword
            placeholder="请输入游戏名称搜索"
            :remote-method="searchPlayList"
            :loading="playLoading"
            style="width: 100%"
            @change="handlePlayChange"
          >
            <el-option
              v-for="item in playOptions"
              :key="item.id"
              :label="item.playName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1" :key="1">启用</el-radio>
            <el-radio :label="2" :key="2">禁用</el-radio>
          </el-radio-group>
        </el-form-item>


        <el-form-item label="排序" prop="sortNum">
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
import {playList} from "@/api/play/play";
import {listHot, saveHot, updateHot, delHot} from "@/api/play/hot";


export default {
  name: "PlayHot",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 遮罩层（游戏搜索）
      playLoading: false,
      // 选中数组
      ids: [],
      id: undefined,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 游戏横幅表格数据
      hotList: [],
      // 游戏选项列表
      playOptions: [],
      // 所有游戏选项列表（用于本地过滤）
      allPlayOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 0,
        pageSize: 10,
        playName: undefined,
        status: undefined,
        endTime: undefined,
        startTime: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        playId: [
          {required: true, message: "请选择游戏", trigger: "change"}
        ],
        sortNum: [
          {required: true, message: "排序不能为空", trigger: "blur"}
        ]

      }
    };
  },
  created() {
    this.listHot();
  },
  methods: {

    /** 查询游戏横幅列表 */
    listHot() {
      this.loading = true;
      listHot(this.queryParams).then(response => {
        this.hotList = response.data.list;
        this.total = response.data.total;
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
        playId: undefined,
        sortNum: undefined,
        status: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 0;
      this.listHot();
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
      // 查询游戏列表
      this.searchPlayList();
      this.open = true;
      this.title = "添加游戏横幅";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      // 获取横幅详细信息
      // 这里应该调用获取横幅详情的接口
      // 模拟获取数据
      this.form =row;
      row.createTime = '';
      // 查询游戏列表
      this.searchPlayList();
      this.open = true;
      this.title = "修改HOT区域";
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          // 这里应该调用新增或修改横幅的接口
          if (this.form.id != null) {
            updateHot(this.form).then(response => {
              if(response.code === 200){
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.listHot();
              }else{
                this.$modal.msgError(response.msg);
              }

            })
          } else {
            saveHot(this.form).then(response => {
              if(response.code === 200) {
                this.$modal.msgSuccess("新增成功");
                this.open = false;
                this.listHot();
              }else{
                this.$modal.msgError(response.msg);
              }
            })
          }


        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const hotIds = row.id || this.ids;

      this.$modal.confirm('是否确认删编号为"' + hotIds + '"的数据项？').then(() => {
        this.loading=true;
        // 这里应该调用删除横幅的接口
        return delHot(hotIds);
        // 模拟删除操作

      }).then(() => {
        this.listHot();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    /** 搜索游戏列表 */
    searchPlayList(query) {

      if (query !== undefined) {
        // 前端本地过滤
        this.playOptions = this.playOptions.filter(item =>
          item.playName.toLowerCase().includes(query.toLowerCase())
        );
        return;
      }
      // 查询所有游戏
      this.playLoading = true;
      playList(1).then(response => {
        this.playOptions = response.data;
        this.allPlayOptions = response.data;
        this.playLoading = false;
      });

    },
    /** 选择游戏 */
    handlePlayChange(value) {
      const selectedPlay = this.playOptions.find(item => item.id === value);
      if (selectedPlay) {
        this.form.playName = selectedPlay.playName;
      }
    }
  }
};
</script>

<style scoped>
.table-image {
  width: 100px;
  height: 50px;
  border-radius: 5px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #909399;
  font-size: 20px;
  background: #f5f7fa;
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

