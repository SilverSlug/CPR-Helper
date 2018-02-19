var app = {
  timerInterval: null,
  clockInterval: null,
  audio: document.getElementById( 'audio' ),
  start: $( '#start' ),
  startBtn: $( '#startBtn' ),
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
  },
  onDeviceReady: function () {
    console.log( 'deviceready: ' + app.timeDate() );
    let main = $( 'main' ).height();
    $( '#tempo' ).height( main - 240 );
    app.start.on( 'click', app.tempoStart );
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
    $( '#local, #ajax, #print' ).off( 'click' );
    $( '#local' ).on( 'click', app.local );
    $( '#ajax' ).on( 'click', app.ajax );
    $( '#print' ).on( 'click', app.print );
  },
  print: function () {
    console.log( 'Fingerprint start' )
    FingerprintAuth.isAvailable( function ( result ) {

      console.log( "FingerprintAuth available: " + JSON.stringify( result ) );

      // If has fingerprint device and has fingerprints registered
      if ( result.isAvailable == true && result.hasEnrolledFingerprints == true ) {

        // Check the docs to know more about the encryptConfig object :)
        var encryptConfig = {
          clientId: "myAppName",
          username: "currentUser",
          password: "currentUserPassword",
          maxAttempts: 5,
          locale: "en_US",
          dialogTitle: "Hey dude, your finger",
          dialogMessage: "Put your finger on the device",
          dialogHint: "No one will steal your identity, promised"
        }; // See config object for required parameters

        // Set config and success callback
        FingerprintAuth.encrypt( encryptConfig, function ( _fingerResult ) {
          console.log( "successCallback(): " + JSON.stringify( _fingerResult ) );
          if ( _fingerResult.withFingerprint ) {
            console.log( "Successfully encrypted credentials." );
            console.log( "Encrypted credentials: " + result.token );
          } else if ( _fingerResult.withBackup ) {
            console.log( "Authenticated with backup password" );
          }
          // Error callback
        }, function ( err ) {
          if ( err === "Cancelled" ) {
            console.log( "FingerprintAuth Dialog Cancelled!" );
          } else {
            console.log( "FingerprintAuth Error: " + err );
          }
        } );
      }
    }, function ( message ) {
      console.log( "isAvailableError(): " + message );
    } );
  },
  ajax: function () {
    console.log( 'start AJAX' );
    let data = {};
    navigator.geolocation.getCurrentPosition( function ( position ) {
      data = {
        'Latitude': position.coords.latitude,
        'Longitude': position.coords.longitude,
        'Altitude': position.coords.altitude,
        'Accuracy': position.coords.accuracy,
        'Altitude Accuracy': position.coords.altitudeAccuracy,
        'Heading': position.coords.heading,
        'Speed': position.coords.speed,
        'Timestamp': position.timestamp
      };
      $.ajax( { url: 'https://www.610ind.com/test/ajax.php', method: 'POST', dataType: 'json', data: data } ).done( function ( res ) {
        alert( "lat: " + res.Latitude + " | lon: " + res.Longitude );
      } ).fail( function ( res ) {
        console.log( res );
      } );
    }, function ( error ) {
      console.log( "code" );
      alert( 'code: ' + error.code + '\n' + 'message: ' + error.message );
    } );
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

    alert( 'Connection type: ' + states[ networkState ] );
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
    app.start.off( 'click' );
    app.start.on( 'click', app.tempoStop );
    $( '#start' ).removeClass( 'green' ).addClass( 'red' );
  },
  tempoStop: function () {
    app.stop();
    app.startBtn.text( "START" );
    app.timer.innerHTML = "00:00:00";
    $( '#timer' ).removeClass( 'deep-orange-text text-lighten-1' );
    app.startedAt.innerHTML = "---";
    app.start.off( 'click' );
    app.start.on( 'click', app.tempoStart );
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
        app.startBtn.text( "STOP" );
        app.startedAt.innerHTML = "Started at: " + date.value;
      }, function () {
        app.startBtn.text( "STOP" );
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
