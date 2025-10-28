import { Card, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import React from "react";

interface CategoryNavigationProps {
  index: number;
  img: string;
  alt?: string;
  title: string;
  imageWidth?: number;
  imageHeight?: number;
  className?: string;
}

const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  index,
  img,
  alt,
  title,
  imageWidth = 150,
  imageHeight = 150,
  className = "",
}) => {
  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      <div key={title} className="block">
        <Card className="group transition-all duration-200 border border-transparent hover:border-sky-500 hover:shadow-lg rounded-md overflow-hidden h-full">
          {img ? (
            <>
              <div className="aspect-square relative overflow-hidden flex items-center justify-center bg-white">
                <Image
                  src={img}
                  alt={alt || title || `Category Image ${index}`}
                  width={imageWidth}
                  height={imageHeight}
                  className="object-contain"
                />
              </div>
              <CardFooter className="flex justify-center py-4">
                <h3 className="text-lg font-semibold transition-all group-hover:text-sky-600 text-center">
                  {title}
                </h3>
              </CardFooter>
            </>
          ) : (
            // Text-only tile: center the title, increase padding for visual balance
            <div className="flex items-center justify-center py-10 px-4">
              <h3 className="text-lg font-semibold text-center text-slate-800 group-hover:text-sky-600">
                {title}
              </h3>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CategoryNavigation;
