/**
 * Objeto controller utilizado em cada arquivo de controller
 * @type {Object}
 */
$.ctrl = {};

/**
 * Rota da página inicial
 * @type {String}
 */
var current_page = "";

/**
 * Hash inicial. Primeiro controller/view a serem carregados
 * @type {String}
 */
var initial_hash = "index";

/**
 * Carrega os arquivos de views na página principal
 * @param  {[type]}   name - Nome da view
 * @param  {Function} done - Função realizada ao carregar a view
 */
$.view = function(name, done) {
  name = name.replace("#", "").replace(".", "/");
  $.ajax({
    url: "cacto/views/" + name + ".html",
    type: "GET",
    dataType: "html",
    success: function(data) {
      $(".app").append(data);
    },
    error: function() {
      $.alert("[$.view] caminho inválido");
    }
  }).done(done);
};

/**
 * Carrega os arquivos de controllers
 * @param  {[type]} name - Nome do controller
 */
$.controller = function(name) {
  var name = name.replace("#", "").replace(".", "/");
  $.ajax({
    url: "cacto/controllers/" + name + ".js",
    type: "GET",
    dataType: "script",
    error: function() {
      console.error("[$.controller][" + name + "] caminho inválido");
      // location.hash = "error";
    }
  });
};

function routes(e) {
  var hash = location.hash.replace('#', '');
  if (!hash.length) {
    redirect(initial_hash);
    return false;
  }
  hash = hash.split('/')[0];
  $(".all-views").hide();
  if (typeof $.ctrl[hash] == 'undefined')
    $.controller(hash);
  else
    $.ctrl[hash].show();
  current_page = hash;
}

function redirect(route) {
  var hash = location.hash.replace('#', '');
  route = route.replace('#', '');
  if (route == hash)
    routes();
  else
    location.hash = route;
}

function controller(id, obj) {
  if (typeof obj == 'function') {
    var c = new obj();
    for (var i in c) {
      if (typeof c[i] == 'function') {
        c[i] = c[i].bind(c);
      }
    }
    $.ctrl[id] = c;
  } else
    $.ctrl[id] = obj;
  if (typeof $.ctrl[id].initialize == 'function')
    $($.ctrl[id].initialize);
}

function initial(hash) {
  initial_hash = hash;
}

function argument(i) {
  var hash = location.hash.replace('#', '').split('/');
  return (typeof hash[i] == 'undefined' ? null : hash[i]);
}

$(function() {
  $(window).on('hashchange', routes);
  routes();
});

var localDB = {

  db: "localDB",

  init: function(name) {
    this.db = name;
    if (!this.has())
      this.clear();
  },

  has: function() {
    return (localStorage.getItem(this.db) != null);
  },

  save: function(data) {
    localStorage.setItem(this.db, JSON.stringify(data));
    return true;
  },

  get: function(info) {
    if (this.has()) {
      var obj = JSON.parse(localStorage.getItem(this.db));
      for (key in obj)
        if (key == info)
          return obj[key];
    } else {
      return false;
    }
  },

  set: function(info, data) {
    var aux = {};
    if (this.has())
      aux = JSON.parse(localStorage.getItem(this.db));
    aux[info] = data;
    localStorage.setItem(this.db, JSON.stringify(aux));
  },

  clear: function() {
    localStorage.removeItem(this.db);
  },

  getObject: function() {
    return JSON.parse(localStorage.getItem(this.db));
  }

};

/**
 * Necessário declarar o objeto para que não ocorram erros
 */
$.support.cors = true;
var serverUrl = "/";

$.each(["put", "delete", "post", "get"], function(i, method) {
  $[method] = function(url, data, callback, fail) {
    var url_complete = serverUrl + url;
    while (url_complete.indexOf("//") >= 0)
      url_complete = url_complete.replace(/\/\//gi, "/");

    return $.ajax({
      url: url_complete,
      type: method,
      dataType: "json",
      crossDomain: true,
      data: data,
      success: callback,
      error: fail
    });
  };
});

$.fn.send = function(success, error) {
  $(this).submit(function(e) {
    e.preventDefault();
    if (!$(this).validation())
      return false;
    // $.dialog.waiting("Aguarde...");
    $.post($(this).attr("action"), $(this).serialize(), success, error).done(function() {
      // if($(".dialog-waiting").length) $.dialog.close();
    });
    return false;
  });
};

$.fn.sendImage = function(success, error) {
  $(this).submit(function() {
    $.dialog.waiting("Enviando...");
    $.ajax({
      type: "POST",
      url: serverUrl + $(this).attr("action"),
      data: new FormData(this),
      enctype: 'multipart/form-data',
      processData: false, // tell jQuery not to process the data
      contentType: false // tell jQuery not to set contentType
    }).success(success).fail(error).done(function() {
      if ($(".dialog-waiting").length) $.dialog.close();
    });
    return false;
  });
  $(this).find('input[type="file"]').change(function() {
    var str = $(this).val(),
      arr = [/.png$/, /.jpg$/, /.jpge$/];
    for (var i = 0; i < arr.length; i++)
      if (str.search(arr[i]) > 0) {
        $(this).closest('form').submit();
        return;
      }
    $.alert("Arquivo inválido!");
  });
};

$.fn.serializeObject = function() {
  var obj = {};
  var arr = this.serializeArray();
  $.each(arr, function() {
    if (obj[this.name]) {
      if (!obj[this.name].push) {
        obj[this.name] = [obj[this.name]];
      }
      obj[this.name].push(this.value || '');
    } else {
      obj[this.name] = this.value || '';
    }
  });
  return obj;
};

$.fn.validation = function() {
  var inputs = $(this).find("input, select");
  $(inputs).removeClass('invalid');
  $(".callback").hide();
  for (var i = 0; i < $(inputs).length; i++) {
    var regex = $(inputs).eq(i).attr('regex');
    if (regex && regex.length && $(inputs).eq(i).is(":enabled")) {
      var val = $(inputs).eq(i).is(":radio") || $(inputs).eq(i).is(":checkbox") ?
        $(this).find("input:" + $(inputs).eq(i).attr("type")).filter("[name='" + $(inputs).eq(i).attr("name") + "']").filter(":checked").val() :
        $(inputs).eq(i).val();
      val = val ? val : "";
      // console.log($(inputs).eq(i).attr("name"), val, regex);
      if (!(new RegExp(regex, "i")).exec(val)) {
        $(inputs).eq(i).closest(".form-group").find(".callback").show();
        $(inputs).eq(i).addClass('invalid').focus();
        return false;
      } else {}
    }
  }
  return true;
};

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}
