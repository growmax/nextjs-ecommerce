"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useState } from "react";
import CategoryCard from "./components/CategoryCard";
import PaginationControl from "./components/PaginationControl";
import ProductTile from "./components/ProductCard";
import { bannerCategories, categories, sampleProducts } from "./mockData";

const CategoryPageClient: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const handleAddToCart = (id: string) => {
    alert(`Added product ${id} to cart!`);
  };

  const handleSortChange = (sortOption: string) => {
    // Add sorting logic here
    void sortOption;
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page
  };

  // Pagination calculations
  const totalProducts = sampleProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sampleProducts.slice(startIndex, endIndex);

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">
        Categories
      </h2>
      <div className="flex flex-row items-center gap-6 overflow-x-auto flex-nowrap justify-between pb-2 pr-[10%]">
        <div className="w-7/8 flex-shrink-0 flex flex-row gap-4 items-center">
          {bannerCategories.map((category, index) => (
            <CategoryCard
              key={category.src ?? index}
              index={index}
              img={category.src || "/banner1.jpg"}
              alt={category.alt || "Category Image"}
              imageWidth={200}
              imageHeight={100}
              cardWidth={180}
              cardHeight={90}
            />
          ))}
        </div>
        <div className="w-1/8 flex items-center gap-2 justify-end">
          <span className="text-sm font-medium text-gray-700">Sort By:</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="px-4 py-2 bg-gray-200 rounded-md text-sm font-medium">
              Best Match
            </DropdownMenuTrigger>
            <DropdownMenuContent className="absolute right-0">
              <DropdownMenuItem
                onClick={() => handleSortChange("Price: Low to High")}
              >
                Price: Low to High
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("Price: High to Low")}
              >
                Price: High to Low
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("Rating: High to Low")}
              >
                Rating: High to Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <section className="px-6 py-10">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">
          Categories
        </h2>

        <div className="flex flex-row items-start gap-6 overflow-x-auto flex-nowrap justify-start pb-2">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.src ?? category.title ?? index}
              index={index}
              img={category.src}
              alt={category.alt}
              title={category.title || ""}
              imageWidth={180}
              imageHeight={200}
              cardWidth={180}
              cardHeight={180}
            />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {currentProducts.map(product => (
          <ProductTile
            key={product.id}
            {...product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </section>

      {/* Pagination Control */}
      <PaginationControl
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </>
  );
};

export default CategoryPageClient;
