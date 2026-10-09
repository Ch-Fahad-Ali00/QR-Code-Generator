import axios from 'axios'
import React, { useState } from 'react'
import {EyeOff} from "lucide-react"
import { useNavigate } from "react-router-dom";


const LoginForm = () => {
    const navigate = useNavigate();
    
    const[formFields,setFormFields] = useState({
        name: "",
        email: "",
        contact: "",
        password: ""
    })

    const {name,email,contact,password} = formFields
    const handleChange = (e) => {
        setFormFields({
            ...formFields,
            [e.target.name] : e.target.value
        })
    }

    const handleClick = async (e) => {
    e.preventDefault();

    try {

        const response = await axios.post(
            "http://localhost:5000/add-data",
            {
                name,
                email,
                contact,
                password
            }
        );

        console.log(response.data);
        
        // Login successful
        navigate("/QrCodeGenerator");

    } catch (error) {

        console.log(error);

    }
};

  return (
    <form action="" className="lg:w-[50%] md:w-[70%] sm-[90%] border-1 border-gray-200 shadow-lg mx-auto rounded-md mt-20 p-5"> 
    <div className='mx-auto text-center text-3xl my-4'>
        <h1 className='text-blue-400 font-medium  '> Login</h1>
    </div>

    <div>

        <label className='' htmlFor="">Name:</label>
        <input name='name' value={name} onChange={handleChange} type="text" placeholder='Enter your name ...' className="w-full outline-blue-300  my-3 rounded-md p-2 border border-gray-200" />
    </div>

    <div>

        <label className='' htmlFor="">Email:</label>
        <input name='email' value={email} onChange={handleChange} type="email" placeholder='Enter your email ...' className="w-full outline-blue-300  my-3 rounded-md p-2 border border-gray-200" />
    </div>

    <div>

        <label className='' htmlFor="">Phone:</label>
        <input name='contact' value={contact} onChange={handleChange} type="number" placeholder='+923XXXXXXXXX' className="w-full outline-blue-300 my-3 rounded-md p-2 border border-gray-200" />
        
    </div>
    <div className='relative'>

        <label className='' htmlFor="">Password:</label>
        <input name='password' value={password} onChange={handleChange} type="password" placeholder='Enter password ...' className="w-full outline-blue-300 my-3 rounded-md p-2 border border-gray-200" />
        <button className="bg-transparent cursor-pointer text-gray-400 p-3 absolute right-1  translate-y-[10px]"><EyeOff/></button>
    </div>


        <button onClick={handleClick} className="bg-blue-500 py-2 px-4 rounded-md active:scale-98 hover:bg-blue-700 text-white font-semibold mx-auto block cursor-pointer mt-2  ">Login</button>
    </form>
  )
}

export default LoginForm