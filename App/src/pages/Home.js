import React,{ useState } from 'react';
import './Home.css';
import { useHistory } from 'react-router-dom';

import { morphologicalAnalysis,vibrate } from '../assets/util'

export default function Home() {
    let [ isRecording,setIsRecording ] = useState(false);
    let [ targetMuzzle,setTargetMuzzle ] = useState({
        'text':'えっ',
    });

    let recognition;
    const history = useHistory();

    function recordStart() {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new window.SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = "ja-JP";
        setIsRecording(true)
    
        recognition.onerror = function(event){
            window.alert(event.error);
        }

        recognition.onresult = async function(event)  {
            let text = event.results[event.results.length-1][0].transcript;
            await vibrate();
            let tokens = await morphologicalAnalysis(text);
            for(let token of tokens) {
                if(token['surface_form'] == targetMuzzle['text']) {
                    vibrate();
                }
            }
        }
        recognition.start();
    }

    function recordStop() {
        recognition.abort();
        recognition = null;
        setIsRecording(false);
    }
    
    let recordButton = ( isRecording )? (
        <button onClick={recordStop}>RecordStop</button>
    ):(
        <button onClick={recordStart}>RecordStart</button>
    )
    
    return (
        <body className="App-body">
            <a>HomePage</a>
            <button onClick={()=>history.push('/result')}>ToResult</button>
            {recordButton}
        </body>
    );
}