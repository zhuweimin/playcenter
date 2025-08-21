
<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
      class="query-form"
    >
      <el-form-item label="日期范围" prop="dayNodeRange">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          format="yyyy-MM-dd"          style="width: 240px;"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8 toolbar-row">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="fetchDauData"></right-toolbar>
    </el-row>

    <el-table
      :data="tableData"
      class="data-table"
      border
      v-loading="loading"
      element-loading-text="数据加载中..."
      :fit="true"
    >
      <el-table-column
        prop="dayNode"
        label="日期"
        align="center"
        fixed
        min-width="120"
      >
        <template slot-scope="scope">
          {{ parseTime(scope.row.dayNode, '{y}-{m}-{d}') }}
        </template>
      </el-table-column>

      <el-table-column
        prop="dayCount"
        label="新增用户"
        align="center"
        min-width="100"
      />

      <!-- 动态列 -->
      <el-table-column
        v-for="(item, index) in dynamicColumns"
        :key="index"
        :prop="item.prop"
        :label="item.label"
        align="center"
        min-width="80"
      />

      <!-- 空数据提示 -->
      <template slot="empty">
        <div class="table-empty">
          <i class="el-icon-document"></i>
          <p>暂无数据</p>
        </div>
      </template>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        @current-change="handlePageChange"
        :current-page="queryParams.pageNum"
        :page-size="queryParams.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50, 100]"
        @size-change="handleSizeChange"
        background
        class="pagination"
      />
    </div>
  </div>
</template>

<script>import { dauList } from "@/api/play/dau";

export default {
  name: "DauMonitor",
  data() {
    return {
      loading: false,
      tableData: [],
      dynamicColumns: [],
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        startDate: undefined,
        endDate: undefined
      },
      total: 0,
      showSearch: true,
    };
  },
  created() {
    this.fetchDauData();
  },
  methods: {
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.fetchDauData();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        startDate: undefined,
        endDate: undefined
      };
      this.handleQuery();
    },

    fetchDauData() {
      this.loading = true;
      if (this.dateRange && this.dateRange.length === 2) {
        this.queryParams.startDate = this.dateRange[0];
        this.queryParams.endDate = this.dateRange[1];
      } else {
        this.queryParams.startDate = undefined;
        this.queryParams.endDate = undefined;
      }

      dauList(this.queryParams).then(response => {
        const data = response.data.list || response.data || [];
        this.total = response.data.total || 0;

        // 处理表格数据
        this.processTableData(data);
      }).catch(error => {
        console.error("获取DAU数据失败:", error);
        this.$message.error("获取数据失败");
      }).finally(() => {
        this.loading = false;
      });
    },

    // processTableData(data) {
    //   // 重置动态列
    //   this.dynamicColumns = [];
    //
    //   // 处理数据
    //   this.tableData = data.map(item => {
    //     const row = {
    //       dayNode: item.dayNode,
    //       dayCount: item.registerCount || 0
    //     };
    //
    //     // 处理nodeVOList数组，动态增加列
    //     if (Array.isArray(item.nodeVOList) && item.nodeVOList.length > 0) {
    //       // 创建动态列定义（仅在第一次时）
    //       if (this.dynamicColumns.length === 0) {
    //         item.nodeVOList.forEach((dauItem, index) => {
    //           this.dynamicColumns.push({
    //             label: `第${index + 1}天`,
    //             prop: `dau_${index}`
    //           });
    //         });
    //       }
    //
    //       // 添加dauList数据到行中
    //       item.nodeVOList.forEach((dauItem, index) => {
    //         row[`dau_${index}`] = dauItem.dau + '%' || 0;
    //       });
    //     }
    //
    //     return row;
    //   });
    // },
    /**
     * 处理表格数据，生成动态列
     * @param {Array} data - 原始数据列表
     */
    processTableData(data) {
      // 重置动态列
      this.dynamicColumns = [];

      // 收集所有可能的动态列
      const allDynamicKeys = new Set();

      // 预处理数据，收集所有动态列名
      const processedData = data.map(item => {
        const row = {
          dayNode: item.dayNode,
          dayCount: item.registerCount
        };

        // 处理nodeVOList数组
        if (Array.isArray(item.nodeVOList) && item.nodeVOList.length > 0) {
          item.nodeVOList.forEach((dauItem, index) => {
            const key = `dau_${index}`;
            allDynamicKeys.add(key);
            row[key] = dauItem.dau !== undefined ? `${dauItem.dau}%` : '无数据';
          });
        }

        return row;
      });

      // 根据收集到的所有动态列生成列定义
      this.dynamicColumns = Array.from(allDynamicKeys).map(key => {
        const index = parseInt(key.split('_')[1]);
        return {
          label: `第${index + 1}天`,
          prop: key
        };
      });

      // 按索引排序，确保列顺序正确
      this.dynamicColumns.sort((a, b) => {
        const indexA = parseInt(a.prop.split('_')[1]);
        const indexB = parseInt(b.prop.split('_')[1]);
        return indexA - indexB;
      });

      // 确保每行数据都包含所有动态列（缺失的列设为默认值）
      this.tableData = processedData.map(row => {
        const completeRow = { ...row };

        this.dynamicColumns.forEach(column => {
          if (completeRow[column.prop] === undefined) {
            completeRow[column.prop] = '无数据';
          }
        });

        return completeRow;
      });
    },

    handlePageChange(page) {
      this.queryParams.pageNum = page;
      this.fetchDauData();
    },

    handleSizeChange(val) {
      this.queryParams.pageSize = val;
      this.queryParams.pageNum = 1;
      this.fetchDauData();
    },

    /** 导出按钮操作 */
    handleExport() {
      this.download('/play/dau/exportDauLog', {
        ...this.queryParams
      }, `用户留存_${this.parseTime(new Date(), '{y}{m}{d}')}.xlsx`)
    }
  }
};
</script>

<style scoped>.app-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
}

.query-form {
  margin-bottom: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.query-form ::v-deep .el-form-item {
  margin-bottom: 10px;
}

.toolbar-row {
  margin-bottom: 15px;
}

.data-table {
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.data-table ::v-deep .el-table__header th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.data-table ::v-deep .el-table__row:hover {
  background-color: #f5f7fa;
}

.table-empty {
  padding: 40px 0;
  text-align: center;
  color: #909399;
}

.table-empty i {
  font-size: 48px;
  margin-bottom: 10px;
  color: #c0c4cc;
}

.pagination {
  padding: 15px 0;
  background-color: #fff;
  text-align: right;
}

.pagination ::v-deep .el-pagination__total,
.pagination ::v-deep .el-pagination__jump {
  color: #606266;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }

  .query-form {
    padding: 10px;
  }

  .data-table ::v-deep .el-table__body-wrapper {
    overflow-x: auto;
  }

  .pagination ::v-deep .el-pagination__sizes {
    display: none;
  }

  .toolbar-row ::v-deep .el-col {
    margin-bottom: 10px;
  }
}
</style>
