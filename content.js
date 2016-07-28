//饼图的颜色，目前，需求中只有四个选项，所以只需要四个颜色，对应下面的四个选项
var colors = ['green', 'lightgreen', '#FC5255', '#AA0005'];
var textArray = ['非常清楚', '基本清楚', '有点模糊', '几乎不懂'];
//当前反馈的日期
var date = null;

$(function () {
    // 判断是否是 反馈的网页，如果不是，则不执行当前的美化功能
    $('h1:contains(反馈报告)').each(function (i, e) {
        if (i == 0) {
            //获取当前反馈的日期
            date = /.+(\d{4}-\d+-\d+).+/.exec($(e).text())[1];
            // 处理逻辑
            doFeedBack();
            $('table').css({'font-family': 'Microsoft YaHei', 'fontSize': '14px'});
        }
    });
});

/**
 * 处理 所有的表格的 小数问题
 * 添加 饼状图
 */
function doFeedBack() {
    // 第一部分：处理小数问题
    $('td,th').each(function (index, item) {
        var result = getNormalNum($(item).text());
        if (result != null) {
            $(item).text(result + '%');
        }
    });

    // 第二部分：处理饼状图的问题
    var $table = $('h2:contains(学习目标吸收情况统计)').next('table');

    $table.find('thead>tr>th:nth-child(2)').before('<th>结果图</th>');

    var $trs = $table.find('tbody>tr');
    $trs.each(function (index, item) {
        // 拿到当前的行
        var $tr = $(item);

        // 存放 canvas图的 td标签的id
        var id = 'result' + (new Date()).valueOf();// id 用了时间戳来标志不同的td

        // 处理当前的行的图
        $tr.children('td').after('<td id="' + id + '" style="width:400px; height:300px;"><img id="img' + id + '" style="vertical-align: middle;"/></td>');// 添加饼图的单元格

        var data = []; // 构造饼图的数据

        // 把行中的数据构造成饼图
        $tr.find('th').each(function (i, e) {
            //获取每一项数据的值
            var vl = $(e).text().replace('%', '');
            data.push({
                name: textArray[i],
                value: vl
            });
        });

        //绘制饼状图
        drawPie($tr, id, data);
    });
}

//饼状图的基本参数设置
var option = {
    animation: false,
    animationEasing: "BounceIn",
    color: colors,
    title: {
        text: '主标题',
        textStyle: {
            fontWeight: 'normal',
            fontSize: 16
        },
        subtext: '副标题',
        x: 'center'
    },
    tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    legend: {
        orient: 'vertical',
        left: 'left',
        data: textArray
    },
    series: [
        {
            name: '非常清楚',
            type: 'pie',
            radius: '65%',
            center: ['60%', '60%'],
            data: null,
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                },
                normal: {
                    label: {
                        show: true,
                        position: "outer",
                        formatter: "{b}\n({d}%)"
                    },
                    labelLine: {
                        show: true
                    },
                }
            }
        }
    ]
};

/**
 *
 * 根据当前行的数据绘制饼状图
 *
 * @param {Object} $tr  用Jquery对象表示的 当前行
 * @param {String} id   存放 canvas图的 td标签的id
 * @param {Array} data  饼状图要显示的数据
 */
function drawPie($tr, id, data) {
    //在内存中创建DIV用来作为canvas的载体
    var tempBox = document.createElement('div');
    //设置载体的宽高，相当于设置了canvas画布的宽高
    tempBox.style.width = '400px';
    tempBox.style.height = '300px';

    //初始化画布
    var myChart = echarts.init(tempBox);
    //获取当前行的学习目标，作为canvas的标题
    option.title.text = $($tr.children()[0]).text().replace('：', '');
    //设置canvas的副标题为当前反馈的日期
    option.title.subtext = date;
    //设置画布的data数据
    option.series[0].data = data;
    //为画布设置参数信息
    myChart.setOption(option);
    //将画布导出为图片，加载到对应的img标签中显示
    $('#img' + id).attr('src', myChart.getRenderedCanvas().toDataURL("image/png"));
}

/**
 *
 * 正则判断小数位数过多，截取之
 *
 * @param {String} str  要处理的字符串
 * @returns 如果匹配返回处理好的字符串，否则，返回null
 */
function getNormalNum(str) {
    var numReg = /\d+\.\d{2}/g;
    var temp = numReg.exec(str);
    if (temp !== null) {
        return temp[0];
    }

    return null;
}