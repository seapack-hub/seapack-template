<template>
  <div class="app-container">
    <el-row
      :gutter="20"
      class="row-style"
    >
      <el-col :span="4">
        <DeptTree
          v-model="queryParams.deptId"
          @node-click="handleQuery"
        />
      </el-col>
      <!--用户列表-->
      <el-col :span="20">
        <!--查询条件-->
        <div class="search-bar">
          <el-form
            ref="queryFormRef"
            :model="queryParams"
            :inline="true"
          >
            <el-form-item
              label="关键字"
              prop="keywords"
            >
              <el-input
                v-model="queryParams.keywords"
                placeholder="用户名/昵称/手机号"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item
              label="状态"
              prop="status"
            >
              <el-select
                v-model="queryParams.status"
                placeholder="全部"
                clearable
                style="width: 150px"
              >
                <el-option
                  label="正常"
                  :value="1"
                />
                <el-option
                  label="禁用"
                  :value="0"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="创建时间">
              <el-date-picker
                v-model="queryParams.createTime"
                :editable="false"
                type="daterange"
                range-separator="~"
                start-placeholder="开始时间"
                end-placeholder="截止时间"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                icon="search"
                @click="handleQuery"
              >
                搜索
              </el-button>
              <el-button
                icon="refresh"
                @click="handleResetQuery"
              >
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-card
          class="el-card-main"
          shadow="never"
        >
          <div class="table-search">
            <div>
              <el-button
                type="success"
                icon="plus"
              >
                新增
              </el-button>
              <el-button
                type="danger"
                icon="delete"
                :disabled="selectIds.length === 0"
                @click="handleDelete()"
              >
                删除
              </el-button>
            </div>
            <div>
              <el-button icon="upload">
                导入
              </el-button>

              <el-button icon="download">
                导出
              </el-button>
            </div>
          </div>

          <el-table
            v-loading="loading"
            :data="pageData"
            border
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              width="50"
              align="center"
            />
            <el-table-column
              label="用户名"
              prop="username"
              min-width="120px"
            />
            <el-table-column
              label="昵称"
              min-width="120px"
              align="center"
              prop="nickname"
            />
            <el-table-column
              label="性别"
              min-width="100"
              align="center"
              prop="gender"
            >
              <template #default="scope">
                <!-- 性别字典翻译 -->
                <el-tag :type="scope.row.gender == 1 ? 'success' : 'info'">
                  {{ scope.row.gender == 1 ? '男' : '女' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="部门"
              min-width="100"
              align="center"
              prop="deptName"
            />
            <el-table-column
              label="手机号码"
              align="center"
              prop="mobile"
              min-width="120"
            />
            <el-table-column
              label="状态"
              align="center"
              prop="status"
              min-width="80"
            >
              <template #default="scope">
                <el-tag :type="scope.row.status == 1 ? 'success' : 'info'">
                  {{ scope.row.status == 1 ? '正常' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              label="创建时间"
              align="center"
              prop="createTime"
              min-width="120"
            />
            <el-table-column
              label="操作"
              fixed="right"
              min-width="180"
            >
              <template #default="scope">
                <el-button
                  v-hasPerm="'sys:user:password:reset'"
                  type="primary"
                  icon="RefreshLeft"
                  size="small"
                  link
                  @click="hancleResetPassword(scope.row)"
                >
                  重置密码
                </el-button>
                <el-button
                  v-hasPerm="'sys:user:edit'"
                  type="primary"
                  icon="edit"
                  link
                  size="small"
                >
                  编辑
                </el-button>
                <el-button
                  v-hasPerm="'sys:user:delete'"
                  type="danger"
                  icon="delete"
                  link
                  size="small"
                  @click="handleDelete(scope.row.id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <Pagination
            v-if="total > 0"
            v-model:total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="handleQuery"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import DeptTree from './components/DeptTree.vue';
import UserAPI, { UserPageQuery, UserPageVO } from '@/api/system/user';

const queryFormRef = ref(ElForm);
//const userFormRef = ref(ElForm);
const queryParams = reactive<UserPageQuery>({
  pageNum: 1,
  pageSize: 10
});

const pageData = ref<UserPageVO[]>();
const total = ref(0);
const loading = ref(false);

// 选中的用户ID
const selectIds = ref<number[]>([]);
// 部门下拉数据源
//const deptOptions = ref<OptionType[]>();
// 角色下拉数据源
//const roleOptions = ref<OptionType[]>();
// 导入弹窗显示状态
//const importDialogVisible = ref(false);

// 查询
function handleQuery() {
  loading.value = true;
  UserAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  queryParams.deptId = undefined;
  queryParams.createTime = undefined;
  handleQuery();
}

/**
 * 删除用户
 *
 * @param id  用户ID
 */
function handleDelete(id?: number) {
  const userIds = [id || selectIds.value].join(',');
  if (!userIds) {
    ElMessage.warning('请勾选删除项');
    return;
  }

  ElMessageBox.confirm('确认删除用户?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(
    function () {
      loading.value = true;
      UserAPI.deleteByIds(userIds)
        .then(() => {
          ElMessage.success('删除成功');
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    function () {
      ElMessage.info('已取消删除');
    }
  );
}

// 选中项发生变化
function handleSelectionChange(selection: any[]) {
  selectIds.value = selection.map((item) => item.id);
}

// 重置密码
function hancleResetPassword(row: UserPageVO) {
  ElMessageBox.prompt('请输入用户【' + row.username + '】的新密码', '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(
    ({ value }) => {
      if (!value || value.length < 6) {
        ElMessage.warning('密码至少需要6位字符，请重新输入');
        return false;
      }
      UserAPI.resetPassword(row.id, value).then(() => {
        ElMessage.success('密码重置成功，新密码是：' + value);
      });
    },
    () => {
      ElMessage.info('已取消重置密码');
    }
  );
}

onMounted(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped>
.app-container {
  .row-style {
    height: calc(100vh - 130px);
    .el-card-main {
      height: calc(100% - 80px);
      .table-search {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .el-table {
        margin-top: 10px;
      }
    }
  }
}
</style>
