<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="设备码">
        <el-input
          v-model="queryParams.deviceCode"
          placeholder="请输入设备码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户类型" prop="userType">
        <el-select
          v-model="queryParams.userType"
          placeholder="用户类型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in dict.type.user_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
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
    </el-row>
    <el-table v-loading="loading" :data="userList" >
      <el-table-column label="设备码" align="center"    :show-overflow-tooltip="false">
        <template slot-scope="scope">
          <router-link
            :to="{ name: 'UserDetail', params: { deviceCode: scope.row.deviceCode } }"
            class="link-type">
            <span>{{ scope.row.deviceCode }}</span>
          </router-link>

        </template>
      </el-table-column>
      <el-table-column label="注册时间" align="center" prop="registerDate" width="180" />
      <el-table-column label="国家" align="center" prop="country">
        <template slot-scope="scope">
          <span>{{ scope.row.country | countryName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户类型" align="center" prop="userType">
        <template slot-scope="scope">
          <span>{{ scope.row.userType === 1 ? '自然流量' : '深链' }}</span>
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
  </div>
</template>

<script>
import { getUserList } from "@/api/play/user";
export default {
  name: "UserList",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      userList: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userType: undefined,
        deviceCode: undefined
      },
      // 字典数据
      dict: {
        type: {
          user_type: [
            { value: 1, label: "自然流量" },
            { value: 2, label: "深链" }
          ]
        }
      }
    };

  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      if (this.dateRange && this.dateRange.length === 2) {
        this.queryParams.startTime = this.dateRange[0];
        this.queryParams.endTime = this.dateRange[1];
      } else {
        this.queryParams.startTime = undefined;
        this.queryParams.endTime = undefined;
      }
      getUserList(this.queryParams).then(response => {
        this.userList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      }).catch(() => {
        this.$modal.msgError("列表查询失败");
        this.loading = false;
      });
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
    handleExport() {
      this.download('/play/user/export', {
        ...this.queryParams

      }, `用户事件_${this.parseTime(new Date(), '{y}{m}{d}')}.xlsx`)
    }

  }

};
</script>
