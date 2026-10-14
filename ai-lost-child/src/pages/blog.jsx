import BlogCard from '../components/BlogCard'

const blogs = [
  {
    title: 'How AI Helps Find Lost Children',
    description: 'Community-first tools that combine CCTV, MTCNN face detection, and FaceNet to track missing kids faster.',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    tag: 'Impact',
  },
  {
    title: 'Understanding Face Detection',
    description: 'A playful breakdown of bounding boxes and how MTCNN finds faces quickly and reliably.',
    image:
      'https://images.unsplash.com/photo-1535303311164-664fc9ec6532?auto=format&fit=crop&w=800&q=80',
    tag: 'Vision',
  },
  {
    title: 'Face Recognition Technologies Explained',
    description: 'FaceNet embeddings keep matches reliable and ethical.',
    image:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=800&q=80',
    tag: 'Biometrics',
  },
  {
    title: 'Why Real-Time CCTV Analysis Matters',
    description: 'From malls to metro stations, see why 0.4 second insights save precious time.',
    image:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    tag: 'Realtime',
  },
]

const BlogPage = () => (
  <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16">
    <header className="space-y-4">
      <span className="accent-pill bg-white/10 text-white/70">Blog</span>
      <h1 className="text-4xl font-semibold text-white">Stories + breakdowns</h1>
      <p className="max-w-2xl text-white/65">
        Light, Gen-Z friendly explainers about MTCNN, FaceNet, and the social impact of this project.
      </p>
    </header>

    <div className="grid gap-6 md:grid-cols-2">
      {blogs.map((post) => (
        <BlogCard key={post.title} {...post} />
      ))}
    </div>
  </div>
)

export default BlogPage

