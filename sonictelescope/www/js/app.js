var app = {
    
    dom: {},
    userLocation: { lat: 0, lon: 0, heading: 0 },
    celestialObjects: [{ 
        name:   'mercury',         
        audio:  'moon.mp3',
        coords: [21.7, 238.9]
    }, {
        name:   'moon',
        audio:  'moon.mp3',
        coords: [63, 150]
    },{
        name:   'vela',
        audio:  'pulsar_vela.mp3',
        coords: [21, 200]    
    }],
    

    init: function() {
        app.locateUser();
        app.audio.init();
        
        // Debug only
        app.dom = { 
            absolute: $('#g-absolute'),
            altitude: $('#g-altitude'),
            azimut:    $('#g-azimuth'),        
            objects:  $('#objects'),
            lat:      $('#l-lat'),
            lon:      $('#l-lon'),
            heading:  $('#c-heading')
        }
        
        // Setup events
        window.addEventListener("deviceorientation", app.handleOrientation);
        navigator.compass.watchHeading(app.handleCompass,
            function() {
                // Compass error here
            }, 
            { frequency: 500 }
        );
    },
    
    /**
     *  Get GPS coordinates.
     */
    locateUser: function() {
        if (navigator) {
			navigator.geolocation.getCurrentPosition(function(position) {
				app.userLocation.lat = position.coords.latitude;
				app.userLocation.lon = position.coords.longitude;
				
				app.dom.lat.text(app.userLocation.lat);
				app.dom.lon.text(app.userLocation.lon);            
			});      
		}
    },
    
    /**
     * Init celestial objects.
     * Get list from Wolfram Alpha API.
     */
    initObjects: function(lon, lat) {
        // Call webservice and populate app.objects
        
        // Normalise coordinates for the app.objects lookup array
    },
    
    /**
     * Handle gyroscope events.
     */
    handleOrientation: function(orientation) {
        // Check if any objects are in range        
        var objectInView = app.findClosestObject(orientation);
        
        if (objectInView) { app.audio.play(objectInView); }
    },
    
    /**
     * Handle compass events
     */
    handleCompass: function(heading) {
        app.userLocation.heading = heading.magneticHeading;
        
        app.dom.heading.text(app.userLocation.heading);
    },
    
    /**
     * Find closest object to user vector.
     */
    findClosestObject: function(orientation) {
        var altitude = orientation.beta,
            azimuth  = app.userLocation.heading;
        
        var coords = [altitude, azimuth];
        
        // Loop through list of celestial objects
        var angularSeparation,
            threshold = 10,
            celestialObject;
        for (var i = 0; i < app.celestialObjects; i++) {
            // Calculate angular separation between object and user coords, 
            // if less than x return object
            var angularSeparation = app.getAngularSeparation(coords, app.celestialObjects[i].coords);
            
            if (angularSeparation < threshold) {
                threshold = angularSeparation;
                celestialObject = celestialObjects[i];
            }
        }
        
        // Debug
        app.dom.altitude.text(altitude);
        app.dom.azimuth.text(azimuth);
    
        if (celestialObject) {
            return celestialObject;
        } else {
            return false;
        }
    },
    
    /**
     * Convert coordinates from horizontal to equatorial coordinate system.
     * see http://en.wikipedia.org/wiki/Horizontal_coordinate_system
     */
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
    
    /*
     * http://answers.yahoo.com/question/index?qid=20070830185150AAoNT4i
     * http://mysite.verizon.net/res148h4j/javascript/script_clock.html
     * Uses Meeus formula 11.4
     */
    lst : function(lon) {
        var time = new Date();
        var year = time.getUTCFullYear() - 1,
			month = time.getMonth() + 1,
			day = time.getUTCDate(),
			hour = time.getUTCMinutes(),
			min = time.getUTCMinutes(),
			sec = time.getUTCSeconds();
        
        var dwhole = 367 * year - parseInt(7 * (year + parseInt((month + 9) / 12)) / 4) 
        + parseInt(275 * month / 9) 
        + day - 730531.5;
        var dfrac = (hour + min/60 + sec/3600)/24;
        var d = dwhole + dfrac;
        var GMST = (280.46061837 + 360.98564736629 * d) % 360;
        var LMST = (280.46061837 + 360.98564736629 * d + lon) % 360;
        
        return [GMST,LMST, d];
    },

    lst3 : function(lon)  {

    	var time = new Date();
        var year = time.getUTCFullYear() - 1,
			month = time.getMonth() + 1,
			day = time.getUTCDate(),
			hour = time.getUTCMinutes(),
			min = time.getUTCMinutes(),
			sec = time.getUTCSeconds();
			
		if (month == 1 || month == 2) {
			year = year - 1;
			month = month + 12;
		}
	
		var a = Math.floor(year/100);
		var b = 2 - a + Math.floor(a/4);
	
		var c = Math.floor(365.25 * year);
		var d = Math.floor(30.6001 * (month + 1));
	
		// days since J2000.0   
		var jd = b + c + d - 730550.5 + day + (hour + min/60.0 + sec/3600.0)/24.0;
		
		var jt   = jd/36525.0; // julian centuries since J2000.0         
		var GMST = 280.46061837 + 360.98564736629*jd + 0.000387933*jt*jt - jt*jt*jt/38710000;
		 
		if( GMST > 0.0 ) {
			while (GMST > 360.0 ) {
				GMST -= 360.0;
			}
		} else {
			while (GMST < 0.0) {
				GMST += 360.0;
			}
		}
			
		var LST = (GMST+lon);
			
		return [GMST, LST, jd];
    },
    
    // Get angular separation between to objects
    getAngularSeparation: function(userCoords, celestialCoords) {
        // Convert coordinates from 
        var userCoordsEQ = convertHorizontalToEquatorial(userCoords),
            celestialCoordsEQ = sdaq	(celestialCoords);
    },
    
    //getDegrees: function(lat1, lon1, lat2, long2) {
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

		//3963.0 * arccos[sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(lon2 - lon1)]
		//3963.0 * arctan[sqrt(1-x^2)/x]

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
    
function toRad(a) {
    return a * (Math.PI/180);
}

// Alias to PGLowLatencyAudio
Audio = PGLowLatencyAudio;



