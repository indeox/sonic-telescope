app.audio = {
    
    init: function() {
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
        
        Audio.preloadAudio('background', '/audio/background_loop_filtered.mp3', 1);        
        Audio.loop('background');
        
        Audio.preloadAudio('pulsar', '/audio/pulsar_vela.mp3', 1);        
        Audio.setVolume('pulsar', 0);
        Audio.loop('pulsar');
        
        //app.audio.fadeTo('cosmos', 0.6);
        //Audio.fadeTo('cosmos', 0.6);
    },
    
    play: function(object) {
    
    }
}    

