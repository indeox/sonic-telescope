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
        var angularSeparation = app.getAngularSeparation(userLocation, app.objects[0].coords);

        
        
    
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
    
    /**
     * Convert coordinates from horizontal to equatorial coordinate system.
     * see http://en.wikipedia.org/wiki/Horizontal_coordinate_system
     */
    function convertHorizontalToEquatorial(latitude, altitude, azimuth) {  
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
    
    convertHAtoRA : function(lon) {
        var time = new Date();
        var year = time.getFullYear(),
        month = time.getMonth() + 1,
        day = time.getDate(),
        hour = time.getHours(),
        min = time.getMinutes(),
        sec = time.getSeconds();
        
        var dwhole = 367 * y - parseInt(7 * (year + parseInt((month + 9) / 12)) / 4) 
        + parseInt(275 * month / 9) 
        + day - 730531.5;
        var dfrac = (hour + min/60 + sec/3600)/24;
        var d = dwhole + dfrac
        var GMST = (280.46061837 + 360.98564736629 * d) % 360;
        var LMST = (280.46061837 + 360.98564736629 * d + lon) % 360;
        
        return [GMST,LST, d];
    },
    
    convertHAtoRA2 : function(lon) {
        // julian date
        var jd = 367 * year 
        - parseInt( 7 * [year + parseInt( [month + 9]/12 )]/4 ) 
        - parseInt( 3 * [parseInt( [year + (month - 9)/7]/100 ) + 1]/4 ) 
        + parseInt( 275 * month/9 ) 
        + day
        + 1721028.5 
        + hour/24 
        + minute/1440 
        + second/86400;
        
        var a = 280.46061837 + 360.98564736629 * jd + 0.000387933*( parseInt(jd/36525.0) )^2 - ( parseInt(jd/36525.0) )^3/38710000;
        var GMST = a % 360;
        var LST = (GMST+lon) % 360;
        
        return [GMST,LST, a];
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
