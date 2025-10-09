import React from 'react';
import { Link } from 'react-router-dom';


function NotFound() {
    return (
        <div className='container text-center p-5'>
            <h1 className='fs-2'>404 Not Found</h1>
            <p className='text-muted mt-3 mb-4'>Sorry, the page you are looking for does not exist.</p>

            <Link to='/'><button className='p-2 btn btn-primary fs-5' style={{width: "20%", margin: "0 auto"}}>Go home</button></Link>
        </div>
     );
}

export default NotFound;