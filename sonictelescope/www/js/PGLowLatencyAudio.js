var PGLowLatencyAudio = {
    _volumes: {},
  
    preloadFX: function ( id, assetPath, success, fail) {
        return PhoneGap.exec(success, fail, "PGLowLatencyAudio", "preloadFX", [id, assetPath]);
    },    
        
    preloadAudio: function ( id, assetPath, voices, success, fail) {
        return PhoneGap.exec(success, fail, "PGLowLatencyAudio", "preloadAudio", [id, assetPath, voices]);
    },
        
    play: function (id, success, fail) {
        return PhoneGap.exec(success, fail, "PGLowLatencyAudio", "play", [id]);
    },
        
    stop: function (id, success, fail) {
        return PhoneGap.exec(success, fail, "PGLowLatencyAudio", "stop", [id]);
    },
        
    loop: function (id, success, fail) {
        return PhoneGap.exec(success, fail, "PGLowLatencyAudio", "loop", [id]);
    },
        
    unload: function (id, success, fail) {
        return PhoneGap.exec(success, fail, "PGLowLatencyAudio", "unload", [id]);
    },

    setVolume: function (id, volume, success, fail) {
        this._volumes[id] = volume;
        return PhoneGap.exec(success, fail, "PGLowLatencyAudio", "setVolume", [id, volume]);
    },
    
    getVolume: function(id) {
        return parseFloat(this._volumes[id]);
    },
    
    fadeTo: function(id, targetVolume) {
        var self          = this,
            increment     = 0.05,
            currentVolume = this.getVolume(id),
            action        = currentVolume > targetVolume ? 'decrease' : 'increase';
        
        var fader = setInterval(function() { 
            if (action == 'increase') {
                currentVolume = currentVolume + 0.01;
                if (currentVolume >= targetVolume) { clearInterval(fader); }
            } else {
                currentVolume = currentVolume - 0.01;
                if (currentVolume <= targetVolume) { clearInterval(fader); }            
            }
            
            console.log(currentVolume);
            self.setVolume(id, currentVolume);
        }, 50);
    }    
    
    
};