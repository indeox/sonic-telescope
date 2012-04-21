var app = {
    
    dom: {},
    location: { lat: 0, lon: 0, heading: 0 },
    objects:  [{ name: 'moon', coords: [123,234] }],
    

    init: function() {
        
        app.locateUser();
        /*var media1 = new Media('audio/bbc.m4a'),
            media2 = new Media('audio/mimpossible.wav'),
            media3 = new Media('audio/cosmos201.mp3'),
            media4 = new Media('audio/oneplanet.mp3'),
            media5 = new Media('audio/swoon.mp3');

        media3.play();    
        //setTimeout(function() { media2.play(); }, 5000);
        //setTimeout(function() { media3.play(); }, 10000);
        //setTimeout(function() { media4.play(); }, 15000);        
        //setTimeout(function() { media5.play(); }, 20000);
        */
        
        // Debug only
        app.dom = { 
            absolute: $('#g-absolute'),
            alpha:    $('#g-alpha'),
            beta:     $('#g-beta'),        
            gamma:    $('#g-gamma'),
            
            lat:      $('#l-lat'),
            lon:      $('#l-lon'),
            heading:  $('#c-heading')
        }
        
        window.addEventListener("deviceorientation", app.handleOrientation);
        navigator.compass.watchHeading(app.handleCompass,
            function() {
                // Compass error here
            }, 
            { frequency: 500 }
        );
    },
    
    
    locateUser: function() {
        // Get GPS Coordinates    
        // app.location = {}
        navigator.geolocation.getCurrentPosition(function(position) {
            app.location.lat = position.coords.latitude;
            app.location.lon = position.coords.longitude;
            
            app.dom.lat.text(app.location.lat);
            app.dom.lon.text(app.location.lon);            
        });      
    },
    
    
    initObjects: function(lon, lat) {
        // Call webservice and populate app.objects
        
        // Normalise coordinates for the app.objects lookup array
    },
    
    
    handleOrientation: function(orientation) {
        // Check if any objects are in range        
        var objectInView = app.findClosestObject(orientation);
        
        if (objectInView) { app.audio.play(objectInView); }
    },
    
    handleCompass: function(heading) {
        // Update compass
        app.location.heading = heading.magneticHeading;
        
        app.dom.heading.text(app.location.heading);
    },
    
    
    findClosestObject: function(orientation) {
        var alpha    = Math.round(orientation.alpha),
            beta     = Math.round(orientation.beta),
            gamma    = Math.round(orientation.gamma);
            
    
        // Debug
        app.dom.alpha.text(alpha);
        app.dom.beta.text(beta);
        app.dom.gamma.text(gamma);
        
    
        if (true) {
            return app.objects[0];
        } else {
            return false;
        }
    }
}    
    

