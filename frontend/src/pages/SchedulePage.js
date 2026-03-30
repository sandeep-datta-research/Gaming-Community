import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Users,
  Trophy,
  Target,
} from '@phosphor-icons/react';
import { scheduleAPI } from '../services/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

export default function SchedulePage() {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await scheduleAPI.getSchedule({});
        setEvents(res.data || []);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [isAuthenticated]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_time);
      return isSameDay(eventDate, date);
    });
  };

  const selectedDayEvents = getEventsForDay(selectedDate);

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'match':
        return <Trophy size={14} className="text-volt" />;
      case 'practice':
        return <Target size={14} className="text-success" />;
      case 'meeting':
        return <Users size={14} className="text-warning" />;
      default:
        return <Clock size={14} className="text-secondary" />;
    }
  };

  return (
    <div className="min-h-screen bg-obsidian pt-20 pb-12" data-testid="schedule-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl mb-2">SCHEDULE</h1>
            <p className="text-secondary">Manage your matches, practices, and events</p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setShowCreateModal(true)}
              data-testid="create-event-btn"
              className="btn-primary px-6 py-3 inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Add Event
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-surface border border-white/10 p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                className="p-2 text-secondary hover:text-pure transition-colors"
              >
                &lt;
              </button>
              <h2 className="font-display text-xl">
                {format(currentDate, 'MMMM yyyy').toUpperCase()}
              </h2>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                className="p-2 text-secondary hover:text-pure transition-colors"
              >
                &gt;
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div key={day} className="text-center text-xs text-secondary py-2 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Padding for first day of month */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square" />
              ))}
              
              {daysInMonth.map((date) => {
                const dayEvents = getEventsForDay(date);
                const isSelected = isSameDay(date, selectedDate);
                const isTodayDate = isToday(date);

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square p-1 flex flex-col items-center justify-start border transition-colors ${
                      isSelected
                        ? 'border-volt bg-volt/10'
                        : isTodayDate
                        ? 'border-blaze bg-blaze/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    data-testid={`calendar-day-${format(date, 'yyyy-MM-dd')}`}
                  >
                    <span className={`text-sm font-mono ${
                      isSelected ? 'text-volt' : isTodayDate ? 'text-blaze' : 'text-pure'
                    }`}>
                      {format(date, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {dayEvents.slice(0, 3).map((_, i) => (
                          <div key={i} className="w-1 h-1 rounded-full bg-volt" />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Events */}
          <div className="bg-surface border border-white/10 p-6">
            <h3 className="font-display text-lg mb-4">
              {format(selectedDate, 'EEEE, MMMM d').toUpperCase()}
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-surface-elevated animate-pulse rounded" />
                ))}
              </div>
            ) : selectedDayEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-obsidian border border-white/10 p-4"
                    data-testid={`event-${event.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-surface flex items-center justify-center border border-white/10">
                        {getEventTypeIcon(event.event_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-sm text-secondary flex items-center gap-2 mt-1">
                          <Clock size={12} />
                          {format(new Date(event.start_time), 'h:mm a')}
                        </div>
                        {event.description && (
                          <p className="text-xs text-muted mt-2 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-secondary">
                <CalendarIcon size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No events scheduled</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Event Modal - Simplified for now */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-surface border border-white/10 p-6 w-full max-w-md mx-4">
            <h2 className="font-display text-xl mb-4">CREATE EVENT</h2>
            <p className="text-secondary text-sm mb-4">Event creation form coming soon...</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="btn-secondary w-full py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
