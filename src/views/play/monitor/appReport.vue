
<!-- src/views/statistics/data/index.vue -->
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="日期范围" prop="dayNodeRange">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          format="yyyy-MM-dd"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
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

    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="日期" align="center" prop="dayNode" width="100">

      </el-table-column>
      <el-table-column label="新增注册数" align="center" prop="registerCount" />
      <el-table-column label="APP启动次数" align="center" prop="openAppCount" />
      <el-table-column label="激励观看次数" align="center" prop="rewardViewCount" />
      <el-table-column label="插页观看次数" align="center" prop="insertViewCount" />
      <el-table-column label="日活跃用户" align="center" prop="dau" />
      <el-table-column label="平均加载时长(秒)" align="center" prop="loadTime" />
      <el-table-column label="人均打开app次数" align="center" prop="peopleCount">
        <template slot-scope="scope">
          {{ scope.row.peopleCount }}%
        </template>
      </el-table-column>
      <el-table-column label="人均游戏时长(秒)" align="center" prop="peoplePlayTime" />
      <el-table-column label="总游戏时长(秒)" align="center" prop="totalPlayTime" />
      <el-table-column label="总金额(元)" align="center" prop="totalAmount" />

    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import {reportList, exportData} from "@/api/play/dau";

export default {
  name: "DataStatistics",
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
      // 数据列表
      dataList: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        startTime: undefined,
        endTime: undefined
      }

    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询数据列表 */
    getList() {
      this.loading = true;
      if (this.dateRange && this.dateRange.length === 2) {
        this.queryParams.startTime = this.dateRange[0];
        this.queryParams.endTime = this.dateRange[1];
      } else {
        this.queryParams.startTime = undefined;
        this.queryParams.endTime = undefined;
      }

      reportList(this.queryParams).then(response => {
        this.dataList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      }).catch(() => {
        this.$modal.msgError("列表查询失败");
        this.loading = false;
      });
    },



    // 从响应头获取文件名
    getFileNameFromResponse(response) {

      // 默认文件名
      return `报表数据_${this.parseTime(new Date(), '{y}{m}{d}')}.xlsx`;
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
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$modal.confirm('是否确认导出数据？').then(() => {
        return exportData(this.queryParams);
      }).then(response => {
        // 创建文件名
        const filename = this.getFileNameFromResponse(response);

        // 下载文件
        this.downloadFile(response, filename);
      }).catch(err => {
        console.error('导出失败:', err);
        this.$message.error('导出失败');
      });
    }

  }
};
</script>
