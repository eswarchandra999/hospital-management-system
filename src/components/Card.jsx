function Card({ title, value, icon }) {
  return (
    <div className="card">
      <div className="card-content">
        <div>
          <p className="card-title">{title}</p>
          <h2 className="card-value">{value}</h2>
        </div>

        <div className="card-icon">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default Card;