// Fixed import
// import { hm } ... removed
import { getUserSessions } from "@/api/interview";
import { RootState } from "@/redux/store";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useSelector } from "react-redux";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";

type Session = {
  _id: string;
  role: string;
  questionsAsked: number;
  totalQuestions: number;
  isCompleted: boolean;
  feedback?: {
    rating: number;
  } | null;
  createdAt: string;
};

const screenWidth = Dimensions.get("window").width;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AnalyticsScreen() {
  const userId = useSelector((state: RootState) => state.auth.user?._id);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  /* 
     Use useFocusEffect to auto-refresh data when screen is focused. 
     This ensures sync after adding/deleting sessions.
  */

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;

      let isActive = true;

      (async () => {
        try {
          const data = await getUserSessions(userId);
          if (isActive) {
            setSessions(Array.isArray(data) ? data : data.sessions || []);
          }
        } finally {
          if (isActive) setLoading(false);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [userId])
  );

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const completed = sessions.filter((s) => s.isCompleted);
  const inProgress = sessions.filter((s) => !s.isCompleted);

  const avgRating = useMemo(() => {
    const rated = completed.filter((s) => s.feedback?.rating);
    if (!rated.length) return "–";
    return (
      rated.reduce((sum, s) => sum + (s.feedback?.rating || 0), 0) /
      rated.length
    ).toFixed(1);
  }, [completed]);

  const completionRate = sessions.length
    ? Math.round((completed.length / sessions.length) * 100)
    : 0;

  const weeklyRatings = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay() + 1 - weekOffset * 7);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const map: Record<number, number[]> = {};

    sessions.forEach((s) => {
      if (!s.isCompleted || !s.feedback?.rating) return;

      const d = new Date(s.createdAt);
      if (d >= start && d <= end) {
        const index = d.getDay() === 0 ? 6 : d.getDay() - 1;
        if (!map[index]) map[index] = [];
        map[index].push(s.feedback.rating);
      }
    });

    return DAYS.map((_, i) =>
      map[i]
        ? Number(
          (
            map[i].reduce((a, b) => a + b, 0) / map[i].length
          ).toFixed(1)
        )
        : 0
    );
  }, [sessions, weekOffset]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeAnim, paddingBottom: 40 }}>

        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>BETA</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Insights designed to help you grow.</Text>

        {/* STATS GRID */}
        <View style={styles.grid}>
          <StatCard label="Total Sessions" value={sessions.length.toString()} icon="layers-outline" />
          <StatCard label="Completed" value={completed.length.toString()} icon="checkmark-circle-outline" highlight />
        </View>

        <View style={styles.grid}>
          <StatCard label="Avg. Rating" value={avgRating} icon="star-outline" />
          <StatCard label="In Progress" value={inProgress.length.toString()} icon="time-outline" />
        </View>

        {/* CHART SECTION */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Performance Trend</Text>
            <View style={styles.weekNav}>
              <TouchableOpacity onPress={() => setWeekOffset((p) => p + 1)}>
                <Ionicons name="chevron-back" size={20} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.weekText}>
                {weekOffset === 0 ? "This Week" : `${weekOffset}w Ago`}
              </Text>
              <TouchableOpacity
                disabled={weekOffset === 0}
                onPress={() => setWeekOffset((p) => p - 1)}
              >
                <Ionicons name="chevron-forward" size={20} color={weekOffset === 0 ? Colors.grey3 : Colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          <LineChart
            data={{
              labels: DAYS,
              datasets: [{ data: weeklyRatings }],
            }}
            width={screenWidth - 64} // Padding adjustments
            height={220}
            fromZero
            bezier
            yAxisInterval={1}
            chartConfig={chartConfig}
            style={{ borderRadius: 16 }}
          />
        </View>

        {/* PROGRESS CARD */}
        <View style={styles.progressCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.progressTitle}>Completion Rate</Text>
            <Text style={styles.progressSubtitle}>Keep finishing interviews!</Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressValue}>{completionRate}%</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>AI Insights</Text>
        <Insight text="Consistently completing sessions increases your AI rating accuracy." icon="bulb-outline" />
        <Insight text="Try practicing different roles to broaden your communication skills." icon="trending-up-outline" />

      </Animated.View>
    </ScrollView>
  );
}

function StatCard({ label, value, icon, highlight }: { label: string; value: string; icon: any; highlight?: boolean }) {
  return (
    <View style={[styles.card, highlight && styles.highlightCard]}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={20} color={highlight ? Colors.background : Colors.textGray} />
      </View>
      <Text style={[styles.cardValue, highlight && { color: Colors.background }]}>{value}</Text>
      <Text style={[styles.cardLabel, highlight && { color: Colors.background }]}>{label}</Text>
    </View>
  );
}

function Insight({ text, icon }: { text: string, icon: any }) {
  return (
    <View style={styles.insight}>
      <Ionicons name={icon} size={24} color="#FFD700" style={{ marginRight: 12 }} />
      <Text style={styles.insightText}>{text}</Text>
    </View>
  );
}

const chartConfig = {
  backgroundGradientFrom: Colors.primary,
  backgroundGradientTo: Colors.primary,
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: Colors.background,
  },
  fillShadowGradientFrom: Colors.white,
  fillShadowGradientTo: Colors.primary,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.white,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: Colors.border
  },
  badgeText: {
    color: Colors.textGray,
    fontSize: 10,
    fontWeight: 'bold'
  },
  subtitle: {
    color: Colors.textGray,
    marginBottom: 30,
    marginTop: 4,
    fontSize: 16,
  },
  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  highlightCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  cardHeader: {
    marginBottom: 10,
    alignSelf: 'flex-start'
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
  },
  cardLabel: {
    color: Colors.textGray,
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
  chartContainer: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 20
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  weekNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12
  },
  weekText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600'
  },
  progressCard: {
    backgroundColor: "#2563EB", // Brand Blue
    padding: 24,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  progressTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  progressSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  progressValue: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16
  },
  insight: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center'
  },
  insightText: {
    color: Colors.white,
    fontSize: 14,
    lineHeight: 20,
    flex: 1
  },
});
