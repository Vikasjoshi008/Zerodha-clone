import React from "react";

function LeftSection({
  imageURL,
  productName,
  productDescription,
  tryDemo,
  learnMore,
  googlePlay,
  appStore,
}) {
  return (
    <div className="container">
      <div className="row p-5">
        <div className="col-7 p-3">
          <img src={imageURL} alt={productName} />
        </div>
        <div className="col-5 p-5 mt-5">
          <h2 className="text-muted mb-4">{productName}</h2>
          <p style={{ lineHeight: "1.8" }}>{productDescription}</p>
          <div>
            <a href={tryDemo} style={{ textDecoration: "none" }}>
              TryDemo <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
            </a>
            <a
              href={learnMore}
              style={{ marginLeft: "2rem", textDecoration: "none" }}>
              LearnMore <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
            </a>
          </div>
          <div className="mt-3">
            <a href={googlePlay}>
              <img src="media/images/googlePlayBadge.svg" alt="google play" />
            </a>
            <a href={appStore}>
              <img
                src="media/images/appstoreBadge.svg"
                alt="app store"
                style={{ marginLeft: "2rem" }}
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftSection;
