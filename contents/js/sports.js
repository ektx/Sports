$(function() {

	function drawLine(xData, seriesData) {

		let myChart = echarts.init(document.getElementById('push-ups-canvas'));

		let _seriesData = [];

		seriesData.forEach(function(val) {
			_seriesData.push( stringToTime(val) )
		})

		let option = {
			color: ['#3398DB'],
			tooltip : {
				trigger: 'axis',
				formatter: function(node) {
					return `<p>时间: ${node[0].name}</p><p>用时: ${TimeToString(node[0].value)}</p>`
				},
				axisPointer: {
					type: 'line',
					axis: 'x',
					label: {
						show: true,
						backgroundColor: '#6a7985'
					}
				}
			},
			xAxis : [
				{
					type : 'category',
					data : xData
				}
			],
			yAxis : [
				{
					type : 'value',
					axisLabel: {
						formatter: function(value) {
							return TimeToString(value)
						}
					}
				}
			],
			series : [
				{
					name:'直接访问',
					type:'line',
					showSymbol: false,
					// smooth: true,
					lineStyle: {
						normal: {
							width: 3,
							shadowColor: 'rgba(0,0,0,.4)',
							shadowBlur: 10,
							shadowOffsetY: 15
						}
					},
					data: _seriesData
				}
			]
		};

		myChart.setOption(option);
	}


	function stringToTime(str) {
		let timeArr = str.split(':');
		let minute = parseFloat(timeArr[0]);
		let second = parseFloat(timeArr[1].split('.')[0]);
		let millisecond = parseFloat(timeArr[1].split('.')[1]);

		return minute * 60 * 1000 + second * 1000 + millisecond;
	}

	function TimeToString(time) {
		let minute = Math.floor(time/60000);
		let useMinute = minute * 60000;
		let second = Math.floor((time - useMinute)/1000);
		let useSecond = useMinute + second * 1000;
		let millisecond = Math.floor(time - useSecond);

		if (second < 10) second = '0'+second;

		return minute+':'+ second + '.' + millisecond
	}

	function addDate(date, time, reload) {
		webSQLInsert('sportTimeNo', 'date, time', [date, time], ()=> {
			if (reload)
				location.reload()
		})
	}

	// 添加本地数据库
	webSQLOpenDB('sports', '1.0', '', 20);

	if (!localStorage.websql) {
		
		let timeArr = ['9:45.60', '12:08.62', '9:12.27', '2:50.52'];
		let xData = ['6/1', '6/2', '6/3', '6/4', '6/5', '6/6', '6/7'];

		// 创建记录表格
		webSQLCreateTable('sportTimeNo', 'date, time');

		for (let i = 0, l = timeArr.length; i < l; i++) {
			addDate(xData[i], timeArr[i], false)
		}

		localStorage.websql = true
	}

	webSQLCommon(
		`SELECT * FROM sportTimeNo`,
		[],
		(data)=> {
			let x = [];
			let seriesData = [];

			for (let i = 0, l = data.rows.length; i < l; i++) {
				x.push(data.rows[i].date);
				seriesData.push(data.rows[i].time)
			}

			drawLine(x, seriesData)
		},
		(err) => {
			console.log(err)
		}
	)

	$('#add-new-info').click(function() {

		let d = new Date();
		let date = d.getMonth()+1 + '/' + d.getDate();

		Layers.open({
			width: 400,
			height: 200,
			title: '添加新记录',
			zIndex: 1,
			content: {
				type: 'str',
				inner: `
				<div class="add-new-info-box">
					<p>
						<input class="time" type="text" placeholder="请输入时间: 0:00.00" />
					</p>
					<p>
						<input class="date" type="text" placeholder="请输入日期: 6/8" value="${date}"/>
					</p>
					<div class="save-btns">
						<button>保存</button>
					</div>
				</div>
				`
			},
			callback: function() {
				
			}
		})

	});

	$('body').on('click', '.save-btns button', function(e) {
		let _ = $(this);
		let _box = _.parents('.add-new-info-box');
		let _time = _box.find('.time');
		let _timeval = _time.val();
		let _date = _box.find('.date');
		let _dateVal = _date.val();

		if (_timeval && _dateVal) {

			addDate(_dateVal, _timeval, true)
		} else {
			_time.focus();
		}

	})
})
