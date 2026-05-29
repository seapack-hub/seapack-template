// ========== 大盘指数数据类型 ==========
export interface MarketIndex {
  name: string       // 指数名称
  code: string       // 指数代码
  price: string      // 当前点数（含千分位逗号）
  change: number     // 涨跌点数
  changePct: number  // 涨跌幅百分比
}

// ========== 行业树节点类型 ==========
export interface IndustryNode {
  id: string              // 节点唯一标识
  label: string           // 节点显示名称
  count: number           // 该分类下股票数量
  children?: IndustryNode[] // 子节点
}

// ========== 大盘指数模拟数据 ==========
export const marketIndices: MarketIndex[] = [
  { name: '上证指数', code: '000001', price: '3,289.45', change: 26.78, changePct: 0.82 },
  { name: '深证成指', code: '399001', price: '10,456.82', change: 62.34, changePct: 0.60 },
  { name: '创业板指', code: '399006', price: '2,156.33', change: -8.21, changePct: -0.38 },
  { name: '科创50', code: '000688', price: '967.12', change: 5.43, changePct: 0.56 },
  { name: '沪深300', code: '000300', price: '3,892.67', change: 15.22, changePct: 0.39 },
  { name: '中证500', code: '000905', price: '5,678.90', change: -12.34, changePct: -0.22 },
]

// ========== 行业板块树形数据 ==========
export const industryTree: IndustryNode[] = [
  {
    id: 'all', label: '全部分类', count: 120,
    children: [
      { id: 'tech', label: '科技', count: 28, children: [
        { id: 'semi', label: '半导体', count: 8 },
        { id: 'sw', label: '软件开发', count: 10 },
        { id: 'ai', label: '人工智能', count: 6 },
        { id: 'comm', label: '通信设备', count: 4 },
      ]},
      { id: 'medical', label: '医药', count: 22, children: [
        { id: 'pharma', label: '化学制药', count: 7 },
        { id: 'bio', label: '生物医药', count: 5 },
        { id: 'med-dev', label: '医疗器械', count: 6 },
        { id: 'tcm', label: '中药', count: 4 },
      ]},
      { id: 'finance', label: '金融', count: 18, children: [
        { id: 'bank', label: '银行', count: 6 },
        { id: 'secu', label: '证券', count: 5 },
        { id: 'insure', label: '保险', count: 4 },
        { id: 'trust', label: '信托', count: 3 },
      ]},
      { id: 'new-energy', label: '新能源', count: 16, children: [
        { id: 'pv', label: '光伏', count: 5 },
        { id: 'ev', label: '新能源汽车', count: 6 },
        { id: 'wind', label: '风电', count: 3 },
        { id: 'storage', label: '储能', count: 2 },
      ]},
      { id: 'consumer', label: '消费', count: 20, children: [
        { id: 'food', label: '食品饮料', count: 7 },
        { id: 'retail', label: '商贸零售', count: 5 },
        { id: 'media', label: '传媒', count: 4 },
        { id: 'travel', label: '旅游', count: 4 },
      ]},
      { id: 'manufacture', label: '制造', count: 16, children: [
        { id: 'mech', label: '机械设备', count: 6 },
        { id: 'aero', label: '航空航天', count: 4 },
        { id: 'chem', label: '化工', count: 6 },
      ]},
    ],
  },
]

// ========== 交易所选项 ==========
export const exchangeOptions = [
  { label: '上交所', value: 'SH' },
  { label: '深交所', value: 'SZ' },
  { label: '北交所', value: 'BJ' },
]

/** 交易所代码 → 中文名格式化 */
export const exchangeFormatter = (_r: any, _c: any, v: string) => {
  const map: Record<string, string> = { SH: '上交所', SZ: '深交所', BJ: '北交所' }
  return map[v] || v
}

/** 监控状态格式化：1 → 开启, 0 → 关闭 */
export const activeFormatter = (_r: any, _c: any, v: number) => v === 1 ? '开启' : '关闭'

// ========== 弹框表单校验规则 ==========
export const stockFormRules = {
  stockCode: [{ required: true, message: '请输入股票代码' }],
  stockName: [{ required: true, message: '请输入股票名称' }],
  exchange: [{ required: true, message: '请选择交易所' }],
}

/** 重置弹框表单数据到初始值 */
export function resetStockForm(form: any) {
  form.id = undefined
  form.stockCode = ''
  form.stockName = ''
  form.exchange = ''
}

