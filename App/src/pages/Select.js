import React,{ useState, useEffect } from 'react';

import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setTargetMuzzle } from '../actions/actions';
import { setData, storageAvailable } from '../common/util';
import '../App.scss';

export default function Select(props) {
  const [ muzzleList, setMuzzleList ] = useState(['めっちゃ','えーっと','ジェーピーハックス','ゆーて','やばい','無理','どうせ','でも']);
  const [ muzzleText,setMuzzleText ] = useState('');

  const histoy = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    if (storageAvailable('localStorage')) {
      console.log("わあい! localStorage をちゃんと使用できます");
      if(localStorage.getItem('everUsed')) {
        //localStorage.removeItem('everUsed');
        //localStorage.removeItem('muzzles');
        setMuzzleList(JSON.parse(localStorage.getItem('muzzles')));
      }else{
        localStorage.setItem('muzzles', JSON.stringify(['めっちゃ','えーっと','ジェーピーハックス','ゆーて','やばい','無理','どうせ','でも']));
        localStorage.setItem('everUsed',"true");
        console.log("set muzzles");
      }
    }
    else {
      console.log("ローカルストレージを使用できません");
    }
  },[]);


  // 口癖をセットして画面遷移
  function setMuzzle(text) {
    dispatch(setTargetMuzzle(text));
    histoy.push({pathname:'home'});
  }


  function changeMuzzleText(e) {
    setMuzzleText(e.target.value);
  }

  function pushUserSelectMuzzle() {
    setData(muzzleText);
    setMuzzleList([...muzzleList,muzzleText]);
    setMuzzleText('');
  }

  const muzzleListElement = muzzleList.map(muzzle => {
    return (
      <li className="List-item" key={muzzle} onClick={() => { setMuzzle(muzzle) }}>
        <p className="List-item_muzzle-word">
          {muzzle}
        </p>
      </li>
    )
  })

  return (
    <div className="list-bg">
      <button className="back-button">
        <i class="fas fa-chevron-left"></i>TOP
      </button>
      <h1 className="App-body_rank-header">口癖を選ぶ</h1>
      <div className="App-body_rank-list">
        <ul className="List">
          {muzzleListElement}
        </ul>
      </div>
      <input onChange={changeMuzzleText} value={muzzleText} type="text"/>
      <button onClick={pushUserSelectMuzzle}>
        Submit
      </button>
    </div>
  )
}
