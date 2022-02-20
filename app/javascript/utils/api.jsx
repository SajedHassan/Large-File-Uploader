window.$ = window.jQuery = require('jquery')

$.ajaxSetup({
  statusCode: {
    401: () => location.href = "/login",
    302: () => location.href = "/login"
  }
});

class Api {
  get(url, data) {
    if (data == null) data = {};
    return $.get(url, data);
  }

  post(url, data) {
    return $.post(url, data);
  }

  put(url, data) {
    return $.ajax({
      url: url,
      data: data,
      type: 'PUT'
    });
  }

  delete(url, data) {
    if (data == null) data = {};
    if(!data['_method']) data['_method'] = 'DELETE';
    return $.post(url, data);
  }

  patch(url, data) {
    if (data == null) data = {};
    if(!data['_method']) data['_method'] = 'PATCH';
    return $.post(url, data);
  }
}

module.exports = new Api
