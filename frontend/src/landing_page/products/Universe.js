import React from "react";

function Universe() {
  return (
    <div className="container mt-5">
      <div className="row text-center">
        <p className="fs-5 text-muted mb-5">
          Want to know more about our technology stack? Check out the
 <a href="/">Zerodha.tech</a> blog.
        </p>
        <h3 className="mt-5">The Zerodha Universe</h3>
        <p className="mt-4">
          Extend your trading and investment experience even further with our
          partner platforms
        </p>
      </div>
      <div className="row text-center mt-5">
        <div className="col-4 p-3">
            <img src="media/images/zerodhaFundhouse.png" alt="zerodha fundhouse" style={{width: "40%"}}/>
            <p className="text-small text-muted mt-3">Our asset management venture that is creating simple and transparent index funds to help you save for your goals.</p>
        </div>
        <div className="col-4 p-3">
            <img src="media/images/sensibullLogo.svg" alt="SENSIBULL" style={{width: "40%"}}/>
            <p className="text-small text-muted mt-3">Options trading platform that lets youcreate strategies, analyze positions, and examine data points like open interest, FII/DII, and more</p>
        </div>
        <div className="col-4">
            <img src="media/images/tijori.svg" alt="Tijori" style={{width: "40%"}}/>
            <p className="text-small text-muted">
                Investment research platform that offers detailed insights on stocks,sectors, supply chains, and more.
            </p>
        </div>
        <div className="row text-center mt-4">
        <div className="col-4">
            <img src="media/images/streakLogo.png" alt="streakLogo" style={{width: "40%"}}/>
            <p className="text-small text-muted mt-2">
                Systematic trading platform that allows you to create and backtest strategies without coding.
            </p>
        </div>
        <div className="col-4 p-3">
            <img src="media/images/smallcaseLogo.png" alt="Tijori" style={{width: "40%"}}/>
            <p className="text-small text-muted mt-2">
                Thematic investing platform that helps you invest in diversified baskets of stocks on ETFs.
            </p>
        </div>
        <div className="col-4">
            <img src="media/images/dittoLogo.png" alt="ditto logo" style={{width: "40%"}}/>
            <p className="text-small text-muted mt-2">
                Personalized advice on life and health insurance. No spam and no mis-selling.
            </p>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Universe;
