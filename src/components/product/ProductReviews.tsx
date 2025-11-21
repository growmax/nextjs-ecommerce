import React from 'react';

export default function ProductReviews() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Customer Reviews</h2>
      <div className="flex items-center gap-2 text-yellow-500">
        <span className="text-xl">★★★★☆</span>
        <span>(120 reviews)</span>
      </div>
      <div className="space-y-4">
        {/* Example Review 1 */}
        <div className="border-b pb-4">
          <p className="font-semibold">Great product!</p>
          <p className="text-gray-600 text-sm">John Doe - October 26, 2023</p>
          <p>I absolutely love these safety glasses. They are comfortable and provide excellent protection. Highly recommended!</p>
        </div>
        {/* Example Review 2 */}
        <div className="border-b pb-4">
          <p className="font-semibold">Good value for money</p>
          <p className="text-gray-600 text-sm">Jane Smith - October 20, 2023</p>
          <p>The glasses are good, especially for the price. The gasket provides a snug fit. I just wish they came in more colors.</p>
        </div>
        {/* Example Review 3 */}
        <div className="border-b pb-4">
          <p className="font-semibold">Works as expected</p>
          <p className="text-gray-600 text-sm">Peter Jones - October 15, 2023</p>
          <p>No complaints. They do what they are supposed to do. Clear vision and comfortable to wear for long periods.</p>
        </div>
        {/* Additional reviews for scrolling */}
        <div className="border-b pb-4">
          <p className="font-semibold">Very durable</p>
          <p className="text-gray-600 text-sm">Alice Brown - October 10, 2023</p>
          <p>Dropped them a few times and they're still in perfect condition. Very impressed with the durability.</p>
        </div>
        <div className="border-b pb-4">
          <p className="font-semibold">Comfortable fit</p>
          <p className="text-gray-600 text-sm">Bob White - October 5, 2023</p>
          <p>These are the most comfortable safety glasses I've ever worn. The gasket really helps.</p>
        </div>
        <div className="border-b pb-4">
          <p className="font-semibold">Clear optics</p>
          <p className="text-gray-600 text-sm">Charlie Green - September 28, 2023</p>
          <p>The lenses are very clear and don't distort vision. Great for detailed work.</p>
        </div>
        <div className="border-b pb-4">
          <p className="font-semibold">Stylish for safety glasses</p>
          <p className="text-gray-600 text-sm">Diana Blue - September 20, 2023</p>
          <p>They actually look pretty decent for safety glasses. I don't feel goofy wearing them.</p>
        </div>
        <div className="border-b pb-4">
          <p className="font-semibold">Excellent protection</p>
          <p className="text-gray-600 text-sm">Eve Black - September 12, 2023</p>
          <p>Feel very secure and protected when wearing these. A must-have for any workshop.</p>
        </div>
      </div>
    </div>
  );
}
