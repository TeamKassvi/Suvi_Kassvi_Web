
 var recBlob;

var navigator = window.navigator;
navigator.getUserMedia = (
navigator.getUserMedia ||
navigator.webkitGetUserMedia ||
navigator.mozGetUserMedia ||
navigator.msGetUserMedia
);

var Context = window.AudioContext || window.webkitAudioContext;
var audio_context = new Context();
function __log(e, data) {
log.innerHTML += "\n" + e + " " + (data || '');
}
var recorder;

function startUserMedia(stream) {
var input = audio_context.createMediaStreamSource(stream);
__log('Media stream created.');

// Uncomment if you want the audio to feedback directly
//input.connect(audio_context.destination);
//__log('Input connected to audio context destination.');

recorder = new Recorder(input);
__log('Recorder initialised.');
}

function startRecording(button) {
recorder && recorder.record();
button.disabled = true;
button.nextElementSibling.disabled = false;
__log('Recording...');
}

function stopRecording(button) {
recorder && recorder.stop();
button.disabled = true;
button.previousElementSibling.disabled = false;
__log('Stopped recording.');

// create WAV download link using audio data blob
createDownloadLink();

recorder.clear();
}

function createDownloadLink() {
recorder && recorder.exportWAV(function(blob) {
var url = URL.createObjectURL(blob);
var li = document.createElement('li');
var au = document.createElement('audio');
var hf = document.createElement('a');

au.controls = true;
au.src = url;
hf.href = url;
hf.id="rec";
hf.download = new Date().toISOString() + '.wav';
hf.innerHTML = hf.download;
li.appendChild(au);
li.appendChild(hf);
recordingslist.appendChild(li);

recBlob = blob;
});
}

window.onload = function init() {
try {
// webkit shim
window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
window.URL = window.URL || window.webkitURL;

audio_context = new AudioContext;
__log('Audio context set up.');
__log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
} catch (e) {
alert('No web audio support in this browser!');
}

navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
__log('No live audio input: ' + e);
});
};

// <script type="text/javascript">

if (window.File && window.FileReader && window.FileList && window.Blob)
{
    console.log("This browser confirm window.File && window.FileReader !!!");
}
else
{
    alert('The File APIs are not fully supported in this browser.');
}

options = {
    url: {
        tokenUrl: 'https://token.beyondverbal.com/token',
        serverUrl: 'https://apiv3.beyondverbal.com/v3/recording/'

    },
    apiKey: "dd2dec2e-95e4-4412-9d88-c385c9a574a4",
    token: ''

};

$(function ()
{
    $("#form").validate({
        submitHandler: function (form)
        {
            $("#submit").attr("disabled", true).text("Analyze...");
            $('#result').html('');

            authenticate()
                .error(function (jqXHR, textStatus, errorThrown)
                {
                    Show(JSON.stringify(jqXHR) + errorThrown);
                })
               .success(function (data)
               {
                   console.log('sucess::' + JSON.stringify(data));
                   var token = JSON.parse(data);
                   options.token = token.access_token;
                   uploadFile(form[0].files[0]);
                   //uploadFile(recBlob);
               });
        }
    });

});

function uploadFile(file)
{
    if (typeof FileReader !== "undefined")
    {
        var reader = new FileReader();
        reader.onload = function (e)
        {
            analyzeFile("dd2dec2e-95e4-4412-9d88-c385c9a574a4", e.target.result)
                .done(function (res)
                {
                    Show(res);
                    $("#submit").attr("disabled", false).text("Start");
                })
                .fail(function (err)
                {
                    Show(err);
                    $("#submit").attr("disabled", false).text("Start");
                });
        };
        reader.readAsArrayBuffer(file);
    }
}

function authenticate()
{
    console.log('url token:' + options.url.tokenUrl);
    options.apiKey = "dd2dec2e-95e4-4412-9d88-c385c9a574a4";
    return $.ajax({
        url: options.url.tokenUrl,
        type: "POST",
        dataType: 'text',
        contentType: 'application/x-www-form-urlencoded',
        data: {
            grant_type: "client_credentials",
            apiKey: options.apiKey
        }
    });

}

function analyzeFile(apiKey, content, interval)
{
    var dfd = $.Deferred();
    var startUrl = options.url.serverUrl+'start';

    //console.log('url::' + startUrl + ' token:' + options.token);

    $.ajax({
        url: startUrl,
        headers: { 'Authorization': "Bearer " + options.token },
        type: "POST",
        cache: false,
        data: JSON.stringify({ dataFormat: { type: "WAV" } }),
        contentType: 'application/x-www-form-urlencoded',
        dataType: 'text'
    })
    .then(function (data)
    {
        Show(data);

        var recID = data.recordingId ? data.recordingId : JSON.parse(data).recordingId;
        //console.log('recid::' + recID);
        var upStreamUrl = options.url.serverUrl + recID;
        //post content for analysis
        $.ajax({
            url: upStreamUrl,
            headers: { 'Authorization': "Bearer " + options.token },
            data: content,
            contentType: false,
            processData: false,
            cache: false,
            dataType: 'text',
            type: "POST"
        })
        .then(dfd.resolve, dfd.reject);

    }, dfd.reject);

    return dfd.promise().always(function ()
    {
    });
}
function Show(json)
{
       let parsedJson = JSON.parse(json);
    console.log(parsedJson);
    if (parsedJson.result !== undefined){

        if(parsedJson.result.analysisSegments[0] === undefined){
            $('#result').append("Could not parse the audio.")

        }else{
    $('#result').append(parsedJson.result.analysisSegments[0].analysis.Mood.Composite.Primary.Phrase); console.log(parsedJson.result.analysisSegments[0].analysis.Mood.Composite.Primary.Phrase);
        }
    }
}

$("#logout").click(function (){
   if(window.localStorage.getItem("id")){
       window.localStorage.removeItem("id");
   }
       window.location = "http://www.teamakassvi.tech";
});
