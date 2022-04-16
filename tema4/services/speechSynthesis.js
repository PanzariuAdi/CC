module.exports.example = function(myobj) {
    "use strict";

    var sdk = require("microsoft-cognitiveservices-speech-sdk");

    var key = "2c95196f55ce49608da44214a0eece7e";
    var region = "eastus";
    var audioFile = "response.wav";

    const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);

    // The language of the voice that speaks.
    speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural"; 

    // Create the speech synthesizer.
    var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    // Start the synthesizer and wait for a result.
    synthesizer.speakTextAsync(myobj, function (result) {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            console.log("synthesis finished.");
        } else {
            console.error("Speech synthesis canceled, " + result.errorDetails + "\nDid you set the speech resource key and region values?");
        }
        synthesizer.close();
        synthesizer = null;
    },
        function (err) {
            console.trace("err - " + err);
            synthesizer.close();
            synthesizer = null;
        });
    console.log("Now synthesizing to: " + audioFile);
};

// "use strict";

// var sdk = require("microsoft-cognitiveservices-speech-sdk");

// var key = "6ae2fa9a18974eb48353440d4f80e6f9";
// var region = "eastus";
// var audioFile = "text.wav";

// const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
// const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);

// // The language of the voice that speaks.
// speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";

// // Create the speech synthesizer.
// var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

// module.exports.textToSpeech = function(text) {
//     synthesizer.speakTextAsync(text, function(result) {
//         if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
//             console.log("Synthethis fucking finished !");
//         } else {
//             console.error("Speech Synthethis funcking canceled !" + result.errorDetails);
//         }
//         synthesizer.close;
//         synthesizer = null;
//     }, function(err) {
//         console.trace("err - " + err)
//     });
//     console.log("Now synthesizing to :" + audioFile);
// }