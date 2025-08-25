<template>
  <div class="app-container">
    <!-- 查询条件区域 -->
    <div class="filter-container">
      <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="  dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd"
          ></el-date-picker>
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
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            icon="el-icon-download"
            size="mini"
            @click="handleExport"
          >导出</el-button>
        </el-col>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <!-- 数据展示区域 -->
    <el-table :data="playLogDetail" v-loading="loading" style="width: 100%" border>
      <el-table-column prop="playNum" label="产品id" align="center" />
      <el-table-column prop="playName" label="游戏名称" align="center" />
      <el-table-column prop="dauCount" label="每日活跃用户DAU" align="center" />
      <el-table-column prop="totalLoadTime" label="加载时长(秒)" align="center" />
      <el-table-column prop="peopleLoadTime" label="人均加载时长(秒)" align="center" />
      <el-table-column prop="playCount" label="总次数" align="center" />
      <el-table-column prop="peopleCount" label="人均次数" align="center" />
      <el-table-column prop="totalPlayTime" label="游戏时长(总)" align="center" />
      <el-table-column prop="peoplePlayTime" label="人均游戏时长(秒)" align="center" />
      <el-table-column prop="insertViewCount" label="插页观看数量(总)" align="center" />
      <el-table-column prop="peopleInsertViewCount" label="人均插页观看次数" align="center" />
      <el-table-column prop="rewardViewCount" label="激励观看次数(总)" align="center" />
      <el-table-column prop="peopleRewardViewCount" label="人均激励观看次数" align="center" />
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="fetchUserDetail"
    />
    <!-- 操作按钮区域 -->

  </div>
</template>

<script>
import {getPlayLogList } from '@/api/play/play'

export default {
  name: 'PlayLogDetail',
  data() {

    return {
      dateRange: [],
      // 总条数
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        playNum: undefined,
        startTime: undefined,
        endTime: undefined
      },
      playLogDetail: [],
      loading: false
    }
  },
  created() {
    this.fetchUserDetail()
  },
  methods: {
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.fetchUserDetail();
    },
    /** 重置查询条件 */
    resetQuery() {
      this.dateRange = [];
      this.queryParams.startTime = undefined;
      this.queryParams.endTime = undefined;
      this.queryParams.playNum = undefined;
      this.$refs.queryForm.resetFields();
      // 重置后重新加载默认数据
      this.fetchUserDetail();
    },
    async fetchUserDetail() {
      this.loading = true
      try {
        if (this.dateRange && this.dateRange.length === 2) {
          this.queryParams.startTime = this.dateRange[0];
          this.queryParams.endTime = this.dateRange[1];
        } else {
          this.queryParams.startTime = undefined;
          this.queryParams.endTime = undefined;
        }
        const response = await getPlayLogList(this.queryParams)
        this.playLogDetail = response.data.list || []
        this.total = response.data.total || {}
      } catch (error) {
        this.$message.error('获取游戏事件详情失败')
      } finally {
        this.loading = false
      }
    },
    handleExport() {
      this.download('/play/info/export', {
        ...this.queryParams

      }, `游戏事件_${this.parseTime(new Date(), '{y}{m}{d}')}.xlsx`)
    }

  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.filter-container {
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-container .el-form-item {
  margin-bottom: 0;
}

.pagination-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
