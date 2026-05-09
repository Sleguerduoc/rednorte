function ListHeader({ count, label }) {
  return (
    <div className="list-header">
      <span>{label}</span>
      <strong>{count}</strong>
    </div>
  );
}

export default ListHeader;
