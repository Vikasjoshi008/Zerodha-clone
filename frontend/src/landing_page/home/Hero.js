import React from 'react';

function Hero() {
    return ( 
        <div className='container p-5 mb-5'>
            <div className='row text-center'>
                <img src='media/images/homeHero.png' alt='Hero' className='mb-5'/>
                <h2 className='mt-5 fw-medium'>Invest in everything</h2>
                <h4 className='mb-4 text-muted'>Online platform to invest in stocks, derivatives, mutual funds and more</h4>
                <button className='p-2 btn btn-primary fs-5 mb-5' style={{width: "15%", margin: "0 auto"}}>Signup Now</button>
            </div>
        </div>
     );
}

export default Hero;