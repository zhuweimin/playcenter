<template>
  <div class="app-container">
    <el-card style="margin-bottom: 10px;">
      <div slot="header">
        <span>用户基本信息</span>

      </div>

      <el-descriptions :column="4" border>
        <el-descriptions-item label="设备码">{{ userInfo.deviceCode }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ userInfo.registerDate }}</el-descriptions-item>
        <el-descriptions-item label="国家">
            <span>{{ userInfo.country | countryName }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card>
      <div slot="header">
        <span>事件数据</span>
      </div>

      <el-table :data="[userInfo]" v-loading="loading" style="width: 100%">
        <el-table-column prop="createTime" label="首次启动时间" align="center" />
        <el-table-column prop="firstLoadCount" label="首次加载时长" align="center" />
        <el-table-column prop="firstPlayCount" label="首次游戏时长" align="center" />
        <el-table-column prop="prodId" label="转化产品id" align="center" />
        <el-table-column prop="playName" label="转化游戏名称" align="center" />
        <el-table-column prop="totalPlayCount" label="总游戏时长" align="center" />
        <el-table-column prop="totalLoadCount" label="总加载时长" align="center" />
        <el-table-column prop="rewardCount" label="激励视频观看次数" align="center" />
        <el-table-column prop="insertCount" label="插页视频观看次数" align="center" />
        <el-table-column prop="homeCount" label="首页浏览次数" align="center" />
        <el-table-column prop="moreCount" label="多屏观看次数" align="center" />
        <el-table-column prop="openCount" label="APP打开次数" align="center" />
        <el-table-column prop="homeClickCount" label="首页点击次数" align="center" />
      </el-table>
    </el-card>
    <el-button style="display: block; margin: 0 auto; background-color: red; color: white;" @click="goBack">返回</el-button>
  </div>
</template>

<script>
import { getUserDetail } from '@/api/play/user'

export default {
  name: 'UserDetail',
  props: ['deviceCode'],
  data() {

    return {
      userInfo: {},
      loading: false,
      dictList:[]
    }
  },
  created() {
    this.fetchUserDetail()
    // const deviceCode = this.$route.params && this.$route.params.deviceCode
    this.deviceCode = this.$route.params.deviceCode || this.$route.query.deviceCod

  },
  methods: {
    async fetchUserDetail() {
      this.loading = true
      try {
        const response = await getUserDetail(this.deviceCode)
        this.userInfo = response.data || {}
      } catch (error) {
        this.$message.error('获取用户详情失败')
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
