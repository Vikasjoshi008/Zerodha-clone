import React from "react";

function Hero() {
  return (
    <div className="conatiner supportHero">
      <div
        className="d-flex justify-content-between p-5"
        style={{ margin: "0 10rem" }}
      >
        <h4 className="">Support Portal</h4>
        <a href="/" className="text-light">Track Tickets</a>
      </div>
      <div className="row px-5 m-3">
        <div className="col-5 px-5" style={{marginLeft: "6rem"}}>
          <h1 className="fs-4 mb-3">Search for an answer or browse help topics to create a ticket</h1>
          <input
            type="search"
            placeholder="Eg: how do I activate F&O, Why is my order getting rejected..."
            className="form-control p-3 rounded-3"
          /><br/>
          <a href="/" className="text-light mx-2">Track Account Opening</a>
          <a href="/" className="text-light mx-2">Track segment activation</a>
          <a href="/" className="text-light mx-2">Intraday marginskite user manual</a>
        </div>
        <div className="col-4" style={{marginLeft: "10rem"}}>
          <h1 className="fs-3 mx-3">Featured</h1>
          <ol>
            <li className="mb-3">
                <a href="/" className="text-light">Current Takeovers and Delisting- January 2024</a>
            </li>
            <li>
                <a href="/" className="text-light">Latest intraday leverages- MIS & CO</a>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Hero;
