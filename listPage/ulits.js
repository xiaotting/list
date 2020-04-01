/** 格式化数据 */
export const formatData = function (fileterData = [], formData = {}) {
  const params = {}
  fileterData.forEach((element) => {
    if (element.format && formData[element.model]) {
      params[element.model] = element.format(formData)
    } else if (element.modelFormat) {
      element.modelFormat.forEach((e, index) => {
        params[e] = formData[element.model] ? formData[element.model][index] : ''
      })
    } else if (Object.prototype.toString.call(element.model) == '[object Array]') {
      element.model.forEach((item) => {
        params[item] = formData[item] || ''
      })
    } else {
      params[element.model] = formData[element.model] || ''
    }
  })
  return Object.assign({}, params, formData)
}
