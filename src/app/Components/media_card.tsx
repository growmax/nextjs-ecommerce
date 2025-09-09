
import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export function CarouselDemo() {
  // ✅ Dummy references (5 images + 5 videos)
  const mediaItems = [
    // Images
    { type: "image", src: "https://picsum.photos/id/1018/400/300" },
    { type: "image", src: "https://picsum.photos/id/1025/400/300" },
    { type: "image", src: "https://picsum.photos/id/1035/400/300" },
    { type: "image", src: "https://picsum.photos/id/1041/400/300" },
    { type: "image", src: "https://picsum.photos/id/1050/400/300" },

    // Videos
    { type: "video", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { type: "video", src: "https://www.w3schools.com/html/movie.mp4" },
    { type: "video", src: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4" },
    { type: "video", src: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" },
    { type: "video", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
  ]

  return (
    <Card className="w-4/6 mx-auto">
      <Carousel className="w-full max-w-lg mx-auto">
        <CarouselContent>
          {mediaItems.map((item, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-4">
                    {item.type === "image" ? (
                      <img
                        src={item.src}
                        alt={`media-${index}`}
                        className="rounded-lg object-cover w-full h-full"
                      />
                    ) : (
                      <video
                        src={item.src}
                        controls
                        className="rounded-lg w-full h-full"
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </Card>
  )
}
