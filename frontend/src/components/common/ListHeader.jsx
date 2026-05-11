import PropTypes from "prop-types";

function ListHeader({ count, label }) {
  return (
    <div className="rn-list-header">
      <span className="rn-list-header__label">{label}</span>
      <span className="rn-list-header__count">{count}</span>
    </div>
  );
}

ListHeader.propTypes = {
  count: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};

export default ListHeader;
