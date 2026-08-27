import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Instagram,
  Linkedin,
  Twitter,
  Clock
} from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader } from '../layout/PageHeader';
import { Button } from '../ui/Button';

interface PostCalendarProps {
  onScheduleDate: (dateStr: string) => void;
}

export const PostCalendar: React.FC<PostCalendarProps> = ({ onScheduleDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await api.getPosts();
      setPosts(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ dayNumber: null, dateStr: null });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ dayNumber: i, dateStr: dStr });
  }

  const getPostsForDate = (dateStr: string | null) => {
    if (!dateStr) return [];
    return posts.filter((p) => {
      const pDate = p.scheduledAt || p.publishedAt;
      if (!pDate) return false;
      return pDate.startsWith(dateStr);
    });
  };

  const isToday = (dayNumber: number | null) => {
    if (!dayNumber) return false;
    const now = new Date();
    return now.getFullYear() === year && now.getMonth() === month && now.getDate() === dayNumber;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        breadcrumb="Publishing"
        title="Content Publishing Calendar"
        subtitle="Visual monthly distribution matrix across Instagram, LinkedIn, and X/Twitter."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={prevMonth}
                className="p-1 rounded hover:bg-white text-slate-600 transition-colors shadow-xs"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-0.5 rounded text-xs font-semibold text-slate-700 hover:bg-white transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1 rounded hover:bg-white text-slate-600 transition-colors shadow-xs"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        }
      />

      {/* Calendar Card Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">
            {monthNames[month]} {year}
          </h2>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Published
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Scheduled
            </span>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((item, idx) => {
            if (!item.dayNumber) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="h-24 rounded-lg bg-slate-50/60 border border-slate-100/70 opacity-40 pointer-events-none"
                />
              );
            }

            const dayPosts = getPostsForDate(item.dateStr);
            const currentIsToday = isToday(item.dayNumber);

            return (
              <div
                key={`day-${item.dayNumber}`}
                onClick={() => item.dateStr && onScheduleDate(item.dateStr)}
                className={`h-24 rounded-lg border p-1.5 flex flex-col justify-between cursor-pointer transition-all duration-150 group ${
                  currentIsToday
                    ? 'bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-500/20'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentIsToday
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-700 group-hover:text-indigo-600'
                    }`}
                  >
                    {item.dayNumber}
                  </span>

                  <Plus className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Day Posts */}
                <div className="space-y-1 overflow-y-auto max-h-14">
                  {dayPosts.map((post) => {
                    const isPub = post.status === 'PUBLISHED';
                    return (
                      <div
                        key={post.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border ${
                          isPub
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                        title={post.content}
                      >
                        {post.content}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
