import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  User,
  GameController,
  Trophy,
  Users,
  Calendar,
  MapPin,
  Globe,
  At,
  Pencil,
  TwitchLogo,
  YoutubeLogo,
  TwitterLogo,
  DiscordLogo,
} from '@phosphor-icons/react';
import { userAPI } from '../services/api';

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser && (
    currentUser.id === userId || 
    currentUser.username === userId
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userAPI.getProfile(userId);
        setProfile(res.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 animate-pulse">
          <div className="h-48 bg-surface-elevated mb-4" />
          <div className="h-8 bg-surface-elevated w-1/3 mb-2" />
          <div className="h-4 bg-surface-elevated w-1/4" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-obsidian pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <User size={64} className="mx-auto mb-4 text-secondary opacity-50" />
          <h2 className="font-display text-2xl mb-2">USER NOT FOUND</h2>
          <Link to="/dashboard" className="text-volt hover:underline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const socialLinks = [
    { key: 'twitch', icon: TwitchLogo, color: 'text-purple-400' },
    { key: 'youtube', icon: YoutubeLogo, color: 'text-red-500' },
    { key: 'twitter', icon: TwitterLogo, color: 'text-blue-400' },
    { key: 'discord', icon: DiscordLogo, color: 'text-indigo-400' },
  ];

  return (
    <div className="min-h-screen bg-obsidian pt-20 pb-12" data-testid="profile-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner & Avatar */}
        <div className="relative mb-20">
          <div className="h-48 md:h-64 bg-gradient-to-br from-volt/30 to-blaze/30 relative">
            {profile.profile?.banner_url && (
              <img 
                src={profile.profile.banner_url} 
                alt="Banner" 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Avatar */}
          <div className="absolute -bottom-16 left-6 md:left-8">
            <div className="w-32 h-32 bg-surface border-4 border-obsidian flex items-center justify-center">
              {profile.profile?.avatar_url ? (
                <img 
                  src={profile.profile.avatar_url} 
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={48} className="text-secondary" />
              )}
            </div>
          </div>

          {/* Edit Button */}
          {isOwnProfile && (
            <Link
              to="/profile/edit"
              className="absolute top-4 right-4 btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2"
              data-testid="edit-profile-btn"
            >
              <Pencil size={16} />
              Edit Profile
            </Link>
          )}
        </div>

        {/* Profile Info */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-display text-3xl mb-1">{profile.name}</h1>
              <div className="flex items-center gap-2 text-secondary">
                <At size={16} />
                <span>{profile.username}</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`badge ${profile.role === 'admin' ? 'badge-live' : 'badge-upcoming'}`}>
                {profile.role}
              </span>
            </div>
          </div>

          {profile.profile?.bio && (
            <p className="text-secondary mb-4 max-w-2xl">{profile.profile.bio}</p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm text-secondary mb-4">
            {profile.profile?.country && (
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{profile.profile.country}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-3">
            {socialLinks.map(({ key, icon: Icon, color }) => {
              const link = profile.profile?.social_links?.[key] || profile.profile?.streaming_links?.[key];
              if (!link) return null;
              return (
                <a
                  key={key}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 bg-surface border border-white/10 flex items-center justify-center hover:border-white/30 transition-colors ${color}`}
                >
                  <Icon size={20} weight="fill" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Games', value: profile.game_stats?.length || 0, icon: GameController },
            { label: 'Tournaments', value: 0, icon: Trophy },
            { label: 'Clans', value: 0, icon: Users },
            { label: 'Achievements', value: profile.achievements?.length || 0, icon: Trophy },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface border border-white/10 p-4 text-center"
              >
                <Icon size={24} className="text-volt mx-auto mb-2" />
                <div className="font-mono text-2xl font-bold">{stat.value}</div>
                <div className="text-xs uppercase tracking-wider text-secondary">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Game Stats */}
        <div className="bg-surface border border-white/10 p-6 mb-8">
          <h2 className="font-display text-xl mb-4">GAME STATS</h2>
          
          {profile.game_stats?.length > 0 ? (
            <div className="space-y-4">
              {profile.game_stats.map((gameStat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-obsidian border border-white/10 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <GameController size={24} className="text-volt" />
                      <div>
                        <div className="font-medium">{gameStat.game_name}</div>
                        <div className="text-sm text-secondary">
                          {gameStat.username} • Level {gameStat.level || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-lg text-volt">{gameStat.rank || 'Unranked'}</div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  {gameStat.stats && Object.keys(gameStat.stats).length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-4 pt-3 border-t border-white/10">
                      {Object.entries(gameStat.stats).slice(0, 5).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="font-mono text-lg">{value}</div>
                          <div className="text-xs text-secondary uppercase">{key.replace('_', ' ')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-secondary">
              <GameController size={48} className="mx-auto mb-4 opacity-50" />
              <p className="mb-4">No game stats added yet</p>
              {isOwnProfile && (
                <Link to="/profile/edit" className="btn-primary px-6 py-2 inline-block">
                  Add Game Stats
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
