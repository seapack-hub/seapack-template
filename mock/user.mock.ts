import { MockMethod } from 'vite-plugin-mock';
export default [
  {
    url: '/api/users/me',
    method: 'GET',
    response: () => {
      return {
        code: 0,
        data: {
          userId: 2,
          username: 'admin',
          nickname: '系统管理员',
          avatar: 'https://foruda.gitee.com/images/1723603502796844527/03cdca2a_716974.gif',
          roles: ['ADMIN'],
          perms: [
            'sys:notice:edit',
            'sys:menu:delete',
            'sys:dict:edit',
            'sys:notice:query',
            'sys:dict:delete',
            'sys:config:add',
            'sys:config:refresh',
            'sys:menu:add',
            'sys:user:add',
            'sys:user:export',
            'sys:role:edit',
            'sys:dept:delete',
            'sys:config:update',
            'sys:user:password:reset',
            'sys:notice:revoke',
            'sys:user:import',
            'sys:user:delete',
            'sys:dict_type:delete',
            'sys:dict:add',
            'sys:role:add',
            'sys:notice:publish',
            'sys:notice:delete',
            'sys:dept:edit',
            'sys:dict_type:edit',
            'sys:user:query',
            'sys:user:edit',
            'sys:config:delete',
            'sys:dept:add',
            'sys:notice:add',
            'sys:role:delete',
            'sys:menu:edit',
            'sys:config:query'
          ]
        },
        msg: '一切ok'
      };
    }
  },

  {
    url: '/api/users/page',
    method: 'GET',
    response: () => {
      return {
        code: 0,
        data: {
          list: [
            {
              id: 2,
              username: 'admin',
              nickname: '系统管理员',
              mobile: '17621210366',
              gender: 1,
              avatar: 'https://foruda.gitee.com/images/1723603502796844527/03cdca2a_716974.gif',
              email: '',
              status: 1,
              deptId: 1,
              deptName: '海峰科技',
              createTime: '2014-07-07',
              roleIds: [2]
            },
            {
              id: 3,
              username: 'test',
              nickname: '测试小用户',
              mobile: '17621210366',
              gender: 1,
              avatar: 'https://foruda.gitee.com/images/1723603502796844527/03cdca2a_716974.gif',
              email: 'youlaitech@163.com',
              status: 1,
              deptId: 3,
              deptName: '产品部门',
              createTime: '2024-07-11',
              roleIds: [3]
            }
          ],
          total: 2
        },
        msg: '一切ok'
      };
    }
  },

  // 新增用户
  {
    url: '/api/users',
    method: 'POST',
    response: ({ body }) => {
      return {
        code: 0,
        data: null,
        msg: '新增用户' + body.nickname + '成功'
      };
    }
  },

  // 获取用户表单数据
  {
    url: '/api/users/:userId/form',
    method: 'GET',
    response: ({ params }) => {
      return {
        code: 0,
        data: userMap[params.userId],
        msg: '一切ok'
      };
    }
  },
  // 修改用户
  {
    url: '/api/users/:userId',
    method: 'PUT',
    response: ({ body }) => {
      return {
        code: 0,
        data: null,
        msg: '修改用户' + body.nickname + '成功'
      };
    }
  },

  // 删除用户
  {
    url: '/api/users/:userId',
    method: 'DELETE',
    response: ({ params }) => {
      return {
        code: 0,
        data: null,
        msg: '删除用户' + params.id + '成功'
      };
    }
  },

  // 重置密码
  {
    url: '/api/users/:userId/password/reset',
    method: 'PUT',
    response: ({ query }) => {
      return {
        code: 0,
        data: null,
        msg: '重置密码成功，新密码为：' + query.password
      };
    }
  },

  // 导出Excel
  {
    url: '/api/users/_export',
    method: 'GET',
    headers: {
      'Content-Disposition': 'attachment; filename=%E7%94%A8%E6%88%B7%E5%88%97%E8%A1%A8.xlsx',
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  },

  {
    url: '/api/users/profile',
    method: 'GET',
    response: () => {
      return {
        code: 0,
        data: {
          id: 2,
          username: 'admin',
          nickname: '系统管理员',
          avatar: 'https://foruda.gitee.com/images/1723603502796844527/03cdca2a_716974.gif',
          gender: 1,
          mobile: '17621210366',
          email: null,
          deptName: '有来技术',
          roleNames: '系统管理员',
          createTime: '2019-10-10'
        }
      };
    }
  },

  {
    url: '/api/users/profile',
    method: 'PUT',
    response: () => {
      return {
        code: 0,
        data: null,
        msg: '修改个人信息成功'
      };
    }
  },

  {
    url: '/api/users/password',
    method: 'PUT',
    response: () => {
      return {
        code: 0,
        data: null,
        msg: '修改密码成功'
      };
    }
  }
] as MockMethod[];

// 用户映射表数据
const userMap: Record<string, any> = {
  2: {
    id: 2,
    username: 'admin',
    nickname: '系统管理员',
    mobile: '17621210366',
    gender: 1,
    avatar: 'https://foruda.gitee.com/images/1723603502796844527/03cdca2a_716974.gif',
    email: '',
    status: 1,
    deptId: 1,
    roleIds: [2]
  },
  3: {
    id: 3,
    username: 'test',
    nickname: '测试小用户',
    mobile: '17621210366',
    gender: 1,
    avatar: 'https://foruda.gitee.com/images/1723603502796844527/03cdca2a_716974.gif',
    email: 'youlaitech@163.com',
    status: 1,
    deptId: 3,
    roleIds: [3]
  }
};
