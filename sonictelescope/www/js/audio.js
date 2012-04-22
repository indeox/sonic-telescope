Audio = PGLowLatencyAudio;

app.audio = {
    
    map: {
        earth:   'earth.mp3',
        neptune: 'jupiter.mp3',
        mars:    'mars_opportunity.mp3',
        moon:    'moon.mp3',
        mercury: 'moon.mp3',
        venus:   'moon.mp3',        
        saturn:  'saturn.mp3',
        uranus:  'uranus.mp3'
    },
    
    init: function() {
        console.log('here');
        // Constant background audio
        Audio.preloadAudio('background', '/audio/background_loop_filtered.mp3', 1);        
        Audio.loop('background');    
        Audio.setVolume('background', 0.5);
                
        /*Audio.preloadAudio('pulsar', '/audio/pulsar_vela.mp3', 1);        
        Audio.setVolume('pulsar', 0);
        Audio.loop('pulsar');
        
        Audio.preloadAudio('moon', '/audio/moon.mp3', 1);
        Audio.setVolume('moon', 0);
        Audio.loop('moon');*/
        
        $.each(this.map, function(item) {
            var audioId   = item,
                audioPath = '/audio/' + app.audio.map[audioId];
            
            Audio.preloadAudio(audioId, audioPath, 1)
            Audio.setVolume(audioId, 0);
            Audio.loop(audioId);
        });
        
        //app.audio.fadeTo('cosmos', 0.6);
        //Audio.fadeTo('cosmos', 0.6);
    },
    
    
    updateAudioSpace: function() {
        
        //var objectName = app.celestialObjects[cO].name.toLowerCase();
        //console.log(app.sortedClosestObjects);
        this.counter = this.counter++ || 0;
        var self = this;
        
        $.each(app.sortedClosestObjects, function(item, val) {
            var objectName = app.celestialObjects[val.cO].name.toLowerCase(),
                volume     = val.volume,
                degrees    = val.deg;
            
            if ((self.counter % 1000) == 0) {
                console.log(objectName+': '+volume+' : '+degrees);
            }            
            
            Audio.setVolume(objectName, volume);
        });
    },
    
    play: function(object) {
    
    }
}    



// Audio test
/*var pulsarVolume = degreesToRadians(beta);
var moonVolume = degreesToRadians(Math.abs(gamma));        
Audio.setVolume('pulsar', pulsarVolume);
Audio.setVolume('moon', moonVolume);*/
