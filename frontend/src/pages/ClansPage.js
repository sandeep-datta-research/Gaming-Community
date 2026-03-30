import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  MagnifyingGlass,
  GameController,
  UserPlus,
  Crown,
} from '@phosphor-icons/react';
import { clanAPI, gameAPI } from '../services/api';

export default function ClansPage() {
  const [clans, setClans] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    game_slug: '',
    recruiting: '',
    q: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = { ...filters };
        if (params.recruiting !== '') params.recruiting = params.recruiting === 'true';
        else delete params.recruiting;
        
        const [clansRes, gamesRes] = await Promise.all([
          clanAPI.getClans(params),
          gameAPI.getGames(),
        ]);
        setClans(clansRes.data || []);
        setGames(gamesRes.data || []);
      } catch (error) {
        console.error('Error fetching clans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  return (
    <div className="min-h-screen bg-obsidian pt-20 pb-12" data-testid="clans-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl mb-2">CLANS</h1>
            <p className="text-secondary">Find your squad or build your own empire</p>
          </div>
          <Link
            to="/clans/create"
            data-testid="create-clan-btn"
            className="btn-primary px-6 py-3 inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Create Clan
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-surface border border-white/10 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                placeholder="Search clans by name or tag..."
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-obsidian border border-white/20"
                data-testid="clan-search"
              />
            </div>
            <select
              value={filters.game_slug}
              onChange={(e) => setFilters({ ...filters, game_slug: e.target.value })}
              className="px-4 py-2 bg-obsidian border border-white/20"
              data-testid="clan-game-filter"
            >
              <option value="">All Games</option>
              {games.map((game) => (
                <option key={game.slug} value={game.slug}>{game.name}</option>
              ))}
            </select>
            <select
              value={filters.recruiting}
              onChange={(e) => setFilters({ ...filters, recruiting: e.target.value })}
              className="px-4 py-2 bg-obsidian border border-white/20"
              data-testid="clan-recruiting-filter"
            >
              <option value="">All Clans</option>
              <option value="true">Recruiting</option>
              <option value="false">Not Recruiting</option>
            </select>
          </div>
        </div>

        {/* Clans Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-surface border border-white/10 p-6 animate-pulse">
                <div className="h-16 w-16 bg-surface-elevated rounded-full mx-auto mb-4" />
                <div className="h-4 bg-surface-elevated w-3/4 mx-auto mb-2" />
                <div className="h-4 bg-surface-elevated w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : clans.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clans.map((clan, index) => (
              <motion.div
                key={clan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/clans/${clan.id}`}
                  className="block bg-surface border border-white/10 p-6 card-hover"
                  data-testid={`clan-card-${clan.id}`}
                >
                  {/* Clan Logo/Tag */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-volt/20 flex items-center justify-center border border-volt/30">
                      {clan.logo_url ? (
                        <img src={clan.logo_url} alt={clan.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display text-2xl text-volt">{clan.tag}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg truncate">{clan.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-secondary">
                        <GameController size={14} />
                        <span className="truncate">{clan.game_slug?.replace('-', ' ')}</span>
                      </div>
                    </div>
                    {clan.is_recruiting && (
                      <span className="badge badge-upcoming">
                        <UserPlus size={12} className="mr-1" />
                        Open
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {clan.description && (
                    <p className="text-sm text-secondary mb-4 line-clamp-2">
                      {clan.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={16} className="text-secondary" />
                      <span className="font-mono">{clan.member_count} members</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-secondary">
                      <Crown size={16} />
                      <span className="truncate max-w-[100px]">{clan.owner_name}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Users size={64} className="mx-auto mb-4 text-secondary opacity-50" />
            <h3 className="font-display text-xl mb-2">NO CLANS FOUND</h3>
            <p className="text-secondary mb-6">Start your own clan and recruit members!</p>
            <Link to="/clans/create" className="btn-primary px-6 py-3 inline-flex items-center gap-2">
              <Plus size={20} />
              Create Clan
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
