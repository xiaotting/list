// 阿拉伯数字转换为简写汉字
function Arabia_To_SimplifiedChinese(money, unit) {
  const cnNums = new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖') // 汉字的数字
  const cnIntRadice = new Array('', '拾', '佰', '仟') // 基本单位
  const cnIntUnits = new Array('', '万', '亿', '兆') // 对应整数部分扩展单位
  const cnDecUnits = new Array('角', '分', '毫', '厘') // 对应小数部分单位
  // var cnInteger = "整"; //整数金额时后面跟的字符
  let cnIntLast = '' // 整型完以后的单位
  if (unit == 'CNY') {
    cnIntLast = '元' // 整型完以后的单位
  } else {
    cnIntLast = formatCurrencyCode(unit)
  }
  const maxNum = 999999999999999.9999 // 最大处理的数字
  let IntegerNum // 金额整数部分
  let DecimalNum // 金额小数部分
  let ChineseStr = '' // 输出的中文金额字符串
  let parts // 分离金额后用的数组，预定义
  if (money == '') {
    return ''
  }
  money = parseFloat(money)
  if (money >= maxNum) {
    $.alert('超出最大处理数字')
    return ''
  }
  if (money == 0) {
    // ChineseStr = cnNums[0]+cnIntLast+cnInteger;
    ChineseStr = cnNums[0] + cnIntLast
    // document.getElementById("show").value=ChineseStr;
    return ChineseStr
  }
  money = money.toString() // 转换为字符串
  if (money.indexOf('.') == -1) {
    IntegerNum = money
    DecimalNum = ''
  } else {
    parts = money.split('.')
    IntegerNum = parts[0]
    DecimalNum = parts[1].substr(0, 4)
  }
  if (parseInt(IntegerNum, 10) > 0) { // 获取整型部分转换
    let zeroCount = 0
    const IntLen = IntegerNum.length
    for (let i = 0; i < IntLen; i++) {
      const n = IntegerNum.substr(i, 1)
      const p = IntLen - i - 1
      const q = p / 4
      const m = p % 4
      if (n == '0') {
        zeroCount++
      } else {
        if (zeroCount > 0) {
          ChineseStr += cnNums[0]
        }
        zeroCount = 0 // 归零
        ChineseStr += cnNums[parseInt(n)] + cnIntRadice[m]
      }
      if (m == 0 && zeroCount < 4) {
        ChineseStr += cnIntUnits[q]
      }
    }
    ChineseStr += cnIntLast
    // 整型部分处理完毕
  }
  if (DecimalNum != '' && unit == 'CNY') { // 小数部分
    const decLen = DecimalNum.length
    for (let i = 0; i < decLen; i++) {
      const n = DecimalNum.substr(i, 1)
      if (n != '0') {
        ChineseStr += cnNums[Number(n)] + cnDecUnits[i]
      }
    }
  } else if (DecimalNum != '' && unit != 'CNY') {
    ChineseStr += '点'
    for (let i = 0; i < DecimalNum.length; i++) {
      const n = DecimalNum.substr(i, 1)
      if (n != '0') {
        ChineseStr += cnNums[Number(n)]
      }
    }
    ChineseStr += cnIntLast
  }
  if (ChineseStr == '') {
    // ChineseStr += cnNums[0]+cnIntLast+cnInteger;
    ChineseStr += cnNums[0] + cnIntLast
  }
  /* else if( DecimalNum == '' ){
    		        ChineseStr += cnInteger;
    		        ChineseStr += cnInteger;
    		    } */
  return ChineseStr
}
// 时间格式化
function formatDate(date, fmt) {
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, String(date.getFullYear()).substr(4 - RegExp.$1.length))
  }
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      const str = String(o[k])
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padLeftZero(str))
    }
  }
  return fmt
}

function padLeftZero(str) {
  return (`00${str}`).substr(str.length)
}

function formatCurrencyCode(value) {
  if (value == undefined) {
    return ''
  }
  switch (value) {
    case 'CNY':
      return '人民币'
    case 'USD':
      return '美元'
    case 'EUR':
      return '欧元'
    case 'GBP':
      return '英镑'
    case 'KRW':
      return '韩元(韩圆)'
    case 'JPY':
      return '日元(日圆)'
    case 'AUD':
      return '澳元'
    case 'HKD':
      return '港元(港币)'
    case 'MOP':
      return '澳门元(澳门币)'
    case 'TWD':
      return '新台币'
    case 'CAD':
      return '加拿大元'
    case 'CHF':
      return '瑞士法郎'
    case 'SGD':
      return '新加坡元'
    case 'THB':
      return '泰铢'
    case 'NZD':
      return '新西兰元'
  }
}