// ========== 假数据：各行业真实 A 股公司名称 ==========
const stockNames: Record<string, string[]> = {
  semi: ['韦尔股份', '中芯国际', '北方华创', '紫光国微', '长电科技', '兆易创新', '卓胜微', '澜起科技'],
  sw: ['金山办公', '用友网络', '恒生电子', '科大讯飞', '广联达', '宝信软件', '中国软件', '中科创达'],
  ai: ['海康威视', '中际旭创', '寒武纪', '大华股份', '云从科技', '商汤科技'],
  comm: ['中兴通讯', '烽火通信', '亨通光电', '光迅科技'],
  pharma: ['恒瑞医药', '复星医药', '华东医药', '科伦药业', '丽珠集团', '华海药业', '人福医药'],
  bio: ['智飞生物', '沃森生物', '康泰生物', '长春高新', '华兰生物'],
  'med-dev': ['迈瑞医疗', '乐普医疗', '鱼跃医疗', '开立医疗', '健帆生物', '心脉医疗'],
  tcm: ['片仔癀', '云南白药', '同仁堂', '东阿阿胶'],
  bank: ['工商银行', '建设银行', '招商银行', '农业银行', '中国银行', '兴业银行'],
  secu: ['中信证券', '华泰证券', '东方财富', '海通证券', '国泰君安'],
  insure: ['中国平安', '中国人寿', '新华保险', '中国太保'],
  trust: ['中航产融', '陕国投A', '爱建集团'],
  pv: ['隆基绿能', '通威股份', '阳光电源', 'TCL中环', '晶澳科技'],
  ev: ['比亚迪', '宁德时代', '赣锋锂业', '华友钴业', '天齐锂业', '亿纬锂能'],
  wind: ['金风科技', '明阳智能', '东方电气'],
  storage: ['阳光电源', '固德威'],
  food: ['贵州茅台', '五粮液', '伊利股份', '海天味业', '泸州老窖', '洋河股份', '山西汾酒'],
  retail: ['中国中免', '永辉超市', '王府井', '小商品城', '豫园股份'],
  media: ['分众传媒', '芒果超媒', '光线传媒', '万达电影'],
  travel: ['中国中免', '锦江酒店', '首旅酒店', '华侨城A'],
  mech: ['汇川技术', '三一重工', '中联重科', '先导智能', '恒立液压', '埃斯顿'],
  aero: ['航发动力', '中航西飞', '中航沈飞', '航天电器'],
  chem: ['万华化学', '华鲁恒升', '宝丰能源', '卫星化学', '合盛硅业', '兴发集团'],
}

/** 交易所循环分配 */
const exchanges: string[] = ['SH', 'SZ', 'SZ', 'SH', 'SZ', 'SH']

/**
 * 生成模拟股票列表数据
 * @param industryId  行业分类 ID（'all' 表示全部）
 * @param pageNum     当前页码
 * @param pageSize    每页条数
 * @param keyword     搜索关键词（匹配股票名称/代码）
 */
export function generateMockStockData(industryId: string, pageNum: number, pageSize: number, keyword: string) {
  const allList: any[] = []
  // 确定需要生成的行业 ID 列表
  const allIds = industryId === 'all' ? Object.keys(stockNames) : [industryId]

  for (const id of allIds) {
    const names = stockNames[id] || []
    names.forEach((name, i) => {
      // 随机生成股价（5~205 元）
      const price = Number((Math.random() * 200 + 5).toFixed(2))
      // 随机生成每股股息（0.1~5.1 元）
      const dividend = Number((Math.random() * 5 + 0.1).toFixed(4))
      // 计算股息率 = 每股股息 / 股价 × 100%
      const yieldVal = Number(((dividend / price) * 100).toFixed(2))
      allList.push({
        id: allList.length + 1,
        stockCode: `${id === 'semi' ? '603' : id === 'sw' ? '688' : '600'}${String(100000 + i * 37).slice(0, 3)}`,
        stockName: name,
        exchange: exchanges[i % exchanges.length],
        currentPrice: price,
        dividendPerShare: dividend,
        calculatedYield: yieldVal,
        triggerRate: Number((Math.random() * 3 + 2).toFixed(2)),
        emailNotify: `invest@${name.substring(0, 4)}.com`,
        phoneNotify: `138${String(10000000 + i * 731).slice(0, 8)}`,
        isActive: Math.random() > 0.3 ? 1 : 0,
        dataTime: '2026-05-29 15:30:00',
        createTime: '2025-01-01 10:00:00',
        updateTime: '2026-05-29 15:30:00',
      })
    })
  }

  // 关键词过滤
  const filtered = keyword ? allList.filter(s => s.stockName.includes(keyword) || s.stockCode.includes(keyword)) : allList
  // 分页截取
  const start = (pageNum - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)
  return { list, total: filtered.length }
}
