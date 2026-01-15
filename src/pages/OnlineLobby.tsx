import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Users, LogOut, Copy, Check, ArrowRight, Loader2, UserPlus, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const OnlineLobby = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [roomCode, setRoomCode] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          navigate('/auth?mode=online');
        } else {
          setUser(session.user);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/auth?mode=online');
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
        fetchFriends(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    setProfile(data);
  };

  const fetchFriends = async (userId: string) => {
    const { data } = await supabase
      .from('friends')
      .select(`
        *,
        friend:profiles!friends_friend_id_fkey(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted');
    setFriends(data || []);
  };

  const handleCreateRoom = async () => {
    if (!user) return;
    
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { error } = await supabase.from('game_rooms').insert({
      room_code: code,
      host_id: user.id,
    });

    if (error) {
      toast({
        title: 'خطأ',
        description: 'فشل إنشاء الغرفة',
        variant: 'destructive',
      });
      return;
    }

    setCreatedRoomCode(code);
    toast({
      title: 'تم إنشاء الغرفة',
      description: `كود الغرفة: ${code}`,
    });
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim() || !user) return;

    const { data: room, error } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .eq('status', 'waiting')
      .single();

    if (error || !room) {
      toast({
        title: 'خطأ',
        description: 'الغرفة غير موجودة أو ممتلئة',
        variant: 'destructive',
      });
      return;
    }

    const { error: joinError } = await supabase.from('room_players').insert({
      room_id: room.id,
      user_id: user.id,
    });

    if (joinError) {
      toast({
        title: 'خطأ',
        description: 'فشل الانضمام للغرفة',
        variant: 'destructive',
      });
      return;
    }

    navigate(`/game?room=${room.id}&mode=online`);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(createdRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearchFriends = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${searchQuery}%`)
      .neq('user_id', user?.id)
      .limit(10);
    
    setSearchResults(data || []);
    setSearching(false);
  };

  const handleSendFriendRequest = async (friendUserId: string) => {
    if (!user) return;

    const { error } = await supabase.from('friends').insert({
      user_id: user.id,
      friend_id: friendUserId,
    });

    if (error) {
      if (error.code === '23505') {
        toast({
          title: 'تنبيه',
          description: 'طلب الصداقة مرسل بالفعل',
        });
      } else {
        toast({
          title: 'خطأ',
          description: 'فشل إرسال طلب الصداقة',
          variant: 'destructive',
        });
      }
      return;
    }

    toast({
      title: 'تم',
      description: 'تم إرسال طلب الصداقة',
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden relative px-4 py-6">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-between mb-8"
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-gold hover:text-gold/80 gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          رجوع
        </Button>

        <div className="flex items-center gap-4">
          <span className="text-foreground">{profile?.username || 'لاعب'}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-bold text-gold text-center mb-8"
        >
          اللعب أونلاين
        </motion.h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create/Join Room */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-neon" />
              غرف اللعب
            </h2>

            {/* Create Room */}
            <div className="mb-6">
              <Button
                onClick={handleCreateRoom}
                className="w-full h-12 text-lg bg-neon hover:bg-neon/80 text-background gap-2"
              >
                <Plus className="w-5 h-5" />
                إنشاء غرفة جديدة
              </Button>

              {createdRoomCode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-neon/10 border border-neon/30 rounded-xl"
                >
                  <p className="text-sm text-muted-foreground mb-2">كود الغرفة:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-2xl font-mono text-neon text-center">
                      {createdRoomCode}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleCopyCode}
                      className="text-neon"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Join Room */}
            <div>
              <p className="text-muted-foreground mb-2">أو انضم لغرفة:</p>
              <div className="flex gap-2">
                <Input
                  placeholder="أدخل كود الغرفة"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-background/50 border-border text-center font-mono text-lg"
                  maxLength={6}
                />
                <Button
                  onClick={handleJoinRoom}
                  disabled={!roomCode.trim()}
                  className="bg-gold hover:bg-gold/80 text-background"
                >
                  انضم
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Play vs Computer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 md:col-span-2 lg:col-span-1"
          >
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              ضد الكمبيوتر
            </h2>

            <p className="text-muted-foreground text-sm mb-6">
              تدرب على مهاراتك في مباراة ضد الذكاء الاصطناعي
            </p>

            <Button
              onClick={() => navigate('/game', { 
                state: { 
                  mode: 'vs-computer',
                  playerCount: 2,
                  playerNames: [profile?.username || 'أنت', 'الكمبيوتر'],
                  teamMode: false
                } 
              })}
              className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white gap-2"
            >
              <Bot className="w-5 h-5" />
              العب ضد الكمبيوتر
            </Button>
          </motion.div>

          {/* Friends */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-gold" />
              الأصدقاء
            </h2>

            {/* Search Friends */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="ابحث عن صديق..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchFriends()}
                className="flex-1 bg-background/50 border-border text-right"
              />
              <Button
                onClick={handleSearchFriends}
                disabled={searching}
                variant="outline"
                className="border-gold text-gold"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-4 p-3 bg-background/30 rounded-lg space-y-2">
                <p className="text-xs text-muted-foreground">نتائج البحث:</p>
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-2 bg-card/50 rounded-lg"
                  >
                    <span className="text-foreground">{result.username}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSendFriendRequest(result.user_id)}
                      className="text-gold"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Friends List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {friends.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-4">
                  لا يوجد أصدقاء بعد
                </p>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-3 bg-background/30 rounded-lg"
                  >
                    <span className="text-foreground">{friend.friend?.username || 'صديق'}</span>
                    <Button
                      size="sm"
                      className="bg-neon/20 text-neon hover:bg-neon/30"
                    >
                      دعوة للعب
                    </Button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-card/30 backdrop-blur-sm border border-border rounded-xl p-4 flex justify-center gap-8"
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-gold">{profile.games_played || 0}</p>
              <p className="text-sm text-muted-foreground">مباريات</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-neon">{profile.games_won || 0}</p>
              <p className="text-sm text-muted-foreground">انتصارات</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {profile.games_played ? Math.round((profile.games_won / profile.games_played) * 100) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">نسبة الفوز</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OnlineLobby;
