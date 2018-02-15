var app = {
  timerInterval: null,
  clockInterval: null,
  audio: document.getElementById( 'audio' ),
  start: document.getElementById( 'startBtn' ),
  clock: document.getElementById( 'clock' ),
  timer: document.getElementById( 'timer' ),
  startedAt: document.getElementById( 'startedAt' ),
  info: $( '.info' ),
  // Application Constructor
  initialize: function () {
    this.bindEvents();
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function () {
    document.addEventListener( 'load', this.load, false );
    document.addEventListener( 'deviceready', this.onDeviceReady, false );
    document.addEventListener( 'online', this.online, false );
    document.addEventListener( 'offline', this.offline, false );
    $( 'html' ).on( 'click', '#local', function () {
      app.local();
    } );
  },
  onDeviceReady: function () {
    console.log( 'deviceready: ' + app.timeDate() );
    let main = $( 'main' ).height();
    $( '#tempo' ).height( main - 240 );
    app.start.addEventListener( 'click', app.tempoStart );
    app.info.on( 'click', app.infoClick );
    app.clockStart();
  },
  load: function () {
    console.log( 'load: ' + app.timeDate() );
  },
  online: function () {
    console.log( 'online: ' + app.timeDate() );
  },
  offline: function () {
    console.log( 'offline: ' + app.timeDate() );
  },
  infoClick: function () {
    $( '#app, #about' ).toggle();
  },
  local: function ( reachability ) {
    let networkState = navigator.connection.type;

    let states = {};
    states[ Connection.UNKNOWN ] = 'Unknown connection';
    states[ Connection.ETHERNET ] = 'Ethernet connection';
    states[ Connection.WIFI ] = 'WiFi connection';
    states[ Connection.CELL_2G ] = 'Cell 2G connection';
    states[ Connection.CELL_3G ] = 'Cell 3G connection';
    states[ Connection.CELL_4G ] = 'Cell 4G connection';
    states[ Connection.CELL ] = 'Cell generic connection';
    states[ Connection.NONE ] = 'No network connection';

    app.notify( 'Connection type: ' + states[ networkState ] );
    console.log( 'Connection type: ' + states[ networkState ] );
  },
  notify: function ( x ) {
    alert( 'test' );
    cordova.plugins.notification.local.registerPermission( function ( granted ) {
      console.log( 'Permission has been granted: ' + granted );
    } );
    cordova.plugins.notification.local.schedule( { title: 'My first notification', text: x, foreground: true } );
  },
  timeDate: function () {
    let x = new Date(),
      d = x.toLocaleDateString(),
      t = x.toLocaleTimeString();
    return d + " " + t;
  },
  tempoStart: function () {
    app.play();
    app.timerFunc.start();
    $( '#timer' ).addClass( 'deep-orange-text text-lighten-1' );
    app.start.removeEventListener( 'click', app.tempoStart );
    app.start.addEventListener( 'click', app.tempoStop );
    $( '#start' ).removeClass( 'green' ).addClass( 'red' );
  },
  tempoStop: function () {
    app.stop();
    app.start.innerHTML = "START";
    app.timer.innerHTML = "00:00:00";
    $( '#timer' ).removeClass( 'deep-orange-text text-lighten-1' );
    app.startedAt.innerHTML = "---";
    app.start.removeEventListener( 'click', app.tempoStop );
    app.start.addEventListener( 'click', app.tempoStart );
    $( '#start' ).removeClass( 'red' ).addClass( 'green' );
    clearInterval( app.timerInterval );
  },
  clockStart: function () {
    app.clockInterval = setInterval( function () {
      navigator.globalization.dateToString( new Date(), function ( date ) {
        app.clock.innerHTML = date.value;
      }, function () {
        app.clock.innerHTML = 'Error';
      }, {
        formatLength: 'short',
        selector: 'time'
      } );
    }, 1000 );
  },
  play: function () {
    if ( typeof audio.loop == 'boolean' ) {
      audio.loop = true;
    } else {
      audio.addEventListener( 'ended', function () {
        this.currentTime = 0;
        this.play();
      }, false );
    }
    audio.play();
  },
  stop: function () {
    if ( typeof audio.loop == 'boolean' ) {
      audio.loop = false;
    }
    this.currentTime = 0;
    audio.pause();
  },
  timerFunc: {
    start: function () {
      let timerSec = 0,
        timerMin = 0,
        timerHou = 0;
      app.timerInterval = setInterval( function () {
        timerSec++;
        if ( timerSec === 60 ) {
          timerSec = 0;
          timerMin++;
        }
        if ( timerMin === 60 ) {
          timerMin = 0;
          timerHou++;
        }
        let text = app.timerFunc.normalize( timerHou ) + timerHou + ":" + app.timerFunc.normalize( timerMin ) + timerMin + ":" + app.timerFunc.normalize( timerSec ) + timerSec;
        app.timer.innerHTML = text;
      }, 1000 );
      navigator.globalization.dateToString( new Date(), function ( date ) {
        app.start.innerHTML = "STOP";
        app.startedAt.innerHTML = "Started at: " + date.value;
      }, function () {
        app.start.innerHTML = "STOP";
        app.startedAt.innerHTML = "Started at: ERROR";
      }, {
        formatLength: 'full',
        selector: 'time'
      } );
    },
    normalize: function ( x ) {
      return ( x < 10 )
        ? "0"
        : "";
    }
  }
};
