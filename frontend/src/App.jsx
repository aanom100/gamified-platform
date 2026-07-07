import { useState, useEffect } from "react";
import CreateChallenge from "./components/CreateChallenge";
function App(){
  /*const[message,setMessage]=useState('Loading....');
  useEffect(()=>{
    fetch('https://gamified-platform-32ih.onrender.com/api/test')
    .then(res=>res.json())
    .then(data=>setMessage(data.message))
    .catch(Err=>setMessage('Pipeline disconnected..'))
  },[]);*/

  return(
    <div>
     <h1 style={{ textAlign: 'center', fontFamily: 'sans-serif', marginTop: '20px' }}>
        Gamified Academic Platform
      </h1>
      
      {/* This renders the form you just built */}
      <CreateChallenge />
    </div>
  )
}

export default App