function formatterInvoiceType(value) {
    if (value == 0) {
        return "专用发票"
    } if (row.borderType == 1) {
        return "普通发票"
    } if (row.borderType == 2) {
        return "废旧物质发票"
    }
}
const calc = {
  /*
    函数，加法函数，用来得到精确的加法结果
    说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
    参数：arg1：第一个加数；arg2第二个加数；d要保留的小数位数（可以不传此参数，如果不传则不处理小数位数）
    调用：Calc.Add(arg1,arg2,d)
    返回值：两数相加的结果
    */
  Add: function (arg1, arg2) {
    arg1 = String(arg1), arg2 = String(arg2)
    let arg1Arr = arg1.split('.'),
      arg2Arr = arg2.split('.'),
      d1 = arg1Arr.length == 2 ? arg1Arr[1] : '',
      d2 = arg2Arr.length == 2 ? arg2Arr[1] : ''
    const maxLen = Math.max(d1.length, d2.length)
    const m = Math.pow(10, maxLen)
    const result = Number(((arg1 * m + arg2 * m) / m).toFixed(maxLen))
    const d = arguments[2]
    return typeof d === 'number' ? Number(result.toFixed(d)) : result
  },
  /*
    函数：减法函数，用来得到精确的减法结果
    说明：函数返回较为精确的减法结果。
    参数：arg1：第一个加数；arg2第二个加数；d要保留的小数位数（可以不传此参数，如果不传则不处理小数位数
    调用：Calc.Sub(arg1,arg2)
    返回值：两数相减的结果
    */
  Sub: function (arg1, arg2) {
    return Calc.Add(arg1, -Number(arg2), arguments[2])
  },
  /*
    函数：乘法函数，用来得到精确的乘法结果
    说明：函数返回较为精确的乘法结果。
    参数：arg1：第一个乘数；arg2第二个乘数；d要保留的小数位数（可以不传此参数，如果不传则不处理小数位数)
    调用：Calc.Mul(arg1,arg2)
    返回值：两数相乘的结果
    */
  Mul: function (arg1, arg2) {
    let r1 = String(arg1),
      r2 = String(arg2),
      m, 
      resultVal, 
      d = arguments[2]
    m = (r1.split('.')[1] ? r1.split('.')[1].length : 0) + (r2.split('.')[1] ? r2.split('.')[1].length : 0)
    resultVal = Number(r1.replace('.', '')) * Number(r2.replace('.', '')) / Math.pow(10, m)
    return typeof d !== 'number' ? Number(resultVal) : Number(resultVal.toFixed(parseInt(d)))
  },
  /*
    函数：除法函数，用来得到精确的除法结果
    说明：函数返回较为精确的除法结果。
    参数：arg1：除数；arg2被除数；d要保留的小数位数（可以不传此参数，如果不传则不处理小数位数)
    调用：Calc.Div(arg1,arg2)
    返回值：arg1除于arg2的结果
    */
  Div: function (arg1, arg2) {
    let r1 = String(arg1),
      r2 = String(arg2),
      m, 
      resultVal, 
      d = arguments[2]
    m = (r2.split('.')[1] ? r2.split('.')[1].length : 0) - (r1.split('.')[1] ? r1.split('.')[1].length : 0)
    resultVal = Number(r1.replace('.', '')) / Number(r2.replace('.', '')) * Math.pow(10, m)
    return typeof d !== 'number' ? Number(resultVal) : Number(resultVal.toFixed(parseInt(d)))
  }
}

// 获取对象数据类型
function getDataTyep(o) {
  return Object.prototype.toString.call(o).slice(8, -1)
}

// 去除前后空格
function trim(x) {
  return String.prototype.replace.call(x, /^\s+|\s+$/gm, '')
}
// 去除查询条件的前后空格
function trimQuery(obj) {
  if (getDataTyep(obj) == 'Object') {
    for (const key in obj) {
      if (getDataTyep(obj[key]) == 'String') {
        obj[key] = trim(obj[key])
      }
    }
  }
  return obj
}
export {
  Arabia_To_SimplifiedChinese,
  formatDate,
  calc,
  trim,
  trimQuery
}
