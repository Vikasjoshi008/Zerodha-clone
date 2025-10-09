import React from 'react';

function RightSection({
    imageURL,
    productName,
    productDescription,
    learnMore
}) {
    return ( 
    <div className="container">
      <div className="row">
        <div className="col-4 p-5 m-5">
          <h2 className="text-muted mb-4">{productName}</h2>
          <p style={{ lineHeight: "1.8" }}>{productDescription}</p>
            <a
              href={learnMore}
              style={{ textDecoration: "none" }}>
              { learnMore } <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
            </a>
        </div>
        <div className="col-7">
          <img src={imageURL} alt={productName} />
        </div>
      </div>
    </div>
     );
}

export default RightSection;