import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Target,
  Skull,
  GameController,
} from '@phosphor-icons/react';
import { leaderboardAPI, gameAPI } from '../services/api';

export default function LeaderboardsPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState('free-fire');
  const [selectedMetric, setSelectedMetric] = useState('wins');

  const metrics = [
    { value: 'wins', label: 'Wins', icon: Trophy },
    { value: 'kills', label: 'Kills', icon: Skull },
    { value: 'kd_ratio', label: 'K/D Ratio', icon: Target },
  ];

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await gameAPI.getGames();
        setGames(res.data || []);
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };
    fetchGames();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await leaderboardAPI.getLeaderboard(selectedGame, selectedMetric);
        setLeaderboard(res.data || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [selectedGame, selectedMetric]);

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-warning bg-warning/10 border-warning/30';
    if (rank === 2) return 'text-secondary bg-secondary/10 border-secondary/30';
    if (rank === 3) return 'text-amber-600 bg-amber-600/10 border-amber-600/30';
    return 'text-muted bg-surface border-white/10';
  };

  const getRankIcon = (rank) => {
    if (rank <= 3) return <Medal size={20} weight="fill" />;
    return <span className="font-mono">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-obsidian pt-20 pb-12" data-testid="leaderboards-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl mb-2">LEADERBOARDS</h1>
          <p className="text-secondary">See who's dominating the competition</p>
        </div>

        {/* Filters */}
        <div className="bg-surface border border-white/10 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Game Selection */}
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="flex-1 px-4 py-3 bg-obsidian border border-white/20"
              data-testid="leaderboard-game-select"
            >
              {games.map((game) => (
                <option key={game.slug} value={game.slug}>{game.name}</option>
              ))}
            </select>

            {/* Metric Tabs */}
            <div className="flex bg-obsidian border border-white/20">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <button
                    key={metric.value}
                    onClick={() => setSelectedMetric(metric.value)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                      selectedMetric === metric.value
                        ? 'bg-volt text-pure'
                        : 'text-secondary hover:text-pure'
                    }`}
                    data-testid={`leaderboard-metric-${metric.value}`}
                  >
                    <Icon size={16} />
                    {metric.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-surface border border-white/10 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-surface-elevated animate-pulse rounded" />
              ))}
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="divide-y divide-white/10">
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.user_id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`flex items-center gap-4 p-4 ${
                    entry.rank <= 3 ? 'bg-surface-elevated' : ''
                  }`}
                  data-testid={`leaderboard-entry-${entry.rank}`}
                >
                  {/* Rank */}
                  <div className={`w-10 h-10 flex items-center justify-center border ${getRankColor(entry.rank)}`}>
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Player Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-volt/20 flex items-center justify-center border border-white/10">
                      {entry.avatar ? (
                        <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" />
                      ) : (
                        <GameController size={20} className="text-volt" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{entry.name}</div>
                      <div className="text-sm text-secondary truncate">@{entry.username}</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="font-mono text-xl font-bold">
                      {typeof entry.value === 'number' 
                        ? entry.value.toLocaleString() 
                        : entry.value}
                    </div>
                    <div className="text-xs text-secondary uppercase tracking-wider">
                      {selectedMetric.replace('_', ' ')}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Trophy size={64} className="mx-auto mb-4 text-secondary opacity-50" />
              <h3 className="font-display text-xl mb-2">NO DATA YET</h3>
              <p className="text-secondary">
                Add your game stats to appear on the leaderboard!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
