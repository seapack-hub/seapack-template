import { MockMethod } from 'vite-plugin-mock';
export default [
  {
    url: '/api/dept/options',
    method: 'GET',
    response: () => {
      return {
        code: 0,
        data: [
          {
            value: 1,
            label: '海峰科技',
            children: [
              {
                value: 2,
                label: '研发部门'
              },
              {
                value: 3,
                label: '产品部门'
              },
              {
                value: 4,
                label: '人力资源部门'
              },
              {
                value: 5,
                label: '项目交付部门'
              },
              {
                value: 6,
                label: '财务部门'
              },
              {
                value: 7,
                label: '采购部门'
              },
              {
                value: 8,
                label: '总裁办'
              }
            ]
          }
        ],
        msg: '一切ok'
      };
    }
  },

  {
    url: '/api/dept',
    method: 'GET',
    response: () => {
      return {
        code: 0,
        data: [
          {
            id: 1,
            parentId: 0,
            name: '海峰科技',
            code: 'YOULAI',
            sort: 1,
            status: 1,
            children: [
              {
                id: 2,
                parentId: 1,
                name: '研发部门',
                code: 'RD001',
                sort: 1,
                status: 1,
                children: [],
                createTime: null,
                updateTime: '2022-04-19 12:46'
              },
              {
                id: 3,
                parentId: 1,
                name: '产品部门',
                code: 'QA001',
                sort: 1,
                status: 1,
                children: [],
                createTime: null,
                updateTime: '2022-04-19 12:46'
              },
              {
                id: 4,
                parentId: 1,
                name: '人力资源部门',
                code: 'QB001',
                sort: 1,
                status: 1,
                children: [],
                createTime: null,
                updateTime: '2022-04-19 12:46'
              },
              {
                id: 5,
                parentId: 1,
                name: '项目交付部门',
                code: 'QC001',
                sort: 1,
                status: 1,
                children: [],
                createTime: null,
                updateTime: '2022-04-19 12:46'
              },
              {
                id: 6,
                parentId: 1,
                name: '财务部门',
                code: 'QD001',
                sort: 1,
                status: 1,
                children: [],
                createTime: null,
                updateTime: '2022-04-19 12:46'
              },
              {
                id: 7,
                parentId: 1,
                name: '采购部门',
                code: 'QE001',
                sort: 1,
                status: 1,
                children: [],
                createTime: null,
                updateTime: '2022-04-19 12:46'
              },
              {
                id: 8,
                parentId: 1,
                name: '总裁办',
                code: 'QF001',
                sort: 1,
                status: 1,
                children: [],
                createTime: null,
                updateTime: '2022-04-19 12:46'
              }
            ],
            createTime: null,
            updateTime: null
          }
        ],
        msg: '一切ok'
      };
    }
  },

  // 新增部门
  {
    url: '/api/dept',
    method: 'post',
    response: ({ body }) => {
      return {
        code: 0,
        data: null,
        msg: '新增部门' + body.name + '成功'
      };
    }
  },

  // 获取部门表单数据
  {
    url: '/api/dept/:id/form',
    method: 'GET',
    response: ({ body }) => {
      return {
        code: 0,
        data: deptMap[body.id],
        msg: '一切ok'
      };
    }
  },

  // 修改部门
  {
    url: '/api/dept/:id',
    method: 'PUT',
    response: ({ params }) => {
      return {
        code: 0,
        data: null,
        msg: '修改部门' + params.name + '成功'
      };
    }
  },

  // 删除部门
  {
    url: '/api/dept/:id',
    method: 'DELETE',
    response: ({ params }) => {
      return {
        code: 0,
        data: null,
        msg: '删除部门' + params.id + '成功'
      };
    }
  }
] as MockMethod[];

// 部门映射表数据
const deptMap: Record<string, any> = {
  1: {
    id: 1,
    name: '海峰科技',
    code: 'YOULAI',
    parentId: 0,
    status: 1,
    sort: 1
  },
  2: {
    id: 2,
    name: '研发部门',
    code: 'RD001',
    parentId: 1,
    status: 1,
    sort: 1
  },
  3: {
    id: 3,
    name: '产品部门',
    code: 'QA001',
    parentId: 1,
    status: 1,
    sort: 1
  },
  4: {
    id: 4,
    name: '人力资源部门',
    code: 'QB001',
    parentId: 1,
    status: 1,
    sort: 1
  },
  5: {
    id: 5,
    name: '项目交付部门',
    code: 'QC001',
    parentId: 1,
    status: 1,
    sort: 1
  },
  6: {
    id: 6,
    name: '财务部门',
    code: 'QD001',
    parentId: 1,
    status: 1,
    sort: 1
  },
  7: {
    id: 7,
    name: '采购部门',
    code: 'QE001',
    parentId: 1,
    status: 1,
    sort: 1
  },
  8: {
    id: 8,
    name: '总裁办',
    code: 'QF001',
    parentId: 1,
    status: 1,
    sort: 1
  }
};
