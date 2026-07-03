const CategoryBox = ({ categories, selectedCategory, onSelect }) => {
  return (
    <section className="booking-section">
      <h2>Select Category</h2>

      <div className="selection-grid">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category)}
            className={`selection-card compact ${
              selectedCategory?.id === category.id ? "is-active category-active" : ""
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryBox;
