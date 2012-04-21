var app = {
    
    dom: {},
    userLocation: { lat: 0, lon: 0, heading: 0 },
    objects: [{ 
        name:   'mercury', 
        coords: [21.7, 238.9] 
    }, {
        name: 'venus',
        coords: [63.2, 150]
    }],
    

    init: function() {
        
        app.locateUser();
        
        app.audio.init();
        
        // Debug only
        app.dom = { 
            absolute: $('#g-absolute'),
            alpha:    $('#g-alpha'),
            beta:     $('#g-beta'),        
            gamma:    $('#g-gamma'),
            gyrodump: $('#g-dump'),
            objects:  $('#objects'),
            
            lat:      $('#l-lat'),
            lon:      $('#l-lon'),
            heading:  $('#c-heading')
        }
        //var converted = app.convHorToEqu(51, -8.4, 279.9);
        //console.log("c", converted);
        //app.dom.gyrodump.text(converted);

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
            app.userLocation.lat = position.coords.latitude;
            app.userLocation.lon = position.coords.longitude;
            
            app.dom.lat.text(app.userLocation.lat);
            app.dom.lon.text(app.userLocation.lon);            
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
        app.userLocation.heading = heading.magneticHeading;
        
        app.dom.heading.text(app.userLocation.heading);
    },
    
    findClosestObject: function(orientation) {
        var alpha    = Math.round(orientation.alpha),
            beta     = Math.round(orientation.beta),
            gamma    = Math.round(orientation.gamma),            
            heading  = app.userLocation.heading,
            
            altitude = orientation.beta,
            azimuth  = heading;
    
    
        var sin = beta/90;        
        Audio.setVolume('pulsar', sin);
    
        var userLocation = [altitude, azimuth];
        //var degrees = app.getDegrees(userLocation, app.objects[0].coords);
        
        // Iterate through all the objects
        /*var output = '';
        $.each(app.objects, function(index, item) {
            var degrees = Math.round(app.getDegrees(userLocation, item.coords));
            output += '<li>' + item.name + ': ' + degrees + '</li>';
        });
        app.dom.objects.html(output);
        */

        
        
    
        // Debug
        app.dom.alpha.text(alpha + ' ('+(360-alpha)+')');
        app.dom.beta.text(beta + ' ('+sin+')');
        app.dom.gamma.text(gamma);
        
        if (true) {
            return app.objects[0];
        } else {
            return false;
        }
    },
    
    convertHorizontalToEquatorial: function(latitude, altitude, azimuth) {  
        var sinD,  
            cosH,  
            HA,
            declination;
        
        // Convert to radians
        altitude = degreesToRadians(altitude);
        azimuth = degreesToRadians(azimuth);  
        latitude = degreesToRadians(latitude);
        
        // Calculate declination
        sinD = (Math.sin(altitude) * Math.sin(latitude)) + (Math.cos(altitude) * Math.cos(latitude) * Math.cos(azimuth));  
        declination = Math.asin(sinD);
        
        // Calculate hour angle
        cosH = ((Math.sin(altitude) - (Math.sin(latitude) * Math.sin(declination))) / (Math.cos(latitude) * Math.cos(declination)));

        HA = radiansToDegrees(Math.acos(cosH));  
        if (Math.sin(azimuth) > 0)  {  
            HA = 360 - HA;  
        }  
        
        // Convert to degrees
        declination = radiansToDegrees(declination);
        HA = HA / 15.0;  
        
        return [declination, HA];
    },    
    
    // Get angular separation between to objects
    getAngularSeparation: function(userCoords, celestialCoords) {
        // Convert coordinates from 
        var userCoordsEQ = convertHorizontalToEquatorial(userCoords),
            celestialCoordsEQ = convertHorizontalToEquatorial(celestialCoords);
    },
    
    getDegrees: function(userLocation, celestialObject) {
        var al1 = userLocation[0],
            az1 = userLocation[1],
            al2 = celestialObject[0],
            az2 = celestialObject[1],
            R = 6371, // km
            dAzimuth = toRad(az2-az1),
            dAltitude = toRad(al2-al1);
            

        az1 = toRad(az1);
        az2 = toRad(az2);

        var a = Math.sin(dAzimuth/2) * Math.sin(dAzimuth/2) +
                Math.sin(dAltitude/2) * Math.sin(dAltitude/2) * Math.cos(az1) * Math.cos(az2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 

        return R * c;
    }
                
}    
    
function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}
    
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}    




// Alias to PGLowLatencyAudio
Audio = PGLowLatencyAudio;
