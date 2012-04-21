var app = {
    
    location: { lon: 0, lat: 0 },
    objects:  [{ name: 'moon', coords: [123,234] }],
    

    init: function() {
        
        var media1 = new Media('audio/bbc.m4a'),
            media2 = new Media('audio/mimpossible.wav'),
            media3 = new Media('audio/cosmos201.mp3'),
            media4 = new Media('audio/oneplanet.mp3'),
            media5 = new Media('audio/swoon.mp3');

        media3.play();    
        //setTimeout(function() { media2.play(); }, 5000);
        //setTimeout(function() { media3.play(); }, 10000);
        //setTimeout(function() { media4.play(); }, 15000);        
        //setTimeout(function() { media5.play(); }, 20000);
        
        
        window.addEventListener("deviceorientation", app.handleOrientation); 
        
        
    },
    
    
    locateUser: function() {
        // Get GPS Coordinates    
        // app.location = {}
    },
    
    
    initObjects: function(lon, lat) {
        // Call webservice and populate app.objects
        
        // Normalise coordinates for the app.objects lookup array
    },
    
    
    handleOrientation: function(orientation) {
        // Check if any objects are in range        
        var objectInView = app.findObjectInRange(orientation);
        
        if (objectInView) { app.audio.play(objectInView); }
    },
    
    
    findClosestObject: function(orientation) {
        var absolute = orientation.absolute,
            alpha    = orientation.alpha,
            beta     = orientation.beta,
            gamma    = orientation.gamma;
            
    
    
        if (true) {
            return app.objects[0];
        } else {
            return false;
        }
    }
}    
    

