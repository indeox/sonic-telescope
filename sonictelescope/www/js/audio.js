app.audio = {
    
    init: function() {
        
        // Constant background audio
        Audio.preloadAudio('background', '/audio/background_loop_filtered.mp3', 1);        
        Audio.loop('background');
    
        
                
        Audio.preloadAudio('pulsar', '/audio/pulsar_vela.mp3', 1);        
        Audio.setVolume('pulsar', 0);
        Audio.loop('pulsar');
        
        Audio.preloadAudio('moon', '/audio/moon.mp3', 1);
        Audio.setVolume('moon', 0);
        Audio.loop('moon');
        
        //app.audio.fadeTo('cosmos', 0.6);
        //Audio.fadeTo('cosmos', 0.6);
    },
    
    
    updateAudioSpace: function() {
        console.log('update space');
    },
    
    play: function(object) {
    
    }
}    



// Audio test
/*var pulsarVolume = degreesToRadians(beta);
var moonVolume = degreesToRadians(Math.abs(gamma));        
Audio.setVolume('pulsar', pulsarVolume);
Audio.setVolume('moon', moonVolume);*/
