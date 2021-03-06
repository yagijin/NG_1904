import React ,{ Fragment, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../App.scss';
import { setData } from '../common/util';

export default function Detail() {
  const history = useHistory();
  const location = useLocation();
  const sentences = useSelector((state) => state.addContent.sentences);
  const targetMuzzle = useSelector((state) => state.setMuzzle.targetMuzzle);

  useEffect(() => {
    window.gtagPageview(location.pathname);
  },[ location.pathname ])


  function transitionPrev() {
    history.goBack();
  }

  function MakeList (props) {
    console.log(props.sentence);
    const list = [];
    const regexp = new RegExp('(' + targetMuzzle + ')','g');
    const texts = props.sentence.split(regexp);
    var result = texts.filter(function( text ) {
      return text !== '';
    });


    result.forEach((text, index) => {
      if(text !== targetMuzzle){
        list.push(
          <span key={index}>{text}</span>
        )
      }else{
        list.push(
          <span key={index} className="span-detail">{targetMuzzle}</span>
        )
      }
    });

    return(<>{list}</>);
  }

  function ShowList() {
    console.log(targetMuzzle)
    console.log(sentences)

    if(targetMuzzle !== undefined && sentences !== undefined){
      let sentencesShow = [];
      for(let i=0;i<sentences.length;i++){
        if(sentences[i].indexOf(targetMuzzle) !== -1){
          const text = sentences[i].trim().replace(/\s+/g, "");
          sentencesShow.push(text);
        }
      }
      return (sentencesShow.map((sentence, index) => <li className="detail_content-text" key = {index}><MakeList sentence={sentence}/></li>));
    }else{
      return <Fragment key={0}></Fragment>
    }
  };

  function onClickAgain () {
    setData(targetMuzzle);
    history.push({pathname:'/home'});
}

  return (
    <div className="detail">
      <div className="detail_header">
        <button className="back-button" onClick={transitionPrev}>
          <FontAwesomeIcon className="fontawesome" icon={['fas', 'chevron-left']} />戻る
        </button>
        <h2>会話のログ</h2>
        <button className="more-button" onClick={()=>onClickAgain()}>
            <i class="fas fa-redo-alt"></i>もう１回
        </button>
      </div>

      <p>「{targetMuzzle}」のログ</p>
      <hr></hr>

      <ol className="detail_content">
        <ShowList/>
      </ol>
    </div>
  )
}