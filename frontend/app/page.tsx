'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Users, Clock, Trophy, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTrainers } from '@/hooks/useTrainers';
import { useTestimonials } from '@/hooks/useTestimonials';

export default function HomePage() {
  const { data: trainers, isLoading: trainersLoading } = useTrainers();
  const { data: testimonials, isLoading: testimonialsLoading } = useTestimonials();
  const features = [
    {
      icon: <Dumbbell className="h-8 w-8" />,
      title: 'Modern Equipment',
      description: 'State-of-the-art gym equipment for all your fitness needs',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
      link: '/plans',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Expert Trainers',
      description: 'Certified professionals to guide your fitness journey',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
      link: '/trainers',
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: '24/7 Access',
      description: 'Work out on your schedule, any time of day',
      image: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=400&q=80',
      link: '/contact',
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: 'Results Driven',
      description: 'Proven programs that deliver real results',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80',
      link: '/plans',
    },
  ];


  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1920&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-black/70 dark:bg-black/60" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-bold mb-6 text-white"
          >
            Forge Your{' '}
            <span className="gym-text-gradient inline-block">
              Strength
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-white/90 mb-8"
          >
            Transform your body,elevate your mind, achieve your goals
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/plans">
              <Button size="lg" className="gym-gradient text-lg px-8 hover:scale-105 transition-transform">
                View Plans
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:scale-105 transition-transform">
                Contact Us
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80"
                alt="Gym Equipment"
                className="rounded-lg shadow-2xl"
              />
            </motion.div>
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-4xl font-bold mb-6"
              >
                About IronPulse Gym
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-lg text-muted-foreground mb-4"
              >
                At IronPulse Gym, we believe fitness is more than just physical transformation—it&apos;s a
                journey of self-discovery and empowerment. Our state-of-the-art facility combines
                cutting-edge equipment with expert guidance to help you achieve your fitness goals.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-lg text-muted-foreground"
              >
                Whether you&apos;re a beginner taking your first steps or an athlete pushing your limits,
                we provide the tools, support, and community to help you succeed.
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-12"
          >
            Why Choose IronPulse
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                viewport={{ once: true }}
              >
                <Link href={feature.link} className="block h-full">
                  <Card className="h-full hover:border-primary hover:scale-105 transition-all duration-300 relative overflow-hidden group cursor-pointer">
                    {/* Background Image - More visible */}
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-60 transition-opacity duration-300"
                      style={{ backgroundImage: `url(${feature.image})` }}
                    />
                    {/* Lighter overlay for better image visibility */}
                    <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-background/60 to-background/50 dark:from-background/80 dark:via-background/70 dark:to-background/60" />

                    {/* Animated background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <CardHeader className="relative z-10">
                      <div className="mb-4 text-primary transition-transform group-hover:scale-110 duration-300">
                        {feature.icon}
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trainers Preview Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-4"
            >
              Meet Our Trainers
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-lg text-muted-foreground"
            >
              Expert guidance from certified professionals
            </motion.p>
          </div>

          {trainersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : trainers && trainers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {trainers.slice(0, 3).map((trainer, index) => (
                  <motion.div
                    key={trainer.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.15,
                    }}
                    viewport={{ once: true }}
                  >
                    <Card className="overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 relative group">
                      <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                        <img
                          src={trainer.image}
                          alt={trainer.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                      <CardHeader>
                        <CardTitle>{trainer.name}</CardTitle>
                        <CardDescription>{trainer.specialization}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {trainer.experience} years of experience
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link href="/trainers">
                  <Button variant="outline" size="lg" className="hover:scale-105 transition-transform">
                    View All Trainers
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">No trainers available</p>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-12"
          >
            What Our Members Say
          </motion.h2>

          {testimonialsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : testimonials && testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                  }}
                  viewport={{ once: true }}
                >
                  <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

                    <CardHeader className="relative z-10">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="relative">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < testimonial.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <p className="text-muted-foreground">{testimonial.text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No testimonials available</p>
          )}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-6"
          >
            Ready to Transform?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground mb-8"
          >
            Join IronPulse Gym today and start your fitness journey with expert guidance and
            world-class facilities.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link href="/plans">
              <Button size="lg" className="gym-gradient text-lg px-12 hover:scale-105 transition-transform">
                Get Started Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
