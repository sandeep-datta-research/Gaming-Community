import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Plus,
  MagnifyingGlass,
  Funnel,
  Users,
  Calendar,
  CurrencyDollar,
  GameController,
} from '@phosphor-icons/react';
import { tournamentAPI, gameAPI } from '../services/api';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    game_slug: '',
    search: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentsRes, gamesRes] = await Promise.all([
          tournamentAPI.getTournaments(filters),
          gameAPI.getGames(),
        ]);
        setTournaments(tournamentsRes.data || []);
        setGames(gamesRes.data || []);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'registration', label: 'Registration Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-obsidian pt-20 pb-12" data-testid="tournaments-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl mb-2">TOURNAMENTS</h1>
            <p className="text-secondary">Compete, win prizes, and prove your skills</p>
          </div>
          <Link
            to="/tournaments/create"
            data-testid="create-tournament-btn"
            className="btn-primary px-6 py-3 inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Create Tournament
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-surface border border-white/10 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-obsidian border border-white/20"
                data-testid="tournament-search"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 bg-obsidian border border-white/20"
              data-testid="tournament-status-filter"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={filters.game_slug}
              onChange={(e) => setFilters({ ...filters, game_slug: e.target.value })}
              className="px-4 py-2 bg-obsidian border border-white/20"
              data-testid="tournament-game-filter"
            >
              <option value="">All Games</option>
              {games.map((game) => (
                <option key={game.slug} value={game.slug}>{game.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tournaments Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-surface border border-white/10 p-6 animate-pulse">
                <div className="h-32 bg-surface-elevated mb-4" />
                <div className="h-4 bg-surface-elevated w-3/4 mb-2" />
                <div className="h-4 bg-surface-elevated w-1/2" />
              </div>
            ))}
          </div>
        ) : tournaments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament, index) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/tournaments/${tournament.id}`}
                  className="block bg-surface border border-white/10 overflow-hidden card-hover"
                  data-testid={`tournament-card-${tournament.id}`}
                >
                  {/* Banner */}
                  <div className="h-32 bg-gradient-to-br from-volt/20 to-blaze/20 relative">
                    {tournament.banner_url && (
                      <img src={tournament.banner_url} alt={tournament.name} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`badge ${
                        tournament.status === 'registration' ? 'badge-upcoming' :
                        tournament.status === 'in_progress' ? 'badge-live' :
                        'badge-completed'
                      }`}>
                        {tournament.status === 'registration' ? 'Open' :
                         tournament.status === 'in_progress' ? 'Live' :
                         tournament.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-display text-lg mb-2 truncate">{tournament.name}</h3>
                    
                    <div className="flex items-center gap-2 text-sm text-secondary mb-3">
                      <GameController size={16} />
                      <span>{tournament.game_name}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center py-3 border-t border-white/10">
                      <div>
                        <div className="flex items-center justify-center gap-1 text-xs text-secondary mb-1">
                          <Users size={12} />
                          <span>Teams</span>
                        </div>
                        <div className="font-mono text-sm">
                          {tournament.registered_teams}/{tournament.max_teams}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-xs text-secondary mb-1">
                          <Users size={12} />
                          <span>Size</span>
                        </div>
                        <div className="font-mono text-sm">{tournament.team_size}v{tournament.team_size}</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-xs text-secondary mb-1">
                          <CurrencyDollar size={12} />
                          <span>Prize</span>
                        </div>
                        <div className="font-mono text-sm text-warning">
                          ${tournament.prize_pool || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Trophy size={64} className="mx-auto mb-4 text-secondary opacity-50" />
            <h3 className="font-display text-xl mb-2">NO TOURNAMENTS FOUND</h3>
            <p className="text-secondary mb-6">Be the first to create one!</p>
            <Link to="/tournaments/create" className="btn-primary px-6 py-3 inline-flex items-center gap-2">
              <Plus size={20} />
              Create Tournament
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
