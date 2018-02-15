var app = {
  timerInterval: null,
  clockInterval: null,
  audio: document.getElementById( 'audio' ),
  start: document.getElementById( 'startBtn' ),
  clock: document.getElementById( 'clock' ),
  timer: document.getElementById( 'timer' ),
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
  },
  onDeviceReady: function () {
    console.log( 'deviceready: ' + app.timeDate() );
    app.start.addEventListener( 'click', app.tempoStart );
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
  timeDate: function () {
    let x = new Date(),
      d = x.toLocaleDateString(),
      t = x.toLocaleTimeString();
    return d + " " + t;
  },
  tempoStart: function () {
    app.play();
    app.timerFunc.start();
    app.start.removeEventListener( 'click', app.tempoStart );
    app.start.addEventListener( 'click', app.tempoStop );
  },
  tempoStop: function () {
    app.stop();
    app.start.innerHTML = "START";
    app.timer.innerHTML = "00:00:00";
    app.start.removeEventListener( 'click', app.tempoStop );
    app.start.addEventListener( 'click', app.tempoStart );
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
    }, 500 );
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
        app.start.innerHTML = "STOP<br/><small class='small'><i>Started at: " + date.value + "</i></small>";
      }, function () {
        app.start.innerHTML = "STOP<br/><small class='small'><i>Started at: Error</i></small>";
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
