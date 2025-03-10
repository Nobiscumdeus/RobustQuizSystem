import { useState } from "react";

export const SimpleForm=()=>{
    const[name,setName]=useState("")

    const handleSubmit=(e)=>{
        e.preventDefault()
        alert(`Submitted ${name}`)
    }
    return(
        <>
        <div>

                <div className="mt-4 rounded-md p-4 bg-gray-300">
                    <h1 className="text-xl font-bold uppercase mb-3"> Simple Form 1 </h1>
                    <form onSubmit={handleSubmit} >
                        <label>
                            <input type="text"
                            value={name}
                            onChange={(e)=>setName(e.target.value)}
                            className="ring rounded-md p-4 w-full"
                            />
                        </label>
                        <button className="p-4 rounded-md bg-blue-400 mt-2 hover:cursor-pointer hover:bg-blue-200">
                            Submit 
                        </button>
                    </form>
                
                 </div>


        </div>
        </>

        

    

    )
}



export const MultiInputForm=()=>{
    const [formData,setFormData]=useState({name:'',email:''})

    const handleChange=(e)=>{
        const {name,value}=e.target
        setFormData({...formData,[name]:value})

    }

    const handleSubmit=(e)=>{
        e.preventDefault()
        alert(`Submitted: ${JSON.stringify(formData)}`)

    }

    


    return(
        <div className="container mx-auto">

        
       
            <h1> MultiInputForm </h1>
        
        <form onSubmit={handleSubmit}>
          
        <label>
                Name
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                className="p-2 rounded-md w-full "

                />
            </label>
            <label>
                Email 
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="p-2 rounded-md ring w-full "

                />
            </label>
            <button>
                Submit Details 
            </button>
        </form>
        </div>

    )
}

export const ValidationForm=()=>{
    const [formData,setFormData]=useState({name:'',email:''})
    const [errors,setErrors]=useState({name:'',email:''})

    const handleChange=(e)=>{
        const {name,value}=e.target
        setFormData({...formData,[name]:value})

    }

    const validate=()=>{
        const newErrors={}
        if(!formData.name) newErrors.name='Name is required'
        if(!formData.email) newErrors.email='Email is required'
        setErrors(newErrors)
        return Object.keys(newErrors).length===0

    }

    const handleSubmit=(e)=>{
        e.preventDefault()
        if(validate()){
            alert(`Submitted :  ${JSON.stringify(formData)}`)
        }

    }
    return(
        <form onSubmit={handleSubmit} className="flex flex-col">
            <label>
                Name: 
                <input type="text" name="name"value={formData.name} onChange={handleChange} /> <br/>
                {errors.name && <span className="error"> {errors.name}</span>}
            </label>
            <label>
                Email
                <input type="email" name="email" value={formData.email} onChange={handleChange} /> <br/>
            </label>
            <button type="submit">
                Submit 
            </button>
        </form>
    )
}

export const DynamicForm=()=>{
    const [fields,setFields]=useState([{value:''}])


    const handleAdd=()=>{
        setFields([
            ...fields,{value:''},
        ])
    }
    
    const handleRemove=(i)=>{
        const newFields=[...fields]
        newFields.splice(i,1)
        setFields(newFields)

    }
    const handleChange=(i,e)=>{
        const newFields=[...fields]
        newFields[i].value=e.target.value
        setFields(newFields)
    }

    const handleSubmit=(e)=>{
        e.preventDefault()
        alert(`Submitted : ${JSON.stringify(fields)}`)

    }

    return(
        <form onSubmit={handleSubmit}>
            {
                fields.map((field,i)=>(
                    <div key={i}>
                        <input type="text" value={field.value} onChange={(e)=>handleChange(i,e)} />
                        <button type="button" onClick={()=>handleRemove(i)}>Remove </button>

                    </div>
                ))
            }
                        <button type="button" onClick={handleAdd}> Add Field </button>
                        <button type="submit"> Submit </button>
        </form>

    )
}