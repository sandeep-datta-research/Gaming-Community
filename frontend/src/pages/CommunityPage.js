import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Heart,
  ChatCircle,
  Eye,
  User,
  Clock,
  Funnel,
} from '@phosphor-icons/react';
import { communityAPI } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const categories = [
  { value: '', label: 'All Posts' },
  { value: 'general', label: 'General' },
  { value: 'clips', label: 'Clips & Highlights' },
  { value: 'guides', label: 'Guides & Tips' },
  { value: 'news', label: 'News' },
  { value: 'lfg', label: 'Looking for Group' },
];

export default function CommunityPage() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = selectedCategory ? { category: selectedCategory } : {};
        const res = await communityAPI.getPosts(params);
        setPosts(res.data || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-obsidian pt-20 pb-12" data-testid="community-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl mb-2">COMMUNITY</h1>
            <p className="text-secondary">Share, discuss, and connect with fellow gamers</p>
          </div>
          {isAuthenticated && (
            <Link
              to="/community/create"
              data-testid="create-post-btn"
              className="btn-primary px-6 py-3 inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create Post
            </Link>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-volt text-pure'
                  : 'bg-surface border border-white/10 text-secondary hover:text-pure'
              }`}
              data-testid={`category-${cat.value || 'all'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-surface border border-white/10 p-6 animate-pulse">
                <div className="h-6 bg-surface-elevated w-3/4 mb-3" />
                <div className="h-4 bg-surface-elevated w-full mb-2" />
                <div className="h-4 bg-surface-elevated w-2/3" />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/community/${post.id}`}
                  className="block bg-surface border border-white/10 p-6 card-hover"
                  data-testid={`post-card-${post.id}`}
                >
                  {/* Author & Meta */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-volt/20 flex items-center justify-center border border-white/10">
                      {post.author_avatar ? (
                        <img src={post.author_avatar} alt={post.author_name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={18} className="text-volt" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{post.author_name}</div>
                      <div className="flex items-center gap-2 text-xs text-secondary">
                        <Clock size={12} />
                        <span>
                          {post.created_at 
                            ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
                            : 'Recently'}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs bg-surface-elevated border border-white/10 uppercase">
                      {post.category}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-xl mb-2">{post.title}</h3>
                  <p className="text-secondary text-sm line-clamp-2 mb-4">
                    {post.content}
                  </p>

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-xs text-volt bg-volt/10 px-2 py-1">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-6 pt-4 border-t border-white/10 text-sm text-secondary">
                    <div className="flex items-center gap-2">
                      <Heart size={16} />
                      <span className="font-mono">{post.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChatCircle size={16} />
                      <span className="font-mono">{post.comment_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye size={16} />
                      <span className="font-mono">{post.views || 0}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface border border-white/10">
            <ChatCircle size={64} className="mx-auto mb-4 text-secondary opacity-50" />
            <h3 className="font-display text-xl mb-2">NO POSTS YET</h3>
            <p className="text-secondary mb-6">Be the first to start a conversation!</p>
            {isAuthenticated && (
              <Link to="/community/create" className="btn-primary px-6 py-3 inline-flex items-center gap-2">
                <Plus size={20} />
                Create Post
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
