'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { blogPosts } from '@/lib/data';
import { Clock3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getBlogs, type UiBlogPost } from '@/lib/api';

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

export default function BlogPage() {
  const [posts, setPosts] = useState<UiBlogPost[]>(blogPosts);
  const tags = useMemo(() => ['All', ...Array.from(new Set(posts.map((post) => post.category)))], [posts]);
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    const loadPosts = async () => {
      const apiPosts = await getBlogs();
      if (apiPosts.length > 0) {
        setPosts(apiPosts);
      }
    };

    void loadPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    if (selectedTag === 'All') {
      return posts;
    }

    return posts.filter((post) => post.category === selectedTag);
  }, [selectedTag, posts]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="space-y-6"
            >
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <p className="text-xs md:text-sm font-semibold tracking-widest uppercase text-primary mb-2">Latest Updates</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">Recent Articles</h2>
                </div>
                <p className="text-sm text-muted-foreground">{filteredPosts.length} articles</p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      selectedTag === tag
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-muted'
                    }`}
                    aria-pressed={selectedTag === tag}
                  >
                    {tag}
                  </button>
                ))}
              </motion.div>

              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredPosts.map((post) => (
                  <motion.div key={post.slug} variants={itemVariants}>
                    <Link href={`/blog/${post.slug}`}>
                      <Card className="group h-full border-border overflow-hidden hover:shadow-sm transition-shadow">
                        <div className="relative h-36 md:h-40 overflow-hidden">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <div className="p-4 flex flex-col gap-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <Badge variant="secondary" className="font-medium text-[11px]">
                              {post.category}
                            </Badge>
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock3 className="w-3.5 h-3.5" />
                              {post.readTime}
                            </span>
                          </div>

                          <h3 className="text-base md:text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>

                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                            {post.excerpt}
                          </p>

                          <div className="pt-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{post.author}</span>
                            <span>{post.date}</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {filteredPosts.length === 0 && (
                <motion.div variants={itemVariants} className="text-sm text-muted-foreground rounded-lg border border-dashed border-border p-6 text-center">
                  No articles found for this tag.
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
