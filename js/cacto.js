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
    url: "app/views/" + name + ".html",
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
    url: "app/controllers/" + name + ".js",
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
