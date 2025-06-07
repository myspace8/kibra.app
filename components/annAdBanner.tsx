"use client"

import { ArrowBigRight, ExternalLink, MessageCircle, Code, Laptop, Users, Award, Star, MapPin, Phone } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"

export default function Banner() {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [hasAppeared, setHasAppeared] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-dismiss timer
  const AUTO_DISMISS_TIME = 100

  // Ticker messages
  const tickerMessages = [
    "Get certified in web and app development",
    "Computer programming training for every student!",
    "Build real-world projects",
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      // handleDismiss()
    }, AUTO_DISMISS_TIME)

    const appearTimer = setTimeout(() => {
      setHasAppeared(true)
    }, 100)

    return () => {
      clearTimeout(timer)
      clearTimeout(appearTimer)
    }
  }, [])

  const handleDismiss = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsVisible(false)
    }, 300)
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      "Hi! I'm interested in learning more about Bitlabs computer programming training. Can you provide me with more details about your courses and enrollment process?",
    )
    const whatsappUrl = `https://wa.me/+233592771234?text=${message}`
    window.open(whatsappUrl, "_blank")
  }

  const handlePhoneCall = () => {
    window.location.href = "tel:+233592771234"
  }

  const carouselImages = [
    {
      src: "/bitlabs-photo-4.jpg",
      alt: "Coding workshop session",
      title: "Hands-on Coding Workshops",
    },
    {
      src: "/bitlabs-photo-1.jpg",
      alt: "Students working on projects",
      title: "Real-world Project Development",
    },
    {
      src: "/bitlabs-photo-3.jpg",
      alt: "Modern computer lab",
      title: "State-of-the-Art Facilities",
    },
    {
      src: "/bitlabs-photo-2.jpg",
      alt: "Students learning programming",
      title: "Certification after Completion",
    },
  ]

  const testimonials = [
    {
      name: "Aretha",
      age: 16,
      school: "Wesley Girls' High School, 2025",
      text: "I aspire to study Computer Engineering but before that I want to know the practical side of building programs with computers. I'll be joining Bitlab during school vacation.",
      rating: 5,
    },
    {
      name: "Anon",
      age: "!42",
      school: "Somewhere in Hogwart",
      text: "Computers are magic—Bitlabs will prove that to you.",
      rating: 5,
    },
    // {
    //   name: "Ama",
    //   age: 17,
    //   school: "KNUST SHS, 2024",
    //   text: "Bitlabs has the best instructors and a great learning environment. I feel confident about my future in tech!",
    //   rating: 5,
    // },
  ]

  if (!isVisible) {
    return null
  }

  return (
    <div className="w-full max-w-md mx-auto md:hidden">
      <Drawer>
        <DrawerTrigger asChild>
          <div
            className={`bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 bg-[length:200%_200%] animate-gradient-x rounded-full mx-1 text-white pr-2 pl-[0.15rem] py-[0.15rem] relative transition-all duration-300 ease-in-out overflow-hidden backdrop-blur-sm cursor-pointer hover:shadow-lg active:scale-95 ${isAnimating ? "transform translate-x-full opacity-0" : "transform translate-x-0 opacity-100"
              } ${hasAppeared ? "scale-100" : "scale-95"}`}
            onMouseEnter={() => {
              setIsHovering(true)
              setIsPaused(true)
            }}
            onMouseLeave={() => {
              setIsHovering(false)
              setIsPaused(false)
            }}
            style={{
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]"></div>
            <div className="flex items-center gap-2 relative z-10">
              {/* Human Image */}
              <div className="flex-shrink-0 relative group">
                <div
                  className={`absolute inset-0 rounded-full blur-sm transform scale-110 group-hover:scale-125 transition-transform duration-500 ${isHovering ? "animate-pulse-slow" : ""
                    }`}
                ></div>
                <img
                  src="/bitlabs-photo-1.jpg"
                  alt="Instructor"
                  className="w-10 h-10 rounded-full border-2 border-white/90 object-cover relative z-10 shadow-lg transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105"
                />
              </div>
              <p className="text-base">Learn to program</p>
              {/* Ticker Content */}
              <div
                className={`flex-1 min-w-0 overflow-hidden transition-all duration-500 ${hasAppeared ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                  }`}
                style={{
                  transitionDelay: "150ms",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 overflow-hidden">
                    <div
                      className={`flex whitespace-nowrap ${isPaused ? "animate-none" : "animate-ticker"}`}
                      style={{
                        animationDuration: "20s",
                        animationTimingFunction: "linear",
                        animationIterationCount: "infinite",
                      }}
                    >
                      {/* Multiple sets of ticker messages for seamless loop */}
                      {[...Array(3)].flatMap((_, setIndex) =>
                        tickerMessages.map((message, index) => (
                          <span
                            key={`${setIndex}-${index}`}
                            className="inline-block px-6 text-sm"
                          >
                            {message}
                            <span className="mx-3 text-yellow-300">●</span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <div
                    className={`ml-3 flex-shrink-0 transition-all duration-500 ${hasAppeared ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                      }`}
                    style={{
                      transitionDelay: "350ms",
                    }}
                  >
                    <div className="p-2.5 transition-all duration-300 hover:scale-110 hover:shadow-md relative group">
                      <ArrowBigRight className="w-4 h-4 text-white transform group-hover:-translate-y-0.5 transition-transform duration-300 animate-subtle-float" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DrawerTrigger>

        <DrawerContent className="max-h-[90vh] rounded-4xl">
          <div className="mx-auto w-full max-w-2xl">
            <DrawerHeader className="text-center">
              <DrawerTitle className="text-2xl font-extrabold bg-gradient-to-r from-red-500 to-orange-500 uppercase bg-clip-text text-transparent">
                Bit<span className="bg-red-500 text-white px-[2px] ml-[1px]">labs</span>
              </DrawerTitle>
              <DrawerDescription className="text-sm">
                Center for IT and Innovation
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-4 pb-4 space-y-6 overflow-y-auto max-h-[45vh]">
              {/* Image Carousel */}
              <div className="relative">
                <Carousel className="w-full">
                  <CarouselContent>
                    {carouselImages.map((image, index) => (
                      <CarouselItem key={index}>
                        <Card>
                          <CardContent className="p-0">
                            <div className="relative">
                              <img
                                src={image.src || "/placeholder.svg"}
                                alt={image.alt}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
                                <h3 className="text-white font-semibold text-sm">{image.title}</h3>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              </div>

              {/* About Bitlabs */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">About Bitlabs</h3>
                <p className="text-gray-600 leading-relaxed">
                  Bitlabs is Ghana's premier computer programming training school, dedicated to empowering the next
                  generation of tech innovators. They specialize in providing comprehensive programming education for
                  students in basic and high school who are passionate about computer science and engineering.
                </p>
                <div className="grid grid-cols-2 gap-4 my-6">
                  <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
                    <Code className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium">Web Development</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                    <Laptop className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-medium">App Development</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-pink-50 rounded-lg">
                    <Users className="w-5 h-5 text-pink-500" />
                    <span className="text-sm font-medium">Small Classes</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                    <Award className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium">Certification</span>
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed">
                  Whether you're preparing for computer science studies at university or simply want to learn how to
                  build amazing websites and applications, their expert instructors will guide you through hands-on
                  projects and real-world programming challenges.
                </p>

                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-lg">
                  <h4 className="font-bold mb-2">What You'll Learn:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• HTML, CSS, and JavaScript fundamentals</li>
                    <li>• Modern web frameworks (React, Next.js)</li>
                    <li>• Mobile app development</li>
                    <li>• Database design and management</li>
                    <li>• Problem-solving and logical thinking</li>
                  </ul>
                </div>
              </div>
              {/* Location Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Location</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Santaase
                      <br />
                      Kumasi, Ghana
                      <br />
                      Near the Opoku Ware SHS (OWASS)
                    </p>
                  </div>
                </div>
              </div>

              {/* Testimonials Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">What People Say</h3>
                <div className="space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-1 mb-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm mb-3 italic">"{testimonial.text}"</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                          <p className="text-gray-500 text-xs">
                            Age {testimonial.age} • {testimonial.school}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                variant="link"
                className="w-full"
                size="lg"
                onClick={() => window.open("https://bitlabsgh.com", "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Our Website
              </Button>
            </div>
            <DrawerFooter className="flex flex-col space-y-3 bg-white/30 backdrop-blur-md">
              <div className="flex flex-col space-y-3 backdrop-blur-md bg-white/60">
                <Button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat with us on WhatsApp
                </Button>

                <div className="flex justify-between items-center gap-3">
                  <DrawerClose asChild>
                    <Button variant="ghost" className="w-full">
                      Close
                    </Button>
                  </DrawerClose>
                  <Button variant="outline" onClick={handlePhoneCall} size="lg">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                </div>
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Custom CSS for ticker animation */}
      <style jsx>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
      `}</style>
    </div>
  )
}