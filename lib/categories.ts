export type Category = {
  name: string
  title: string
  description: string
  featuredBooks: Array<{
    id: number
    title: string
    author: string
    description: string
    downloads: number
    image: string
  }>
  collections: Array<{
    title: string
    books: Array<{
      id: number
      title: string
      author: string
      description: string
      downloads: number
      image: string
    }>
  }>
}

export const categories: Record<string, Category> = {
  business: {
    name: "Business",
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
    ],
  },
  biography: {
    name: "Biography",
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
} 