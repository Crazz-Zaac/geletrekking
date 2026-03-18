'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { blogPosts } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getBlogBySlug, getBlogs, type UiBlogPost } from '@/lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const [post, setPost] = useState<UiBlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<UiBlogPost[]>([]);

  useEffect(() => {
    if (!slug) return;

    const loadPost = async () => {
      try {
        const fallbackPost = blogPosts.find((item) => item.slug === slug) || null;
        const [apiPost, apiPosts] = await Promise.all([getBlogBySlug(slug), getBlogs()]);

        setPost(apiPost || fallbackPost);
        setAllPosts(apiPosts.length > 0 ? apiPosts : blogPosts);
      } catch (error) {
        const fallbackPost = blogPosts.find((item) => item.slug === slug) || null;
        setPost(fallbackPost);
        setAllPosts(blogPosts);
      }
    };

    void loadPost();
  }, [slug]);

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-foreground">Post not found</h1>
            <Link href="/blog">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Back to Blog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const relatedPosts = useMemo(() => {
    if (!post || !allPosts.length) return [];
    return allPosts
      .filter((item) => item.category === post.category && item.slug !== post.slug)
      .slice(0, 3);
  }, [allPosts, post]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-96 md:h-[500px] overflow-hidden"
        >
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="container mx-auto space-y-4"
            >
              <motion.div variants={itemVariants}>
                <Badge className="bg-primary text-white">{post.category}</Badge>
              </motion.div>
              <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-balance">
                {post.title}
              </motion.h1>
            </motion.div>
          </div>
        </motion.section>

        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-12"
          >
            {/* Main Content */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              {/* Meta Info */}
              <div className="mb-8 pb-8 border-b border-border">
                <p className="text-muted-foreground">
                  By <span className="font-semibold text-foreground">{post.author}</span> • {post.date}
                </p>
              </div>

              {/* Excerpt */}
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                {post.excerpt}
              </p>

              {/* Content */}
              <div className="prose prose-invert max-w-none mb-12">
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  {post.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Back Link */}
              <Link href="/blog">
                <Button variant="outline" className="border-primary text-primary">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Button>
              </Link>
            </motion.div>

            {/* Sidebar */}
            <motion.div variants={itemVariants} className="lg:col-span-1 h-fit sticky top-20">
              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.slug}
                        href={`/blog/${relatedPost.slug}`}
                        className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors group"
                      >
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                          {relatedPost.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">{relatedPost.date}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
