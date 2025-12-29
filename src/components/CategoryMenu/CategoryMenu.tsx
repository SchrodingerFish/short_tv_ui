import React from 'react';
import { Category } from '../../types';
import './CategoryMenu.css';

interface CategoryMenuProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (id: string) => void;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <nav className="category-menu">
      <div className="container">
        <div className="category-list">
          {categories.map((cat) => (
            <button
              key={cat.type_id}
              className={`category-item ${activeCategory === cat.type_id ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat.type_id)}
            >
              {cat.type_name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryMenu;
