"use client";
import CategoryNavigation from "./CategoryNavigation";

const CategoryPage = () => {
  const categories = [
    {
      src: "https://www.acmetools.com/on/demandware.static/-/Library-Sites-RefArchSharedLibrary/default/dw08cd5657/images/CategoryPages/Tools/machine-tools.jpg",
      alt: "Machine Tools",
      title: "Machine Tools",
    },
    {
      src: "https://www.acmetools.com/on/demandware.static/-/Library-Sites-RefArchSharedLibrary/default/dw316851dc/images/CategoryPages/Tools/power-tools.jpg",
      alt: "Power Tools",
      title: "Power Tools",
    },
    {
      // src: "https://www.acmetools.com/on/demandware.static/-/Library-Sites-RefArchSharedLibrary/default/dw41f3b1e2/images/CategoryPages/Tools/hand-tools.jpg",
      // alt: "Hand Tools",
      title: "Hand Tools",
    },
  ];

  return (
    <>
      <div className="px-4 py-8">
        <div className="flex flex-row items-start gap-6 overflow-x-auto flex-nowrap justify-start">
          {categories
            // ensure src is defined for props that require string
            .filter(c => typeof c.src === "string" && c.src.length > 0)
            .map((category, index) => (
              <div
                key={category.src ?? category.title}
                className="flex-shrink-0 w-[200px]"
              >
                <CategoryNavigation
                  index={index}
                  img={category.src as string}
                  alt={category.alt ?? category.title}
                  title={category.title}
                  imageWidth={200}
                  imageHeight={200}
                />
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
