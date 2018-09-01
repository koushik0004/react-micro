import React from 'react';

const ProductCard = cardData => (
  <div className="column">
    <div className="card">
      <div className="card-image">
        <figure className="image is-4by3">
          <img src={cardData.image} alt="Placeholder " />
        </figure>
      </div>
      <div className="card-content">
        <p className="title is-4">{cardData.title}</p>
        <p className="">{cardData.description}</p>
        <p className="title is-6">${cardData.price}</p>
        <a className="button is-primary is-outlined" href="products">
          Buy Now
        </a>
      </div>
    </div>
  </div>
);

export default ProductCard;
