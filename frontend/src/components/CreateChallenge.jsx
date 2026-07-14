import { use, useState} from "react";

function CreateChallenge(){
    //state to hold the user's input
    const[formData,setFormData]=useState({title:"",description:"",points:10});
    //state to hold the status of the request-response
    const[status,setStatus]=useState('');
    //update state whenever user types
    const handleChange=(e)=>{
        setFormData({...formData,[e.target.name]:e.target.value})
    //so in react these use state update the whole variable at one time not one line at a time
    //so we make a copy of the data using ...formdata(spread-operator) and replace a specific line in it by using the e or event which show cases which key is presed and for which target like title or description
    //otherwise if we update one line at a time the other data will be replaced with blank as react updates the entire thing and as no instruction for other data they become blank loosing the data   
    }
    const handleSubmit=async (e)=>{
        e.preventDefault();//prevents page from refreshing whenever we submit
        setStatus('Submitting....');
    
    try{
        const response=await fetch('https://gamified-platform-1.onrender.com/api/challenges',{
         method:'POST',
         headers:{'Content-Type':'application/json'},
         body:JSON.stringify(formData)   
        })
        if(response.ok){
            setStatus('Challenge created successfully!')
            setFormData({title:'',description:'',points:10})
        }
        else{
            setStatus('Failed to create challenge')
        }
    }
    catch(error){
        console.error(error);
        setStatus('Error connecting to server!')
    }
};
return (
        <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
            <h2>Create a New Challenge</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                    type="text" 
                    name="title" 
                    placeholder="Challenge Title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                    style={{ padding: '10px' }}
                />
                
                <textarea 
                    name="description" 
                    placeholder="Challenge Description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    required 
                    style={{ padding: '10px', minHeight: '100px' }}
                />
                
                <label>
                    Points:
                    <input 
                        type="number" 
                        name="points" 
                        value={formData.points} 
                        onChange={handleChange} 
                        style={{ marginLeft: '10px', padding: '5px' }}
                    />
                </label>

                <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Create Challenge
                </button>
            </form>

            {status && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{status}</p>}
        </div>
    );
}

export default CreateChallenge;
