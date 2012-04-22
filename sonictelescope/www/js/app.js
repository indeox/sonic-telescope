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
        coords: [5.6, 307.7]
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
            azimuth:  $('#g-azimuth'),        
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
        for (var i = 0; i < app.celestialObjects.length; i++) {
            // Calculate angular separation between object and user coords, 
            // if less than x return object
            var angularSeparation = app.getAngularSeparation(coords, app.celestialObjects[i].coords);
            if (i == 1) { console.log(angularSeparation); }
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
     * returns Right Acension (degrees), declination (degrees)
     */
    convertHorizontalToEquatorial: function(latitude, longitude, altitude, azimuth) {  
        var sinD,  
            cosH,  
            HA,
            RA,
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
        
        RA = this.lst3(longitude)[1] - HA;
        
        return [RA, declination];
    },    
    
    /*
     * http://answers.yahoo.com/question/index?qid=20070830185150AAoNT4i
     * http://mysite.verizon.net/res148h4j/javascript/script_clock.html
     * Uses Meeus formula 11.4
     */
    lst : function(lon) {
        var time = new Date();
        var year = time.getUTCFullYear(),
			month = time.getMonth() + 1,
			day = time.getUTCDate(),
			hour = time.getUTCMinutes(),
			min = time.getUTCMinutes(),
			sec = time.getUTCSeconds();

        // days since J2000.0
        var dwhole = 367 * year - parseInt(7 * (year + parseInt((month + 9) / 12)) / 4) 
        		+ parseInt(275 * month / 9) 
        		+ day - 730531.5;
        var dfrac = (hour + min/60 + sec/3600)/24;
        var jd = dwhole + dfrac;

        var GMST = (280.46061837 + 360.98564736629 * jd) % 360;
        var LMST = (280.46061837 + 360.98564736629 * jd + lon) % 360;
        
        return [GMST,LMST, jd];
    },

    lst3 : function(lon)  {

    	var time = new Date();
        var year = time.getUTCFullYear() - 1,
			month = time.getMonth() + 1,
			day = time.getUTCDate(),
			hour = time.getUTCMinutes(),
			min = time.getUTCMinutes(),
			sec = time.getUTCSeconds();
			
		if (month <= 2) {
			year--;
			month += 12;
		}
	
		var d = Math.floor(30.6001 * (month + 1));  
		var ut = (hour + min/60.0 + sec/3600.0);
		// days since J2000.0
		var jd =  Math.floor(365.25*(year+4716)) + d + day - 13 -1524.5 + ut/24.0;
		
		//
		var frac = function(X) {
 			X = X - Math.floor(X);
 			if (X<0) X = X + 1.0;
 			return X;		
		}
		var MJD = jd - 2400000.5;		
		var MJD0 = Math.floor(MJD);
		var ut = (MJD - MJD0)*24.0;		
		var t_eph  = (MJD0-51544.5)/36525.0;			
		var GMST =  6.697374558 + 1.0027379093*ut + (8640184.812866 + (0.093104 - 0.0000062*t_eph)*t_eph)*t_eph/3600.0;
		var LMST = 24.0 * frac((GMST + lon/15.0)/24.0);
		//
			
		return [GMST, LMST, jd];
    },
    
    /**
     * Calculates angular separation between two points
     * (ra1, dec1) and (ra2, dec2) using cosine rule. 
     */
    getAngularSeparation: function(userCoords, celestialCoords) {
        // Convert coordinates
        var userCoordsEQ = this.convertHorizontalToEquatorial(app.userLocation.lat, app.userLocation.lon, userCoords[0], userCoords[1]),
            celestialCoordsEQ = this.convertHorizontalToEquatorial(app.userLocation.lat, app.userLocation.lon, celestialCoords[0], celestialCoords[1]);

        var ra1 = userCoordsEQ[0];
            ra2 = celestialCoordsEQ[0];
            dec1 = userCoords[1];
            dec2 = celestialCoords[1];
        
        var distance = ra2 - ra1;
        console.log('distance', distance);
        var cosSep = (Math.sin(degreesToRadians(dec1)) * Math.sin(degreesToRadians(dec2))) +
        (Math.cos(degreesToRadians(dec1)) * Math.cos(degreesToRadians(dec2)) * Math.cos(degreesToRadians(distance)));

        //var cosSep = Math.cos(90 - dec1) * Math.cos(90 - dec2) + Math.sin(90 - dec1) * Math.sin(90 - dec2) * Math.cos(distance);
        
        console.log(ra1, dec1, ra2, dec2, Math.acos(cosSep));
        
        return Math.acos(parseFloat(cosSep));
    },
    
    
    /**
     * 
     *
     */
    getAngularSeparation2 : function(userCoords, celestialCoords) {
    
        var userCoordsEQ = this.convertHorizontalToEquatorial(app.userLocation.lat, app.userLocation.lon, userCoords[0], userCoords[1]),
            celestialCoordsEQ = this.convertHorizontalToEquatorial(app.userLocation.lat, app.userLocation.lon, celestialCoords[0], celestialCoords[1]);

        ra1 = parseFloat(userCoordsEQ[0]);
        ra2 = parseFloat(celestialCoordsEQ[0]);
        dec1 = parseFloat(userCoords[1]);
        dec2 = parseFloat(celestialCoords[1]);

    
    	with (Math) {
    		var cRA = degreesToRadians(ra1);
    		var cDec = degreesToRadians(dec1);
    		
    		var gRA = degreesToRadians(ra2);
    		var gDec = degreesToRadians(dec2);
    		
    		var dRA = cRA - gRA;
    		var dDec = gDec - cDec;
    		
    		var cosC = (sin(gDec) * sin(cDec)) + (cos(gDec) * cos(cDec) * cos(gRA-cRA));
    		var x = (cos(cDec) * sin(gRA-cRA)) / cosC;
    		
    		var y = ((cos(gDec)*sin(cDec)) - (sin(gDec)*cos(cDec)*cos(gRA-cRA)))/cosC;
    		
    		var r = Math.sqrt(x*x+y*y);
    		
    		console.log(r, radiansToDegrees(r));
			return r;
    	}
    
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


PGLowLatencyAudio = {};

var lat= 51;
app.userLocation.lat = lat;
var lon = 0.1;
app.userLocation.lon = lon;
var altitude = 35.6;
var azimuth = 331.9;


console.log(app.getAngularSeparation([altitude, azimuth], [altitude, azimuth]));
console.log('getAngularSeparation2', app.getAngularSeparation2([altitude, azimuth], [36.6, azimuth]));


