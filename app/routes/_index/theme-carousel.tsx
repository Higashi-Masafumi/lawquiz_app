import { Scale } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { Link } from "@remix-run/react";

interface CarouselCard {
  title: string;
  description: string;
  url: string;
}

interface CarouselSliderProps {
  title: string;
  description: string;
  rootUrl: string;
  cards: CarouselCard[];
  fallbackText?: string;
  className?: string;
}

export function CarouselSlider({
  title,
  description,
  rootUrl,
  cards,
  fallbackText = "記事がありません",
  className,
}: CarouselSliderProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center gap-2">
          <Scale className="h-6 w-6" />
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Carousel or No Results */}
      {cards.length > 0 ? (
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {cards.map((card) => (
              <CarouselItem
                key={card.url}
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <Link to={card.url}>
                  <Card className="h-full overflow-hidden group">
                    <CardContent className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 h-full flex flex-col">
                      <h3 className="font-bold mb-3 text-lg line-clamp-2">
                        {card.title}
                      </h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: card.description,
                        }}
                        className="text-sm text-gray-600 mb-4 flex-1 line-clamp-4"
                      />
                      <div className="text-sm text-emerald-600 group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                        もっとみる
                        <span className="inline-block transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      ) : (
        <Card className="h-[300px] bg-gray-50">
          <CardContent className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">{fallbackText}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View All Link */}
      <div className="text-center">
        <Link
          to={rootUrl}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          一覧をみる
        </Link>
      </div>
    </div>
  );
}
