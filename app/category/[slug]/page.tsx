import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, Search, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserNav } from "@/components/user-nav"
import { BookCard } from "@/components/book-card"
import { CategoryList } from "@/components/category-list"

type Props = {
  params: { slug: string }
}

// Category data
const categories = {
  business: {
    title: "Business",
    description: "Discover the best business books",
    featuredBooks: [
      {
        id: 1,
        title: "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
        author: "James Clear",
        description: "No matter your goals, Atomic Habits offers a proven framework for improving every day.",
        downloads: 1000,
        image: "/placeholder.svg?height=300&width=200",
      },
      {
        id: 2,
        title: "The Psychology of Money: Timeless lessons on wealth, greed, and happiness",
        author: "Morgan Housel",
        description: "Doing well with money isn't necessarily about what you know. It's about how you behave.",
        downloads: 703,
        image: "/placeholder.svg?height=300&width=200",
      },
      {
        id: 3,
        title: "Rich Dad Poor Dad",
        author: "Robert T. Kiyosaki",
        description: "What the rich teach their kids about money that the poor and middle class do not!",
        downloads: 1100,
        image: "/placeholder.svg?height=300&width=200",
      },
    ],
    collections: [
      {
        title: "Best Selling Business Books",
        books: [
          {
            id: 4,
            title: "The 48 Laws of Power",
            author: "Robert Green",
            description:
              "Amoral, cunning, ruthless, and instructive, this multi-million-copy New York Times bestseller is the definitive manual for anyone interested in gaining power.",
            downloads: 450,
            image: "/placeholder.svg?height=100&width=70",
          },
          {
            id: 5,
            title: "Think and Grow Rich",
            author: "Napoleon Hill",
            description: 'This book has been called the "Granddaddy of All Motivational Literature."',
            downloads: 890,
            image: "/placeholder.svg?height=100&width=70",
          },
          {
            id: 6,
            title: "The Lean Startup",
            author: "Eric Ries",
            description:
              "How Today's Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses",
            downloads: 720,
            image: "/placeholder.svg?height=100&width=70",
          },
        ],
      },
      {
        title: "Leadership Essentials",
        books: [
          {
            id: 7,
            title: "Start with Why",
            author: "Simon Sinek",
            description: "How Great Leaders Inspire Everyone to Take Action",
            downloads: 630,
            image: "/placeholder.svg?height=100&width=70",
          },
          {
            id: 8,
            title: "Leaders Eat Last",
            author: "Simon Sinek",
            description: "Why Some Teams Pull Together and Others Don't",
            downloads: 540,
            image: "/placeholder.svg?height=100&width=70",
          },
          {
            id: 9,
            title: "Extreme Ownership",
            author: "Jocko Willink",
            description: "How U.S. Navy SEALs Lead and Win",
            downloads: 820,
            image: "/placeholder.svg?height=100&width=70",
          },
        ],
      },
      {
        title: "Personal Finance",
        books: [
          {
            id: 10,
            title: "The Total Money Makeover",
            author: "Dave Ramsey",
            description: "A Proven Plan for Financial Fitness",
            downloads: 910,
            image: "/placeholder.svg?height=100&width=70",
          },
          {
            id: 11,
            title: "I Will Teach You to Be Rich",
            author: "Ramit Sethi",
            description: "No Guilt. No Excuses. No BS. Just a 6-Week Program That Works",
            downloads: 680,
            image: "/placeholder.svg?height=100&width=70",
          },
          {
            id: 12,
            title: "The Millionaire Next Door",
            author: "Thomas J. Stanley",
            description: "The Surprising Secrets of America's Wealthy",
            downloads: 750,
            image: "/placeholder.svg?height=100&width=70",
          },
        ],
      },
    ],
  },
  biography: {
    title: "Biography",
    description: "Discover the best biography books",
    featuredBooks: [
      {
        id: 1,
        title: "Steve Jobs",
        author: "Walter Isaacson",
        description: "The exclusive biography of Steve Jobs.",
        downloads: 1200,
        image: "/placeholder.svg?height=300&width=200",
      },
      {
        id: 2,
        title: "Becoming",
        author: "Michelle Obama",
        description:
          "In a life filled with meaning and accomplishment, Michelle Obama has emerged as one of the most iconic and compelling women of our era.",
        downloads: 950,
        image: "/placeholder.svg?height=300&width=200",
      },
      {
        id: 3,
        title: "Born a Crime",
        author: "Trevor Noah",
        description:
          "The compelling, inspiring, and comically sublime story of one man's coming-of-age, set during the twilight of apartheid and the tumultuous days of freedom that followed.",
        downloads: 780,
        image: "/placeholder.svg?height=300&width=200",
      },
    ],
    collections: [
      {
        title: "Political Figures",
        books: [
          {
            id: 4,
            title: "A Promised Land",
            author: "Barack Obama",
            description:
              "A riveting, deeply personal account of history in the making—from the president who inspired us to believe in the power of democracy.",
            downloads: 870,
            image: "/placeholder.svg?height=100&width=70",
          },
          {
            id: 5,
            title: "Long Walk to Freedom",
            author: "Nelson Mandela",
            description: "The autobiography of one of the great moral and political leaders of our time.",
            downloads: 920,
            image: "/placeholder.svg?height=100&width=70",
          },
          {
            id: 6,
            title: "The Autobiography of Malcolm X",
            author: "Malcolm X with Alex Haley",
            description:
              "In the searing pages of this classic autobiography, originally published in 1964, Malcolm X, the Muslim leader, firebrand, and anti-integrationist, tells the extraordinary story of his life and the growth of the Black Muslim movement.",
            downloads: 830,
            image: "/placeholder.svg?height=100&width=70",
          },
        ],
      },
      {
        title: "Business Leaders",
        books: [
          {
            id: 7,
            title: "Shoe Dog",
            author: "Phil Knight",
            description: "A Memoir by the Creator of Nike",
            downloads: 760,
            image: "/placeholder.svg?height=100&width=70",
          },
          {
            id: 8,
            title: "Elon Musk",
            author: "Walter Isaacson",
            description: "The biography of the entrepreneur and innovator behind SpaceX, Tesla, and SolarCity.",
            downloads: 890,
            image: "/placeholder.svg?height=100&width=70",
          },
          {
            id: 9,
            title: "The Ride of a Lifetime",
            author: "Robert Iger",
            description: "Lessons Learned from 15 Years as CEO of the Walt Disney Company",
            downloads: 680,
            image: "/placeholder.svg?height=100&width=70",
          },
        ],
      },
    ],
  },
  // Add more categories as needed
}

