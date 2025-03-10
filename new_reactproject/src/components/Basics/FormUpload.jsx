import {useState} from 'react'

function FormUpload() {
    const [file,setFile]=useState(null)

    const handleChange=(e)=>{
            setFile(e.target.files[0])
    }
    const handleSubmit=(e)=>{
        e.preventDefault()
        alert(`File submitted ${file.name}`)

    }

  return (
    <form onSubmit={handleSubmit} >
        <label>
            Upload File :
            <input type="file" onChange={handleChange} />

        </label>
        <button type="submit">Upload File </button>

    </form>
  )
}

export default FormUpload
