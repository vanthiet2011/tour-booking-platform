"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Star,
  Filter,
  Plane,
  User,
  Bell,
  Settings,
} from "lucide-react";

const suggestedTours = [
  {
    id: 1,
    title: "Santorini Sunset Experience",
    location: "Santorini, Greece",
    duration: "5 days",
    price: "$1,299",
    rating: 4.9,
    reviews: 234,
    image: "/santorini-sunset-beautiful-white-buildings-blue-do.jpg",
    category: "Romantic",
    highlights: ["Sunset viewing", "Wine tasting", "Traditional villages"],
  },
  {
    id: 2,
    title: "Tokyo Cultural Discovery",
    location: "Tokyo, Japan",
    duration: "7 days",
    price: "$1,899",
    rating: 4.8,
    reviews: 189,
    image: "/tokyo-cherry-blossoms-temple-traditional-architect.jpg",
    category: "Cultural",
    highlights: ["Temple visits", "Sushi making", "Cherry blossoms"],
  },
  {
    id: 3,
    title: "Patagonia Adventure Trek",
    location: "Patagonia, Chile",
    duration: "10 days",
    price: "$2,499",
    rating: 4.7,
    reviews: 156,
    image: "/patagonia-mountains-glaciers-hiking-adventure.jpg",
    category: "Adventure",
    highlights: ["Glacier hiking", "Wildlife viewing", "Mountain climbing"],
  },
  {
    id: 4,
    title: "Bali Wellness Retreat",
    location: "Ubud, Bali",
    duration: "6 days",
    price: "$999",
    rating: 4.9,
    reviews: 298,
    image: "/bali-rice-terraces-yoga-retreat-tropical-paradise.jpg",
    category: "Wellness",
    highlights: ["Yoga sessions", "Spa treatments", "Rice terrace walks"],
  },
  {
    id: 5,
    title: "Northern Lights Safari",
    location: "Tromsø, Norway",
    duration: "4 days",
    price: "$1,599",
    rating: 4.6,
    reviews: 167,
    image: "/northern-lights-aurora-borealis-norway-winter-land.jpg",
    category: "Nature",
    highlights: ["Aurora viewing", "Husky sledding", "Ice hotel stay"],
  },
  {
    id: 6,
    title: "Moroccan Desert Expedition",
    location: "Sahara, Morocco",
    duration: "8 days",
    price: "$1,799",
    rating: 4.8,
    reviews: 203,
    image: "/morocco-sahara-desert-camels-sand-dunes-sunset.jpg",
    category: "Adventure",
    highlights: ["Camel trekking", "Desert camping", "Berber culture"],
  },
];

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Adventure",
    "Cultural",
    "Romantic",
    "Wellness",
    "Nature",
  ];

  const filteredTours = suggestedTours.filter((tour) => {
    const matchesSearch =
      tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || tour.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plane className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-semibold text-foreground">
                WanderWise
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, Alex
          </h2>
          <p className="text-muted-foreground">
            Discover your next adventure with our curated travel experiences
          </p>
        </div>

        {/* Search Engine */}
        <Card className="mb-8 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl text-card-foreground">
              Find Your Perfect Tour
            </CardTitle>
            <CardDescription>
              Search through thousands of curated travel experiences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search destinations, tours, or activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={
                      selectedCategory === category
                        ? "bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tour Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold text-foreground">
              {searchQuery || selectedCategory !== "All"
                ? "Search Results"
                : "Suggested Tours"}
            </h3>
            <p className="text-muted-foreground">
              {filteredTours.length} tours found
            </p>
          </div>
        </div>

        {/* Tours Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => (
            <Card
              key={tour.id}
              className="group hover:shadow-lg transition-all duration-300 bg-card border-border overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <img
                  src={tour.image || "/placeholder.svg"}
                  alt={tour.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground">
                  {tour.category}
                </Badge>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-card-foreground group-hover:text-primary transition-colors">
                      {tour.title}
                    </CardTitle>
                    <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="text-sm">{tour.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-card-foreground">
                        {tour.rating}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({tour.reviews} reviews)
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>Small group</span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {tour.highlights.map((highlight, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-secondary text-secondary-foreground"
                      >
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-card-foreground">
                      {tour.price}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      per person
                    </span>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredTours.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No tours found matching your criteria</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
