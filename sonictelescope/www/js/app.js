var app = {
    
    dom: {},
    userLocation: { lat: 0, lon: 0, heading: 0 },
    objects:  [{ 
        name:   'mercury', 
        coords: [21.7, 238.9] 
    }, {
        name: 'venus',
        coords: [63, 150]
    }],
    

    init: function() {
        
        app.locateUser();
        
        /*var media1 = new Media('/audio/bbc.m4a'),
            media2 = new Media('/audio/mimpossible.wav'),
            media3 = new Media('/audio/cosmos201.mp3'),
            media4 = new Media('/audio/oneplanet.mp3'),
            media5 = new Media('/audio/swoon.mp3');

        media1.play();    
        setTimeout(function() { media2.play(); }, 5000);
        setTimeout(function() { media3.play(); }, 10000);
        setTimeout(function() { media4.play(); }, 15000);        
        setTimeout(function() { media5.play(); }, 20000);
        */
        
        // Debug only
        app.dom = { 
            absolute: $('#g-absolute'),
            alpha:    $('#g-alpha'),
            beta:     $('#g-beta'),        
            gamma:    $('#g-gamma'),
            gyrodump: $('#g-dump'),
            
            lat:      $('#l-lat'),
            lon:      $('#l-lon'),
            heading:  $('#c-heading')
        }
        
        window.addEventListener("deviceorientation", app.handleOrientation);
        /*navigator.compass.watchHeading(app.handleCompass,
            function() {
                // Compass error here
            }, 
            { frequency: 500 }
        );*/
    },
    
    
    locateUser: function() {
        // Get GPS Coordinates    
        // app.location = {}
        if (navigator) {
			navigator.geolocation.getCurrentPosition(function(position) {
				app.userLocation.lat = position.coords.latitude;
				app.userLocation.lon = position.coords.longitude;
				
				app.dom.lat.text(app.userLocation.lat);
				app.dom.lon.text(app.userLocation.lon);            
			});      
		}
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
            gamma    = Math.round(orientation.gamma),            
            heading  = app.userLocation.heading,
            
            altitude = orientation.beta,
            azimuth  = heading;
    
    
        var userLocation = [altitude, azimuth];
        var degrees = app.getDegrees(userLocation, app.objects[0].coords);
        
        
    
        // Debug
        app.dom.alpha.text(alpha + ' ('+(360-alpha)+')');
        app.dom.beta.text(beta);
        app.dom.gamma.text(gamma);
        app.dom.gyrodump.text(degrees);
        
    
        if (true) {
            return app.objects[0];
        } else {
            return false;
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
    
    
    

// http://www.mathworks.com/matlabcentral/fileexchange/24581-convert-azimuth-and-elevation-to-right-ascension-and-declination
function convertAltitudeAzimuthDegreesToRightAscensionDeclination(altitude,azimuth,latitude,longitude) {

	var time = new Date();
	var year = time.getFullYear(),
		month = time.getMonth() + 1,
		day = time.getDate(),
		hour = time.getHours(),
		min = time.getMinutes(),
		sec = time.getSeconds();
	
	var jd = Math.floor(365.25 * (year + 4716.0)) 
		+ Math.floor(30.6001 * (month + 1.0))
		+ 2.0 - Math.floor(year / 100.0)
		+ Math.floor(Math.floor(year/100.0) / 4.0)
		+ day - 1524.5
		+ (hour + min/60 + sec/3600) / 24;

	var t = (jd - 2451545)/36525;
	var thetaGMST = 67310.54841 + (876600*3600 + 8640184.812866) * t 
				+ .093104 * (t^2) - (6.2 * 10^-6) * (t^3);

	var thetaGMST = ((thetaGMST % (86400 * (thetaGMST/Math.abs(thetaGMST)))) / 240) % 360;
	var thetaLST = thetaGMST + longitude;
	var thetaLST = thetaLST % 360;



	var dec = Math.asin(Math.sin(altitude)*Math.sin(latitude) + Math.cos(altitude) * Math.cos(latitude) * Math.cos(azimuth));

	var cos_RA = (Math.sin(altitude) - Math.sin(dec)*Math.sin(latitude))/(Math.cos(dec)*Math.cos(latitude));
	var RA = Math.acos(cos_RA);
	
	if (Math.sin(azimuth) > 0) {
		RA = 360 - RA;
	}
	RA = thetaLST - RA;
	
	if (RA < 0) {
		RA = RA + 360;
	}
	if (dec >= 0) {
		dec = Math.abs(dec);
	} else {
		dec = -Math.abs(dec);
	}
	console.log('>>' + cos_RA);
	return [dec, RA];

}
    
    
function toRad(a) {
    return a * (Math.PI/180);
}    
