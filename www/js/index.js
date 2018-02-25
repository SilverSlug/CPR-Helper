let hammertime = null;
let app = {
  timerInterval: null,
  clockInterval: null,

  initialize: function () {
    $(document)
      .on( 'load', this.load )
      .on( 'deviceready', this.onDeviceReady )
      .on( 'online', this.online )
      .on( 'offline', this.offline );
  },

  onDeviceReady: function () {
    app.clockStart();
    app.nav('HomeScreen');
    console.log( 'deviceready: ' + app.now() );
    $( '#tempo' ).height( $( 'main' ).height() - 240 );
    $( '#start' ).on( 'click', app.tempo.start );
    $('.sidebar-toggle').on('click', function(){
      app.sidebar('open');
    });
    $('.menuItem').on('click',function(){
      app.nav($(this).attr('target'));
      app.sidebar('close');
    });
    $('#menuImg').on('click',function(){
      app.sidebar('close');
    });
    $('.Screen').hammer().on("swiperight", function() {
      app.sidebar('open');
    });
    $('#overlay, #sidebar').hammer().on("swipeleft", function() {
      app.sidebar('close');
    });

    app.initAd();
  },

  sidebar: function (x) {
    let s = $('.sidebar'),
      o = true;
    if(s.offset().left == "-250" && x === 'open'){
      s.css('left','0px');
    }else if(s.offset().left == "0" && x === 'close'){
      s.css('left','-250px');
    }else{
      o = false;
    }
    if (o){
      $('.overlay')
        .toggle()
        .off('click')
        .on('click', function(){
          app.sidebar('close');
        });
    }
  },

  nav: function(x){
    $('.Screen').each(function(i,e){
      if($(e).hasClass('active')){
        let w = $(e).width()+250;
        $(e).removeClass('active');
        $(e).hide("fast",function(){
          $('#' + x).show("fast");
        });
      }
    });

    $('#' + x).addClass('active');

    switch(x){
      case "HomeScreen":
        break;
      case "LogScreen":
        $('#logList').html(app.log.ret());
        $( '#logListCard' ).css( 'height', 'calc(100vh - 130px)');
        $( '#logList' ).height( $( '#logListCard' ).height() - 50 );
        break;
      case "SettingsScreen":
        $('input#'+app.settings.ret()).attr("checked","checked");
        $('#soundRadio input').off('change').on('change', function(){
          app.settings.change($(this).attr("id"));
        });
        break;
      case "AboutScreen":
        $('#ajax').off('click').on('click', function(){
          app.ajax();
        });
        break;
    }
  },

  ajax: function () {
    console.log( 'start AJAX' );
    $.ajax( {
      url: 'https://610ind.com/test/ajax.php',
      method: 'POST',
      dataType: 'json',
      data: {
        data: "Hello YOU"
      }
    }).done( function ( res ) {
      alert( res.data );
      console.log( 'success AJAX' );
    }).fail( function ( res ) {
      console.log( res );
      console.log( 'fail AJAX' );
    });
  },

  settings: {
    ret: function(){
      return (localStorage.getItem("sound") === null) ? "cowbell":localStorage.getItem("sound");
    },

    change: function(x){
      localStorage.setItem("sound",x);
      alert("Metronome sound saved successfully!");
    }
  },

  now: function () {
    let x = new Date(),
      d = x.toLocaleDateString(),
      t = x.toLocaleTimeString();
    return d + " " + t;
  },

  tempo: {
    start: function () {
      app.play();
      app.timerFunc.start();
      $( '#start' )
        .off( 'click' )
        .on( 'click', app.tempo.stop )
        .css( 'background-color', 'red' );
    },

    stop: function () {
      app.timerFunc.stop();
      $( '#startBtn' ).text( "START" );
      $( '#timer' ).text("00:00");
      $( '#startedAt' ).text("---");
      $( '#start' )
        .off( 'click' )
        .on( 'click', app.tempo.start )
        .css( 'background-color', 'rgba(0,0,255,0.7)' );
      clearInterval( app.timerInterval );
    }
  },

  clockStart: function () {
    let c = $( '#clock' );
    app.clockInterval = setInterval( function () {
      navigator.globalization.dateToString( new Date(), function ( date ) {
        c.text(date.value);
      }, function () {
        c.text('Error');
      }, {
        formatLength: 'full',
        selector: 'time'
      } );
    }, 1000 );
  },

  play: function () {
    let a = $('audio#sound_'+app.settings.ret())[0];
    if ( typeof a.loop == 'boolean' ) {
      a.loop = true;
    } else {
      a.addEventListener( 'ended', function () {
        this.currentTime = 0;
        this.play();
      }, false );
    }
    a.play();
  },

  log:{
    change: function(x) {
      let log = (localStorage.getItem("log") === null) ? "[]":localStorage.getItem("log");
      let json = JSON.parse(log);
      try {
        json.unshift(x);
        if(json.length > 30){
          json = json.slice(0,29);
        }
        localStorage.setItem("log",JSON.stringify(json));
      }catch(e){
        console.log("Logging Error");
      }
    },

    ret: function(){
      let log = (localStorage.getItem("log") === null) ? "[]":localStorage.getItem("log");
      let json = JSON.parse(log);
      let html = "";
      for (var k in json){
        if (json.hasOwnProperty(k)) {
          for (var l in json[k]){
            if (json[k].hasOwnProperty(l)) {
              let type = (l === "Start") ? '#efe06e':'red';
              html += "<hr/><li style='color:"+type+";'>" + l + ": " + json[k][l] + "</li>";
            }
          }
        }
      }
      return html += "<hr/>";
    }
  },

  timerFunc: {
    sec: 0,
    min: 0,

    stop: function () {
      let a = $('audio#sound_'+app.settings.ret())[0];
      if ( typeof a.loop == 'boolean' ) {
        a.loop = false;
      }
      a.currentTime = 0;
      app.timerFunc.sec = 0;
      app.timerFunc.min = 0;
      a.pause();

      navigator.globalization.dateToString( new Date(), function ( date ) {
        app.log.change({Stop:date.value});
      }, function () {
        app.log.change({Stop:'Error Saving Time'});
      }, {
        formatLength: 'medium',
        selector: 'date and time'
      } );
    },

    timer: function () {
      app.timerFunc.sec++;
      if ( app.timerFunc.sec === 60 ) {
        app.timerFunc.sec = 0;
        app.timerFunc.min++;
      }
      if ( app.timerFunc.min === 60 ) {
        app.timerFunc.min = 0;
      }
      $( '#timer' ).text(app.timerFunc.normalize( app.timerFunc.min ) + ":" + app.timerFunc.normalize( app.timerFunc.sec ));
    },

    start: function () {
      app.timerFunc.timer();
      app.timerInterval = setInterval( function(){
        app.timerFunc.timer();
      }, 1000 );
      $( '#startBtn' ).text( "STOP" );

      navigator.globalization.dateToString( new Date(), function ( date ) {
        $( '#startedAt' ).text("Started at: " + date.value);
      }, function () {
        $( '#startedAt' ).text("Started at: ERROR");
      }, {
        formatLength: 'full',
        selector: 'time'
      } );

      navigator.globalization.dateToString( new Date(), function ( date ) {
        app.log.change({Start:date.value});
      }, function () {
        app.log.change({Start:'Error Saving Time'});
      }, {
        formatLength: 'medium',
        selector: 'date and time'
      } );
    },

    normalize: function ( x ) {
      return ( x < 10 )
        ? "0" + x
        : "" + x;
    }
  },

  initAd: function(){
    if ( window.plugins && window.plugins.AdMob ) {
      var ad_units = {
        ios : {
            banner: 'ca-app-pub-1667173736779668~4312087590',		//PUT ADMOB ADCODE HERE
            interstitial: 'ca-app-pub-1667173736779668/4205998582'	//PUT ADMOB ADCODE HERE
        },
        android : {
            banner: 'ca-app-pub-1667173736779668~1747356209',		//PUT ADMOB ADCODE HERE
            interstitial: 'ca-app-pub-1667173736779668/1176510567'	//PUT ADMOB ADCODE HERE
        }
      };
      var admobid = ( /(android)/i.test(navigator.userAgent) ) ? ad_units.android : ad_units.ios;
      window.plugins.AdMob.setOptions( {
          publisherId: admobid.banner,
          interstitialAdId: admobid.interstitial,
          adSize: window.plugins.AdMob.AD_SIZE.BANNER,	//use SMART_BANNER, BANNER, LARGE_BANNER, IAB_MRECT, IAB_BANNER, IAB_LEADERBOARD
          bannerAtTop: true, // set to true, to put banner at top
          overlap: true, // banner will overlap webview
          offsetStatusBar: false, // set to true to avoid ios7 status bar overlap
          isTesting: true, // receiving test ad
          autoShowBanner: true // auto show interstitial ad when loaded
      });
      app.registerAdEvents();
      window.plugins.AdMob.createInterstitialView();
      window.plugins.AdMob.requestInterstitialAd();
    } else {
      console.log( 'admob plugin not ready' );
    }
  },

  registerAdEvents: function() {
        document.addEventListener('onReceiveAd', function(){});
        document.addEventListener('onFailedToReceiveAd', function(data){});
        document.addEventListener('onPresentAd', function(){});
        document.addEventListener('onDismissAd', function(){ });
        document.addEventListener('onLeaveToAd', function(){ });
        document.addEventListener('onReceiveInterstitialAd', function(){ });
        document.addEventListener('onPresentInterstitialAd', function(){ });
        document.addEventListener('onDismissInterstitialAd', function(){
        	window.plugins.AdMob.createInterstitialView();			//REMOVE THESE 2 LINES IF USING AUTOSHOW
            window.plugins.AdMob.requestInterstitialAd();			//get the next one ready only after the current one is closed
        });
    }

};
app.initialize();
