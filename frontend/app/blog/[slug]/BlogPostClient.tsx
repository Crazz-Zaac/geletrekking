'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useState } from 'react';
import type { UiBlogPost } from '@/lib/api';
import { marked } from 'marked';

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

interface BlogPostClientProps {
  post: UiBlogPost;
  allPosts: UiBlogPost[];
}

export default function BlogPostClient({ post, allPosts }: BlogPostClientProps) {
  const [renderedContent, setRenderedContent] = useState('');

  useEffect(() => {
    let isActive = true;

    Promise.resolve(marked.parse(post.content || '')).then((html) => {
      if (isActive) {
        setRenderedContent(html);
      }
    });

    return () => {
      isActive = false;
    };
  }, [post.content]);

  const relatedPosts = useMemo(() => {
    return allPosts
      .filter((item) => item.category === post.category && item.slug !== post.slug)
      .slice(0, 3);
  }, [allPosts, post.category, post.slug]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-72 md:h-[300px] overflow-hidden"
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
            className="grid grid-cols-1 lg:grid-cols-5 gap-8"
          >
            <motion.div variants={itemVariants} className="lg:col-span-4">
              <div className="mb-8 pb-8 border-b border-border">
                <p className="text-muted-foreground">
                  By <span className="font-semibold text-foreground">{post.author}</span> • {post.date}
                </p>
              </div>

              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                {post.excerpt}
              </p>

              <div className="prose prose-invert max-w-none mb-12">
                <div 
                  className="space-y-4 text-lg text-muted-foreground leading-relaxed prose-headings:text-foreground prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-4 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-strong:text-foreground prose-strong:font-semibold prose-em:text-foreground prose-em:italic prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded prose-a:text-primary prose-a:hover:underline prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-2"
                  dangerouslySetInnerHTML={{ __html: renderedContent }} 
                />
              </div>

              <Link href="/blog">
                <Button variant="outline" className="border-primary text-primary">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-1 h-fit sticky top-20">
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
