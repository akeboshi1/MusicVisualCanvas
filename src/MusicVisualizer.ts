export class Musicvisualizer {

    public source: any;
    public count;
    public analyser;
    public size;
    public gainNode;
    public xhr;
    public draw;
    public audioContext: any;

    constructor(obj) {
        this.source = null;
        this.count = 0;

        this.initAudioContext();
        // this.analyser = this.audioContext.createAnalyser();
        this.size = obj.size;
        this.analyser.fftSize = this.size * 2;

        // GainNode用来控制音频的音量
        this.gainNode = this.analyser[this.analyser.createGain ? "createGain" : "createGainNode"]();
        // 对象调用对象可以用obj.method，也可以obj[method]
        this.gainNode.connect(this.analyser.destination);

        this.analyser.connect(this.gainNode);

        this.xhr = new XMLHttpRequest();
        this.draw = obj.draw;
        this.visualize();
    }

    // load -> decode -> play
    public load(url, fun) {
        this.xhr.abort();
        this.xhr.open("GET", url);
        this.xhr.responseType = "arraybuffer";
        var self = this;
        this.xhr.onload = function () {
            fun(self.xhr.response);
        }
        this.xhr.send();
    }

    // BaseAudioContext.decodeAudioData()用来生成AudioBuffer
    // AudioBuffer供AudioBufferSourceNode使用，这样，AudioBufferSourceNode才可以播放音频数据
    public decode(arraybuffer, fun) {
        this.audioContext.decodeAudioData(arraybuffer, function (buffer) {
            fun(buffer);
        }, function (err) {
            console.log(err);
        });
    }

    public play(path) {
        var n = ++this.count;
        var self = this;
        self.source && self.source[self.source.stop ? "stop" : "noteOff"](); // 开始前先暂停之前音频的播放，防止多份音频同时播放
        if (path instanceof ArrayBuffer) {
            self.decode(path, function (buffer) {
                if (n != self.count) return;
                var bufferSource = this.audioContext.createBufferSource();
                // 将解码成功后的buffer赋值给bufferSource的buffer属性
                bufferSource.buffer = buffer;
                bufferSource.loop = true;
                bufferSource.connect(self.analyser);
                bufferSource[bufferSource.start ? "start" : "noteOn"](0);
                self.source = bufferSource;
            });
        }
        else {
            self.load(path, function (arraybuffer) {
                if (n != self.count) return;
                self.decode(arraybuffer, function (buffer) {
                    if (n != self.count) return;
                    var bufferSource = this.audioContext.createBufferSource();
                    // 将解码成功后的buffer赋值给bufferSource的buffer属性
                    bufferSource.buffer = buffer;
                    bufferSource.connect(self.analyser);
                    bufferSource[bufferSource.start ? "start" : "noteOn"](0);
                    self.source = bufferSource;
                });
            });
        }

    }

    public changeVolumn(percent) {
        this.gainNode.gain.value = percent * percent;
    }


    private initAudioContext() {
        var self = this;
        // @ts-ignore
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // @ts-ignore // 解决 Chrome 66之后高版本中AudioContext被强行suspend的问题
        if (typeof AudioContext != "undefined" || typeof window.webkitAudioContext != "undefined") {
            var resumeAudio = function () {
                if (typeof self.audioContext == "undefined" || self.audioContext == null) return;
                if (self.audioContext.state == "suspended") self.audioContext.resume();
                document.removeEventListener("click", resumeAudio);
            };
            document.addEventListener("click", resumeAudio);
        }
    }


    private visualize() {
        var self = this;
        var arr = new Uint8Array(self.analyser.frequencyBinCount);//数组长度是fftsize的一半
        // console.log(self.analyser.frequencyBinCount)
        var requestAnimationFrame = window.requestAnimationFrame ||
            // @ts-ignore
            window.webkitrequestAnimationFrame ||
            // @ts-ignore
            window.mozrequestAnimationFrame;//兼容
        function fn() {
            self.analyser.getByteFrequencyData(arr);// 将音频频域数据复制到传入的Uint8Array数组
            self.draw(arr);
            requestAnimationFrame(fn);
        }
        requestAnimationFrame(fn);
    }
}
