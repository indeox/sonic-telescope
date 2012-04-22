var app = {
    
    dom: {},
    userLocation: { lat: 0, lon: 0, heading: 0 },
    sortedClosestObjects: {},
    threshold: 25, // before an object is "in view", in degrees
    previousObjectName: '',
    celestialObjects: [{ 
        name:   'mercury',         
        audio:  'moon.mp3',
        coords: [21.7, 238.9]
    }, {
        name:   'moon',
        audio:  'moon.mp3',
        coords: [5.6, 307.7]
    }, {
        name:   'moon2',
        audio:  'moon.mp3',
        coords: [35.6, 307.7]
    },{
        name:   'vela',
        audio:  'pulsar_vela.mp3',
        coords: [21, 200]    
    }],
    

    init: function() {
        app.locateUser();
        app.audio.init();
        app.initObjects({
            callback: function() {
                // Setup events
                window.addEventListener("deviceorientation", app.handleOrientation);
                navigator.compass.watchHeading(app.handleCompass,
                    function() {
                        // Compass error here
                    }, 
                    { frequency: 500 }
                );               
            }
        });
        
        // Debug only
        app.dom = { 
            altitude: $('#g-altitude'),
            azimuth:  $('#g-azimuth'),        
            object:   $('#o-object'),
            lat:      $('#l-lat'),
            lon:      $('#l-lon'),
            heading:  $('#c-heading')
        }
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
     * Get list from Heavens Above scraper.
     * TODO: Location is hardcoded to Reading at the moment;
     */
    initObjects: function(params) {
        // Call webservice and populate app.objects
        $.getJSON("http://www.deepcobalt.com/api/sonictelescope/", function(data) {
            app.celestialObjects = [];      
            for (var o in data) {
                var obj = {};
                obj.name = data[o].name;
                obj.coords = [parseFloat(data[o].altitude), parseFloat(data[o].azimuth)];
                app.celestialObjects.push(obj);          
            }
            
            if (params.callback) params.callback();
        });
    },
    
    /**
     * Handle gyroscope events.
     */
    handleOrientation: function(orientation) {
        // Check if any objects are in range        
        var objectInView = app.findClosestObject(orientation),
            objectName;

        
        if (objectInView) { 
            objectName = objectInView.name;
            //app.dom.object.text(objectInView.name);
        } else {
            objectName = '';
            //app.dom.object.text('');
        }
        
        // Update DOM only if necessary
        if (objectName != app.previousObjectName) {
            app.dom.object.text(objectName);
        }        
        app.previousObjectName = objectName;
        
        
        app.audio.updateAudioSpace();
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
            celestialObject;

		var closest = [];

        for (var i = 0; i < app.celestialObjects.length; i++) {
            // Calculate angular separation between object and user coords, 
            // if less than x return object
            var angularSeparation = app.getAngularSeparation(coords, app.celestialObjects[i].coords);
            var deg = radiansToDegrees(angularSeparation);
			closest[i] = {cO: i, deg: deg, volume: degreesToVolume(deg)};
		}

		closest.sort(function(a,b) { return a.deg - b.deg; });
		// closest index matches the celestialObjects index.
		for (var i = 0; i < closest.length; i++) {
            //if (i == 1) { console.log(angularSeparation); }
            if (closest[i].deg <= this.threshold) {
                celestialObject = app.celestialObjects[closest[i].cO];
                break;
            }
        }
        
        this.sortedClosestObjects = closest;
        
        // Debug
        app.dom.altitude.text(altitude.toFixed(2));
        app.dom.azimuth.text(azimuth.toFixed(2) + ' ('+app.celestialObjects.length+')');
    
        if (celestialObject) {
            return celestialObject;
        } else {
            return false;
        }
    },
    
    /**
     * Convert coordinates from horizontal to equatorial coordinate system.
     * see http://en.wikipedia.org/wiki/Horizontal_coordinate_system
     * http://star-www.st-and.ac.uk/~fv/webnotes/chapter7.htm
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
     * Calculates angular separation.
     */
    getAngularSeparation: function(userCoords, celestialCoords) {
        var a1 = degreesToRadians(userCoords[0]),
            a2 = degreesToRadians(celestialCoords[0]),
            b1 = degreesToRadians(userCoords[1]),
            b2 = degreesToRadians(celestialCoords[1]);
    
        var cosSep = Math.sin(a2) * Math.sin(a1) + Math.cos(a2) * Math.cos(a1) * Math.cos(b2 - b1);
    
        return Math.acos(cosSep);
    },    
    
    /**
     * Calculates angular separation between two points
     * Converts inot equatorial coordinates before calculating angular separation. 
     */
    getAngularSeparationEQ: function(userCoords, celestialCoords) {
        // Convert coordinates
        var userCoordsEQ = this.convertHorizontalToEquatorial(app.userLocation.lat, app.userLocation.lon, userCoords[0], userCoords[1]),
            celestialCoordsEQ = this.convertHorizontalToEquatorial(app.userLocation.lat, app.userLocation.lon, celestialCoords[0], celestialCoords[1]);

        var ra1 = userCoordsEQ[0];
            ra2 = celestialCoordsEQ[0];
            dec1 = userCoords[1];
            dec2 = celestialCoords[1];
        
        var distance = ra2 - ra1;

        var cosSep = (Math.sin(degreesToRadians(dec1)) * Math.sin(degreesToRadians(dec2))) +
        (Math.cos(degreesToRadians(dec1)) * Math.cos(degreesToRadians(dec2)) * Math.cos(degreesToRadians(distance)));

        //var cosSep = Math.cos(90 - dec1) * Math.cos(90 - dec2) + Math.sin(90 - dec1) * Math.sin(90 - dec2) * Math.cos(distance);
        
        return Math.acos(parseFloat(cosSep));
    },
    
    
    /**
     * 
     *
     */
    getAngularSeparationEQ2 : function(userCoords, celestialCoords) {
    
        var userCoordsEQ = this.convertHorizontalToEquatorial(app.userLocation.lat, app.userLocation.lon, userCoords[0], userCoords[1]),
            celestialCoordsEQ = this.convertHorizontalToEquatorial(app.userLocation.lat, app.userLocation.lon, celestialCoords[0], celestialCoords[1]);

        ra1 = parseFloat(userCoordsEQ[0]);
        ra2 = parseFloat(celestialCoordsEQ[0]);
        dec1 = parseFloat(userCoords[1]);
        dec2 = parseFloat(celestialCoords[1]);
		
		//console.log('getAngularSeparation -->>', ra1, dec1, ra2, dec2);
    
    	with (Math) {
    		var ra1Rad = degreesToRadians(ra1);
    		var dec1Rad = degreesToRadians(dec1);
    		
    		var ra2Rad = degreesToRadians(ra2);
    		var dec2Rad = degreesToRadians(dec2);
    		//console.log(ra1Rad, dec1Rad, ra2Rad, dec2Rad);
    		var dRA = ra1Rad - ra2Rad;
    		var dDec = dec2Rad - dec1Rad;
    		//                 a				c				a				c				B
    		var cosC = (sin(dec2Rad) * sin(dec1Rad)) + (cos(dec2Rad) * cos(dec1Rad) * cos(ra2Rad-ra1Rad));
    		var x = (cos(dec1Rad) * sin(ra2Rad-ra1Rad)) / cosC;
    		
    		var y = ((cos(dec2Rad)*sin(dec1Rad)) - (sin(dec2Rad)*cos(dec1Rad)*cos(ra2Rad-ra1Rad)))/cosC;
    		
    		var r = Math.sqrt(x*x+y*y);
    		
    		//console.log('radians', r, 'degrees', radiansToDegrees(r));
    	}
    	return r;
    },
    
    //getDegrees: function(lat1, lon1, lat2, long2) {
    getDegrees: function(userLocation, celestialObject) {
        var al1 = userLocation[0],
            az1 = userLocation[1],
            al2 = celestialObject[0],
            az2 = celestialObject[1],
            R = 6371, // km
            dAzimuth = degreesToRadians(az2-az1),
            dAltitude = degreesToRadians(al2-al1);
            

        az1 = degreesToRadians(az1);
        az2 = degreesToRadians(az2);

		//3963.0 * arccos[sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(lon2 - lon1)]
		//3963.0 * arctan[sqrt(1-x^2)/x]

        var a = Math.sin(dAzimuth/2) * Math.sin(dAzimuth/2) +
                Math.sin(dAltitude/2) * Math.sin(dAltitude/2) * Math.cos(az1) * Math.cos(az2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 

        return R * c;
    }
}    
    
function radiansToDegrees(val) {
    return val * (180 / Math.PI);
}
    
function degreesToRadians(val) {
    return val * (Math.PI / 180);
}        


/**
 * Convert degrees to volume - 0-100
 */
function degreesToVolume(deg) {
	// if you're a degree away, maximum volume.
	if (deg < 3) {
		return 100;
	}
	if (deg < 0 || deg > app.threshold) {
		return 0;
	}

	return (app.threshold-deg)/app.threshold;
}

    


