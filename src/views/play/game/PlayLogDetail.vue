<template>
  <div class="app-container">
    <el-card class="search-card">
      <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dayNodeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card>
      <el-table :data="[playLogDetail]" v-loading="loading" style="width: 100%">
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
    </el-card>
    <el-button style="display: block; margin: 0 auto; background-color: red; color: white;" @click="goBack">返回</el-button>
  </div>
</template>

<script>
import { getPlayLogDetail,getPlayLogDetailByTime } from '@/api/play/play'

export default {
  name: 'PlayLogDetail',
  props: ['playNum'],
  data() {

    return {
      // 显示搜索条件
      showSearch: true,
      dayNodeRange: [],
      queryParams: {
        playNum: undefined
      },
      playLogDetail: {},
      loading: false,
      dictList:[]
    }
  },
  created() {
    this.fetchUserDetail()
    // const deviceCode = this.$route.params && this.$route.params.deviceCode
    this.playNum = this.$route.params.playNum || this.$route.query.playNum

  },
  methods: {
    handleQuery() {
      this.loading = true;
      if (this.dayNodeRange && this.dayNodeRange.length === 2) {
        this.queryParams.startTime = this.dayNodeRange[0];
        this.queryParams.endTime = this.dayNodeRange[1];
      } else {
        this.queryParams.startTime = undefined;
        this.queryParams.endTime = undefined;
      }
      this.queryParams.playNum = this.$route.params.playNum || this.$route.query.playNum;
      getPlayLogDetailByTime(this.queryParams).then(response => {
        this.playLogDetail = response.data;
        this.loading = false;
      }).catch(() => {
        this.$modal.msgError("根据时间查询失败查询失败");
        this.loading = false;
      }).finally(() => {
        this.loading = false;
      });
    },
    /** 重置查询条件 */
    resetQuery() {
      this.dayNodeRange = [];
      this.queryParams.startTime = undefined;
      this.queryParams.endTime = undefined;
      this.$refs.queryForm.resetFields();
      // 重置后重新加载默认数据
      this.fetchUserDetail();
    },
    async fetchUserDetail() {
      this.loading = true
      try {
        const response = await getPlayLogDetail(this.playNum)
        this.playLogDetail = response.data || {}
      } catch (error) {
        this.$message.error('获取游戏事件详情失败')
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.go(-1)
    }


  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
