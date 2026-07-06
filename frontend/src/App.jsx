import { useState, useEffect } from "react";

function App(){
  const[message,setMessage]=useState('Loading....');
  useEffect(()=>{
    fetch('http://localhost:5000/api/test')
    .then(res=>res.json())
    .then(data=>setMessage(data.message))
    .catch(Err=>setMessage('Pipeline disconnected..'))
  },[]);

  return(
    <div>
      <h1>Platform Pipeline test</h1>
      <h2>Status:{message}</h2>
    </div>
  )
}

export default App