export function generateMetadata({ params }: Props): Metadata {
  const slug = params.slug
  const category = categories[slug as keyof typeof categories]

  if (!category) {
    return {
      title: "Category Not Found - KIBRA",
    }
  }

  return {
    title: `${category.title} Books - KIBRA`,
    description: category.description,
  }
}

export default function CategoryPage({ params }: Props) {
  const slug = params.slug
  const category = categories[slug as keyof typeof categories]

  if (!category) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p className="mb-4">The category you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/home">Go Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto px-4 pb-8">
      <header className="sticky top-0 bg-white z-10 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">KIBRA</h1>
          <div className="flex items-center gap-2">
            <div className="relative w-full max-w-[200px]">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search"
                className="pl-8 h-9 w-full rounded-full bg-gray-100 border-none"
              />
            </div>
            <UserNav />
          </div>
        </div>

        <div className="mt-4">
          <CategoryList />
        </div>
      </header>

      <div className="flex items-center gap-2 my-4">
        <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
          <Link href="/home">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h2 className="text-xl font-bold">{category.title}</h2>
      </div>

      <main className="space-y-8">
        {/* Featured Books Section - Optimized for mobile */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Featured {category.title} Books</h3>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
            {category.featuredBooks.map((book) => (
              <div key={book.id} className="flex-shrink-0 w-[70%] sm:w-[calc(100%/3-16px)] snap-start">
                <BookCard
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  description={book.description}
                  image={book.image}
                  downloads={book.downloads}
                  variant="featured"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Collections */}
        {category.collections.map((collection, index) => (
          <section key={index}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{collection.title}</h3>
              <Link
                href={`/collection/${slug}-${collection.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-muted-foreground flex items-center"
              >
                More <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {collection.books.map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  description={book.description}
                  image={book.image}
                  downloads={book.downloads}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}

