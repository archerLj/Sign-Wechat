function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function checkPhone(phone) {
  if (!(/^1[34578]\d{9}$/.test(phone))) {
    return false;
  }
  return true;
}

function showWarningToast(title, cb) {
  wx.showToast({
    title: title,
    image: '../../images/warning.png',
    duration: 2000,
    mask: true,
    success: function (res) {
      typeof cb == "function" && cb()
    }
  })
} 

module.exports = {
  formatTime: formatTime,
  checkPhone: checkPhone,
  showWarningToast: showWarningToast
}
