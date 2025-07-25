import React from 'react'

const Profile = () => {
  return (
    <div>
        
        <div className='text-black bg-[#24786d] flex justify-center items-center flex-col gap-10 chat-height '>
            <div>
                      <img
            src="/image.png"
            alt="avatar"
            className="rounded-full w-40 h-40"
            onError={(e) => {
                e.target.src ="/image.png";
              }}

          />
                  </div>

                  <div className='flex flex-col gap-3 items-center'>
                    <p className='text-xl font-medium'>Name: User Name</p>
                    <p className='text-sm font-normal'>Email: ashar@gmail.com</p>
                    <p></p>
                  </div>
        </div>

    </div>
  )
}

export default Profile