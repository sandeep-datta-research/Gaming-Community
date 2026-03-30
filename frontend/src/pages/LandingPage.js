import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Users,
  ChartLineUp,
  ChatCircle,
  GameController,
  Lightning,
  Target,
  Crown,
} from '@phosphor-icons/react';

const features = [
  {
    icon: ChartLineUp,
    title: 'Track Your Stats',
    description: 'Monitor your gaming performance across multiple games with detailed statistics and analytics.',
  },
  {
    icon: Trophy,
    title: 'Join Tournaments',
    description: 'Compete in esports tournaments, climb the brackets, and win prizes.',
  },
  {
    icon: Users,
    title: 'Build Your Clan',
    description: 'Create or join clans, manage your team, and schedule practice sessions.',
  },
  {
    icon: ChatCircle,
    title: 'Connect',
    description: 'Join a thriving community of gamers, share clips, and discuss strategies.',
  },
];

const games = [
  { name: 'Free Fire', slug: 'free-fire' },
  { name: 'PUBG Mobile', slug: 'pubg-mobile' },
  { name: 'Call of Duty Mobile', slug: 'cod-mobile' },
  { name: 'Mobile Legends', slug: 'mobile-legends' },
  { name: 'Valorant', slug: 'valorant' },
  { name: 'Fortnite', slug: 'fortnite' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-obsidian">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1767455471543-055dbc6c6700?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwzfHxlc3BvcnRzJTIwYXJlbmF8ZW58MHx8fHwxNzc0ODMzMDgyfDA&ixlib=rb-4.1.0&q=85"
            alt="Esports Arena"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/70 via-obsidian/50 to-obsidian" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-volt/20 border border-volt/30 rounded-sm">
                <Lightning size={16} weight="fill" className="text-volt" />
                <span className="text-sm font-medium text-volt uppercase tracking-wider">
                  The Ultimate Gaming Platform
                </span>
              </div>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tight mb-6">
              DOMINATE THE
              <br />
              <span className="gradient-text">COMPETITION</span>
            </h1>
            
            <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10">
              Track stats, join tournaments, build your clan, and connect with gamers worldwide.
              Your gaming journey starts here.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                data-testid="hero-cta-button"
                className="btn-primary px-8 py-4 text-lg rounded-sm inline-flex items-center justify-center gap-2"
              >
                <GameController size={24} weight="duotone" />
                Get Started Free
              </Link>
              <Link
                to="/tournaments"
                data-testid="hero-tournaments-button"
                className="btn-secondary px-8 py-4 text-lg rounded-sm inline-flex items-center justify-center gap-2"
              >
                <Trophy size={24} />
                View Tournaments
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl mb-4">
              SUPPORTED GAMES
            </h2>
            <p className="text-secondary">
              Track your stats and compete in tournaments for these popular titles
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {games.map((game, index) => (
              <motion.div
                key={game.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface border border-white/10 p-6 text-center card-hover cursor-pointer"
              >
                <GameController size={32} className="text-volt mx-auto mb-3" />
                <span className="text-sm font-medium">{game.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface border-t border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl mb-4">
              EVERYTHING YOU NEED TO
              <br />
              <span className="text-volt">LEVEL UP</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-obsidian border border-white/10 p-6 card-hover"
                >
                  <div className="w-12 h-12 bg-volt/10 flex items-center justify-center mb-4">
                    <Icon size={24} weight="duotone" className="text-volt" />
                  </div>
                  <h3 className="font-display text-xl mb-2">{feature.title}</h3>
                  <p className="text-secondary text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '50K+', label: 'Active Players' },
              { value: '500+', label: 'Tournaments' },
              { value: '1,000+', label: 'Active Clans' },
              { value: '$100K+', label: 'Prize Pool' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="stat-value font-mono">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-volt/20 to-blaze/20" />
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/5445632/pexels-photo-5445632.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')] bg-cover bg-center opacity-10" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Crown size={48} weight="duotone" className="text-warning mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-5xl mb-6">
            READY TO PROVE
            <br />
            <span className="text-volt">YOU'RE THE BEST?</span>
          </h2>
          <p className="text-secondary text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of gamers who are already tracking their progress,
            competing in tournaments, and climbing the leaderboards.
          </p>
          <Link
            to="/register"
            data-testid="cta-register-button"
            className="btn-primary px-10 py-4 text-lg rounded-sm inline-flex items-center gap-2"
          >
            <Target size={24} />
            Join Now - It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <GameController size={24} weight="duotone" className="text-volt" />
              <span className="font-display text-xl">GAMEVERSE</span>
            </div>
            <div className="flex gap-6 text-sm text-secondary">
              <Link to="/about" className="hover:text-pure transition-colors">About</Link>
              <Link to="/terms" className="hover:text-pure transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-pure transition-colors">Privacy</Link>
              <Link to="/contact" className="hover:text-pure transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-muted">
              © 2025 GameVerse. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
