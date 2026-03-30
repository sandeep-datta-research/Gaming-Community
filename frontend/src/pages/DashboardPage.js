import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Trophy,
  Users,
  ChartBar,
  Calendar,
  GameController,
  Plus,
  ArrowRight,
  Target,
  TrendUp,
  Crown,
} from '@phosphor-icons/react';
import { gameAPI, tournamentAPI, clanAPI, userAPI } from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [myClans, setMyClans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesRes, tournamentsRes, clansRes] = await Promise.all([
          gameAPI.getGames(),
          tournamentAPI.getTournaments({ limit: 5 }),
          userAPI.getMyClans().catch(() => ({ data: [] })),
        ]);
        setGames(gamesRes.data || []);
        setTournaments(tournamentsRes.data || []);
        setMyClans(clansRes.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    {
      label: 'Games Tracked',
      value: user?.game_stats?.length || 0,
      icon: GameController,
      color: 'text-volt',
    },
    {
      label: 'Clans Joined',
      value: myClans.length,
      icon: Users,
      color: 'text-success',
    },
    {
      label: 'Tournaments',
      value: 0,
      icon: Trophy,
      color: 'text-warning',
    },
    {
      label: 'Total Wins',
      value: user?.game_stats?.reduce((acc, gs) => acc + (gs.stats?.wins || 0), 0) || 0,
      icon: Crown,
      color: 'text-blaze',
    },
  ];

  return (
    <div className="min-h-screen bg-obsidian pt-20 pb-12" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl mb-2">
            WELCOME BACK, <span className="text-volt">{user?.name?.toUpperCase()}</span>
          </h1>
          <p className="text-secondary">
            Here's your gaming overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface border border-white/10 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <Icon size={24} weight="duotone" className={stat.color} />
                  <TrendUp size={16} className="text-success" />
                </div>
                <div className="font-mono text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs uppercase tracking-wider text-secondary">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Game Stats Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-surface border border-white/10 p-6">
              <h2 className="font-display text-xl mb-4">QUICK ACTIONS</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link
                  to="/tournaments/create"
                  className="flex flex-col items-center gap-2 p-4 bg-obsidian border border-white/10 hover:border-volt transition-colors"
                  data-testid="quick-action-create-tournament"
                >
                  <Trophy size={24} className="text-volt" />
                  <span className="text-xs uppercase tracking-wider">Create Tournament</span>
                </Link>
                <Link
                  to="/clans/create"
                  className="flex flex-col items-center gap-2 p-4 bg-obsidian border border-white/10 hover:border-volt transition-colors"
                  data-testid="quick-action-create-clan"
                >
                  <Users size={24} className="text-volt" />
                  <span className="text-xs uppercase tracking-wider">Create Clan</span>
                </Link>
                <Link
                  to="/profile/edit"
                  className="flex flex-col items-center gap-2 p-4 bg-obsidian border border-white/10 hover:border-volt transition-colors"
                  data-testid="quick-action-add-stats"
                >
                  <ChartBar size={24} className="text-volt" />
                  <span className="text-xs uppercase tracking-wider">Add Stats</span>
                </Link>
                <Link
                  to="/community/create"
                  className="flex flex-col items-center gap-2 p-4 bg-obsidian border border-white/10 hover:border-volt transition-colors"
                  data-testid="quick-action-create-post"
                >
                  <Plus size={24} className="text-volt" />
                  <span className="text-xs uppercase tracking-wider">Create Post</span>
                </Link>
              </div>
            </div>

            {/* Game Stats */}
            <div className="bg-surface border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl">YOUR GAME STATS</h2>
                <Link to="/profile/edit" className="text-volt text-sm hover:underline flex items-center gap-1">
                  Add Game <Plus size={16} />
                </Link>
              </div>

              {user?.game_stats?.length > 0 ? (
                <div className="space-y-4">
                  {user.game_stats.map((gameStat, index) => (
                    <div
                      key={index}
                      className="bg-obsidian border border-white/10 p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <GameController size={32} className="text-volt" />
                        <div>
                          <div className="font-medium">{gameStat.game_name}</div>
                          <div className="text-sm text-secondary">
                            {gameStat.username} • Level {gameStat.level || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg">{gameStat.rank || 'Unranked'}</div>
                        <div className="text-xs text-secondary">
                          {gameStat.stats?.kills || 0} Kills • {gameStat.stats?.wins || 0} Wins
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-secondary">
                  <GameController size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="mb-4">No game stats added yet</p>
                  <Link to="/profile/edit" className="btn-primary px-6 py-2 inline-block">
                    Add Your First Game
                  </Link>
                </div>
              )}
            </div>

            {/* Active Tournaments */}
            <div className="bg-surface border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl">UPCOMING TOURNAMENTS</h2>
                <Link to="/tournaments" className="text-volt text-sm hover:underline flex items-center gap-1">
                  View All <ArrowRight size={16} />
                </Link>
              </div>

              {tournaments.length > 0 ? (
                <div className="space-y-3">
                  {tournaments.slice(0, 3).map((tournament) => (
                    <Link
                      key={tournament.id}
                      to={`/tournaments/${tournament.id}`}
                      className="block bg-obsidian border border-white/10 p-4 hover:border-volt transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium mb-1">{tournament.name}</div>
                          <div className="text-sm text-secondary">
                            {tournament.game_name} • {tournament.registered_teams}/{tournament.max_teams} Teams
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`badge ${
                            tournament.status === 'registration' ? 'badge-upcoming' :
                            tournament.status === 'in_progress' ? 'badge-live' :
                            'badge-completed'
                          }`}>
                            {tournament.status}
                          </span>
                          {tournament.prize_pool > 0 && (
                            <div className="text-sm text-warning mt-1 font-mono">
                              ${tournament.prize_pool}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-secondary">
                  <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No tournaments available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* My Clans */}
            <div className="bg-surface border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl">MY CLANS</h2>
                <Link to="/clans" className="text-volt text-sm hover:underline">
                  Browse
                </Link>
              </div>

              {myClans.length > 0 ? (
                <div className="space-y-3">
                  {myClans.map((clan) => (
                    <Link
                      key={clan.id}
                      to={`/clans/${clan.id}`}
                      className="flex items-center gap-3 p-3 bg-obsidian border border-white/10 hover:border-volt transition-colors"
                    >
                      <div className="w-10 h-10 bg-volt/20 flex items-center justify-center font-display text-volt">
                        {clan.tag}
                      </div>
                      <div>
                        <div className="font-medium">{clan.name}</div>
                        <div className="text-xs text-secondary">
                          {clan.member_count} members
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-secondary">
                  <Users size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm mb-3">You haven't joined any clans</p>
                  <Link to="/clans" className="text-volt text-sm hover:underline">
                    Find a Clan
                  </Link>
                </div>
              )}
            </div>

            {/* Supported Games */}
            <div className="bg-surface border border-white/10 p-6">
              <h2 className="font-display text-xl mb-4">SUPPORTED GAMES</h2>
              <div className="grid grid-cols-2 gap-2">
                {games.slice(0, 6).map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center gap-2 p-3 bg-obsidian border border-white/10"
                  >
                    <GameController size={16} className="text-volt" />
                    <span className="text-sm truncate">{game.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-surface border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl">SCHEDULE</h2>
                <Link to="/schedule" className="text-volt text-sm hover:underline">
                  View All
                </Link>
              </div>
              <div className="text-center py-8 text-secondary">
                <Calendar size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No upcoming events</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
