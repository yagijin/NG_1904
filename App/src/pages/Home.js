import React,{ useState, useEffect, useReducer, useMemo } from 'react';

import { useHistory } from 'react-router-dom';
import { vibrate, morphologicalAPIClient, wordCount } from '../common/util';/* morphologicalAnalysis */

import MIC from '../assets/img/mic.png';
import TALK from '../assets/img/talk.png';
import STOP from '../assets/img/stop.png';
import '../App.scss';

import { useDispatch, useSelector } from 'react-redux';
import { setPage, addWords, PAGES, addSentences } from '../actions/actions' 
import { clearInterval } from 'timers';

import Loader from 'react-loaders'

//stateで管理すると2回目から録音ボタンを押しても何も始まらなくなるので設定
//いずれ解決する必要あり
let staterecording = false;

export default function Home() {
    //const currentPage = useSelector(state => state.setPages.currentPage);
    const targetMuzzle = useSelector(state => state.setMuzzle.targetMuzzle);
    const dispatch = useDispatch();
    const [ isRecording,setIsRecording ] = useState(false);
    const [ isLoading,setIsLoading ] = useState(false)
    const [ data, dispatcherReducer ] = useReducer((prevData,text) => {return [...prevData,text];}, []);
    const [ latestText,setLatestText ] = useState("");
    const history = useHistory();

    const loadingStyle = useMemo(() => {
        return {
            display: isLoading ? "flex" : "none"
        }
    },[ isLoading ])

    useEffect(() => {
        console.log("Effect is Called");
        window.SpeechRecognition =  window.webkitSpeechRecognition || window.SpeechRecognition;
        let recognize = new window.SpeechRecognition();
        recognize.lang = "ja-JP";

        let intervalId;

        if(isRecording){
            recognize.onresult = (event) =>  {
                const last = event.results.length - 1;
                const text = event.results[last][0].transcript;
                console.log(text);

                let index = text.indexOf(targetMuzzle);
                if(index !== -1){
                    console.log("vibrate");//PCでの確認用
                    vibrate();
                }
                dispatcherReducer(text);
                setLatestText(text);
            }

            recognize.onspeechstart = (event) => {
                console.log("Speech Start");
                intervalId = setTimeout(() => {
                    console.log("Speech stop")
                    recognize.stop();
                },6000)
            }

            recognize.onend = (event) => {
                console.log("onend")
                if(! intervalId) {
                    clearInterval(intervalId);
                }
                if(staterecording){
                    recognize.stop();
                    recognize.start();
                }
            }

            recognize.start();
        } else {
            if(intervalId !== undefined) {
                clearInterval(intervalId);
            }
        }

        return () => {
            if(recognize != null) {
                recognize.abort();
            };
            if(! intervalId) {
                clearInterval(intervalId);
            }
        }
        //targetMuzzleは更新されないので依存関係に含めていい（はず）
    },[ isRecording, dispatcherReducer, targetMuzzle ]);

    useEffect(() => {
        //対応していないブラウザで警告を表示する
        //IOS版のChrome，safari,Android版のChrome，firefox，デスクトップ版のchrome,firefoxで動作確認済み
        dispatch(setPage(PAGES.RECORDS));
        if(targetMuzzle==="口癖"){
            const agent = window.navigator.userAgent.toLowerCase();
            const chrome = (agent.indexOf('chrome') !== -1) && (agent.indexOf('edge') === -1)  && (agent.indexOf('opr') === -1);
            if(!chrome){
                window.alert("お使いのブラウザは対応しておりません．Android版のChromeをお使いください．");
            }
        }
    },[ targetMuzzle, dispatch ])

    function recordStart() {
        //将来的にまとめたい
        setIsRecording(true);
        staterecording = true;

        dispatch(setPage(PAGES.RECORDING));
    }

    async function recordStop() {
        //将来的にまとめたい
        setIsRecording(false);
        staterecording = false;
        
        //ストップボタン押下時に録音データが存在した場合にページ遷移
        const str = data.join('');

        if(str.trim().length !== 0) {
            setIsLoading(true);
            let tokens = await morphologicalAPIClient(str);
            console.info(tokens);
            let wc = wordCount(tokens["word_list"][0]);
            dispatch(addWords(wc));
            dispatch(addSentences(data));

            /*
            let count = 0;
            for(let j of data){
                count += (j.match(new RegExp(targetMuzzle, "g")) || []).length ;
            }
            console.log("yagi   :" + count);
            */
            //解析後に値がない場合も遷移しない
            if(wc.length!==0){
           setIsLoading(false);

                history.push({pathname:'/result'})
            }
        }else{
            dispatch(setPage(PAGES.RECORDS));
        }
    }

    function transitionSelect() {
        setIsRecording(false);
        staterecording = false;
        history.push({pathname:"select"});
    }

    let recordButton = ( isRecording )? (
        <button onClick={recordStop} className="App-body_reco-stop"><img src={STOP} alt="停止"/>録音終了</button>
    ):(
        <button onClick={recordStart} className="App-body_reco-start"><img src={MIC} alt="マイク"/>会話を録音</button>
    )

    return (
        <div className="App-body">
            <div className="loader-wraper" style={loadingStyle} >
                <Loader className="loader-animation" type="pacman" loaded={isLoading}/>
            </div>
            <button onClick={transitionSelect}>
                Select Button
            </button>
            
            <div>
                {latestText}
            </div>
            <h1 className="App-body_reco-header">「<span className="App-body_reco-header-muzzle">{targetMuzzle}</span>」<br></br>を直そう</h1>
                {recordButton}
            <img className="App-body_reco-img" src={TALK} alt="会話する人間"/>
        </div>
    );
}
