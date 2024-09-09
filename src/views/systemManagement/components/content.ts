export const ringEchartsOptions = {
    color: [
        "#3880ED",
        "#48f856",
        "#f5f4f2",
        "#69b2e7",
        "#0befdc",
        "#f3d353",
        "#f18d29",
        ],
    legend: {
        orient: "horizontal", //水平排列
        x: "center", //水平方向居中
        y: "bottom", //垂直方向处于尾部
        data: [], //图标数组
        icon: "circle", //图标形状
        bottom: "5%",
        itemGap: 80,
    },
    series: [
        //主要环展示
        {
            type: "pie",
            radius: ["50%", "70%"],
            avoidLabelOverlap: true,
            label: {
                show: false,
                position: "outside",
                alignTo: "labelLine",
                bleedMargin: 20,
                formatter: "{b}: {c}  {d}%",
                color: "#5C6268",
            },
            labelLine: {
                normal: {
                    show: false,
                },
                emphasis: {
                    show: false,
                },
            },
            emphasis: {
                // label: {
                //     show: true,
                //     fontSize: "15",
                //     fontWeight: "bold",
                // },
                labelLine: {
                    show: true,
                },
            },
            data: [
                { value: 6, name: "准备检查" },
                { value: 5, name: "开工检查" },
                { value: 5, name: "履责检查" },
                { value: 5, name: "完工检查" },
                { value: 5, name: "违章检查" },
                { value: 5, name: "无违章现场" },
                { value: 6, name: "综合评价" },
            ],
            itemStyle: {
                //边框留白
                borderColor: "#ffffff",
                borderWidth: 5,
            },
        },
        //边框环设置
        {
            radius: ["40%", "42%"],
            center: ["50%", "50%"],
            type: "pie",
            label: {
                normal: {
                    show: false,
                },
                emphasis: {
                    show: false,
                },
            },
            labelLine: {
                normal: {
                    show: false,
                },
                emphasis: {
                    show: false,
                },
            },
            animation: false,
            tooltip: {
                show: false,
            },
            data: [
                {
                    value: 1,
                    itemStyle: {
                        color: "#e9eeef",
                    },
                },
            ],
        },
        {
            radius: ["73%", "75%"],
            center: ["50%", "50%"],
            type: "pie",
            label: {
                normal: {
                    show: false,
                },
                emphasis: {
                    show: false,
                },
            },
            labelLine: {
                normal: {
                    show: false,
                },
                emphasis: {
                    show: false,
                },
            },
            animation: false,
            tooltip: {
                show: false,
            },
            data: [
                {
                    value: 1,
                    itemStyle: {
                        color: "#e7e8e8",
                    },
                },
            ],
        },
    ],
    grid: {
        left: "10%",
        right: "10%",
        top: "10%",
        bottom: "10%",
        containLabel: true,
    },
}

export const labelList = [
    {label:"准备检查",color:"#3880ED",number:"46",rate:"48%"},
    {label:"开工检查",color:"#48f856",number:"22",rate:"22%"},
    {label:"履责检查",color:"#f5f4f2",number:"5",rate:"19%"},
    {label:"完工检查",color:"#69b2e7",number:"5",rate:"19%"},
    {label:"违章检查",color:"#0befdc",number:"5",rate:"19%"},
    {label:"无违章现场",color:"#f3d353",number:"5",rate:"19%"},
    {label:"综合评价",color:"#f18d29",number:"6",rate:"23%"}
]