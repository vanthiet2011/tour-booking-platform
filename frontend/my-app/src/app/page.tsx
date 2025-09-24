import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plane, MapPin, Calendar, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">WanderWise</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-foreground hover:text-primary"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">
            {"Your Journey Begins Here"}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Discover amazing destinations, book unforgettable experiences, and
            create memories that last a lifetime with WanderWise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              >
                Start Your Adventure
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="px-8 bg-transparent"
              >
                Sign In to Continue
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Explore Destinations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Discover hidden gems and popular destinations around the world
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Easy Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Book flights, hotels, and activities with just a few clicks
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Travel Together</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Plan group trips and share experiences with friends and family
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Plane className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Best Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get exclusive offers and save money on your travel bookings
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-card rounded-2xl p-12 border">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Ready to Start Your Journey?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of travelers who trust WanderWise for their
            adventures
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8"
            >
              Create Your Account
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
