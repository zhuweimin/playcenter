<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form :model="queryParam" ref="queryForm" :inline="true" label-width="68px" class="query-form">
      <el-form-item label="设备码" prop="deviceCode">
        <el-input
          v-model="queryParam.deviceCode"
          placeholder="请输入设备码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="游戏名称" prop="playName">
        <el-input
          v-model="queryParam.playName"
          placeholder="请输入游戏名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="事件类型" prop="eventType">
        <el-select
          v-model="queryParam.eventType"
          placeholder="请选择事件类型"
          clearable
          size="small"    style="width: 150px"
          @clear="handleEventTypeClear"
        >
          <el-option
            v-for="dict in eventTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="时间范围">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>

      <el-form-item label="语种" prop="language">
        <el-select
          v-model="queryParam.language"
          placeholder="请选择语种"
          clearable
          size="small"
          style="width: 150px"
        >
          <el-option
            v-for="dict in languageOptions"
            :key="dict.dictValue"
            :label="dict.dictValue"
            :value="dict.dictLabel"
          />
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
          @click="flushCacheData"
        >刷新缓存</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="tableData" style="width: 100%" border>
      <el-table-column prop="eventType" label="事件类型" min-width="120" align="center">
        <template slot-scope="scope">
          <span>{{ getDictLabel(eventTypeOptions, scope.row.eventType) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="count" label="数量 / 时长(S)" min-width="120" align="center"/>
      <el-table-column prop="playName" label="游戏名称" min-width="120" align="center"/>
      <el-table-column prop="cntyReg" label="所在国家" min-width="100" align="center"/>
      <el-table-column prop="deviceCode" label="设备码" min-width="150" align="center"/>
      <el-table-column prop="createTime" label="上报时间" min-width="160" align="center"/>
    </el-table>


    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParam.pageNum"
      :limit.sync="queryParam.pageSize"
      @pagination="getList"
    />

    <!-- 查看详情对话框 -->

  </div>
</template>

<script>
import { eventList,flushData,exportData } from "@/api/play/event";
import { getDicts } from "@/api/system/dict/data";

export default {
  name: "EventMonitor",
  components: {},
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      tableData: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 表单参数
      form: {},
      // 查询参数
      queryParam: {
        pageNum: 1,
        pageSize: 10,
        deviceCode: undefined,
        eventType: '',
        language: undefined,
        playName: undefined,
        startLogDate: undefined,
        endLogDate: undefined
      },
      // 事件类型字典
      eventTypeOptions: [],
      // 语种字典
      languageOptions: []
    };
  },
  created() {
    this.getDicts();
    this.getList();
  },
  methods: {
    /** 刷新事件缓存的数据 */
    flushCacheData() {
      this.loading = true;
      flushData().then(response => {
        this.getList();
        this.loading = false;
      }).catch(() => {
        this.loading = false;
        this.$modal.msgError("刷新失败" + response.msg);
      });
    },
    /** 查询事件列表 */
    getList() {
      this.loading = true;
      // 处理时间范围参数
      if (this.dateRange && this.dateRange.length === 2) {
        this.queryParam.startLogDate = this.dateRange[0];
        this.queryParam.endLogDate = this.dateRange[1];
      } else {
        this.queryParam.startLogDate = undefined;
        this.queryParam.endLogDate = undefined;
      }

      eventList(this.queryParam).then(response => {
        this.tableData = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 事件类型清除事件处理 */
    handleEventTypeClear() {
      // 清除事件类型筛选条件后重新查询列表
      this.queryParam.pageNum = 1;
      this.getList();
    },
    // 获取字典数据
    getDicts() {
      // 获取事件类型字典
      getDicts("event_type").then(response => {
        this.eventTypeOptions = response.data;
      });

      // 获取语种字典
      getDicts("language_type").then(response => {
        this.languageOptions = response.data;
      });
    },
    // 获取字典标签
    getDictLabel(dictOptions, value) {
      const dict = dictOptions.find(item => item.dictValue === value);
      return dict ? dict.dictLabel : value;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParam.pageNum = 1;
      this.getList();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },

    /** 重置表单 */
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },


    /** 导出按钮操作 */
    handleExport() {
      this.$modal.confirm('是否确认导出数据？').then(() => {
        this.queryParam.pageNum = undefined;
        this.queryParam.pageSize = undefined;
        return exportData(this.queryParam);
      }).then(response => {
        // 创建文件名
        const filename = this.getFileNameFromResponse(response);

        // 下载文件
        this.downloadFile(response, filename);
      }).catch(err => {
        console.error('导出失败:', err);
        this.$message.error('导出失败');

      }).finally(() => {
        this.resetQuery();
      });
    },
    downloadFile(data, filename) {
      const blob = new Blob([data]);

      if ('download' in document.createElement('a')) {
        // 非IE下载
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // IE10+下载
        navigator.msSaveBlob(blob, filename);
      }

    },
    // 从响应头获取文件名
    getFileNameFromResponse(response) {
      // 默认文件名
      return `事件流水_${this.parseTime(new Date(), '{y}{m}{d}')}.xlsx`;
    }
  }
};





</script>

<style scoped>
.app-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.query-form {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.query-form .el-form-item {
  margin-bottom: 10px;
}

.pagination-container {
  background: #fff;
  margin-top: 20px;
  text-align: center;
}

.mb8 {
  margin-bottom: 8px;
}

.small-padding /deep/ .cell {
  padding-left: 8px;
  padding-right: 8px;
}

.fixed-width /deep/ .el-button--mini {
  padding: 3px 6px;
  width: 50px;
}

/* 表格样式优化 */
.el-table {
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.el-table th {
  background-color: #f5f7fa !important;
  font-weight: bold;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .query-form .el-form-item {
    display: block;
    margin-bottom: 12px;
  }

  .query-form .el-form-item .el-form-item__label {
    display: block;
    text-align: left;
    padding: 0 0 5px 0;
  }

  .query-form .el-form-item .el-form-item__content {
    display: block;
  }
}
</style>

