import React from 'react'
import { Link } from 'react-router-dom'
import { FaUser } from "react-icons/fa";

const IsLogin = () => {
  return (
    
    <div className='h-full flex justify-center '>

        
        <div className='flex flex-col items-center p-5  h-screen isLogin w-80 '>
        <div className='mt-5'>
            <img src="/logo1.png" alt="" className='h-7' />
        </div>

        <div className='my-5'>
            <p className='text-5xl font-normal'>Connect friends <span className='font-bold'> easily & quickly</span> </p>
             <p className='text-[16px] text-gray-300 my-2'>Our chat app is the perfect way to stay connected with friends and family.</p>


        </div>

        <div className='flex justify-between gap-5 my-4'>
            <div className='border-2  rounded-full p-3'><FaUser /></div>
            <div className='border-2  rounded-full p-3'><FaUser /></div>
            <div className='border-2  rounded-full p-3'><FaUser /></div>
        </div>

        <div className='h-[1px] rounded bg-gray-400 w-full relative flex justify-center my-3 '>
            <span className='h-10 w-10 rounded-full bg-[#311548] flex justify-center items-center -mt-5 shadow-white  '>OR</span>
        </div>
        

        
         
            <Link to="/signup" className='bg-white text-center  py-2 rounded-xl text-black w-full my-10'>Signup within mail</Link>

            <div className='flex justify-center gap-2'>
                Existing account ? <Link to="/login" className='transition-all duration-100  hover:underline'>Log in</Link>
            </div>
        
    
    </div>

    </div>
  )
}

export default IsLogin