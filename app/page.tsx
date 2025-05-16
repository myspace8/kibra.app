"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button" // Changed to default import
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowBigRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#E8E8E8] text-gray-900">
      {/* Hero Section */}
            <section
        className="relative py-16 px-6 bg-cover bg-center"
        style={{ backgroundImage: "url('https://framerusercontent.com/images/9vPBMgCjXBSGCT4BaLPY9SWoPE.png?scale-down-to=2048')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div> {/* Dark overlay for readability */}
        <div className="relative max-w-5xl mx-auto text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Kibra_
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base tracking-tighter leading-snug md:text-xl mb-8"
          >
            Education, beyond the limits of traditional schooling!
          </motion.p>
          {/* <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/signup">
              <Button className="bg-white text-teal-600 hover:bg-gray-100 text-lg px-6 py-3 rounded-full">
                Sign up
              </Button>
            </Link>
          </motion.div> */}
        </div>
      </section>

      {/* Learn Section */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="text-3xl tracking-tighter font-semibold mb-4">Learning that actually learns from you</h2>
            <p className="text-gray-500 mb-6 tracking-tighter leading-snug">
                Our system doesn't just deliver generic content—it observes how you answer questions, identifies your strengths and weaknesses, and adjusts the learning materials (like notes) accordingly. <br /> <span className="text-teal-600">In short, it means kibra is smart enough to adapt to you, not the other way around.</span>
            </p>
            <Link href="/learn">
              <Button variant="outline" className="border-teal-500 text-teal-500 hover:bg-teal-50">

                Start Learning
              </Button>
            </Link>
          </div>
          {/* <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:w-1/2"
          >
            <Image
              src="/learn-image-placeholder.jpg"
              alt="Learn with Quizzes"
              width={500}
              height={300}
              className="rounded-lg shadow-md"
            />
          </motion.div> */}
        </div>
      </section>

      {/* Discover Books Section */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="text-3xl tracking-tighter font-semibold mb-4">Your learning journey is unique—your reading list should be too</h2>
            <p className="text-gray-500 mb-6 tracking-tighter leading-snug">
              Our system recommends books that meet you where you are and guide you toward where you’re meant to be. <br /> <span className="text-indigo-500">kibra allows you to read with purpose.</span>
            </p>
            <Link href="/discover">
              <Button variant="outline" className="border-indigo-500 text-indigo-500 hover:bg-indigo-50">
                Discover Now
              </Button>
            </Link>
          </div>
          {/* <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:w-1/2"
          >
            <Image
              src="/discover-books-placeholder.jpg"
              alt="Discover Books"
              width={500}
              height={300}
              className="rounded-lg shadow-md"
            />
          </motion.div> */}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 text-center text-gray-500 text-xs">
        © All rights reserved 2025
      </footer>
    </div>
  )
}