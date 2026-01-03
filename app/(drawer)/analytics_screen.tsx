import { getUserSessions } from "@/api/interview";
import { RootState } from "@/redux/store";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const translateAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const data = await getUserSessions(userId);
        setSessions(Array.isArray(data) ? data : data.sessions || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
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

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: completionRate,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [completionRate]);

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
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: translateAnim }],
        }}
      >
        <Text style={styles.title}>Interview Analytics</Text>
        <Text style={styles.subtitle}>
          Track progress • Build confidence • Improve faster
        </Text>

        <View style={styles.row}>
          <StatCard label="Total" value={sessions.length} />
          <StatCard label="Completed" value={completed.length} />
        </View>

        <View style={styles.row}>
          <StatCard label="In Progress" value={inProgress.length} />
          <StatCard label="Avg Rating" value={avgRating} />
        </View>

        <View style={styles.chartHeader}>
          <Text style={styles.sectionTitle}>Weekly Rating Trend</Text>
          <View style={styles.weekNav}>
            <TouchableOpacity onPress={() => setWeekOffset((p) => p + 1)}>
              <Text style={styles.navBtn}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.weekText}>
              {weekOffset === 0 ? "This Week" : `${weekOffset} Week Ago`}
            </Text>
            <TouchableOpacity
              disabled={weekOffset === 0}
              onPress={() => setWeekOffset((p) => p - 1)}
            >
              <Text
                style={[
                  styles.navBtn,
                  weekOffset === 0 && { opacity: 0.3 },
                ]}
              >
                ▶
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.chartWrapper}>
          <LineChart
            data={{
              labels: DAYS,
              datasets: [{ data: weeklyRatings }],
            }}
            width={screenWidth - 56}
            height={240}
            fromZero
            bezier
            chartConfig={chartConfig}
            style={{ borderRadius: 8 }}
          />
        </View>

        <Text style={styles.sectionTitle}>Completion Momentum</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>Completion Rate</Text>
            <Text style={styles.progressPercent}>{completionRate}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>AI Insights</Text>
        <Insight text="Consistency improves dramatically after multiple attempts." />
        <Insight text="Finishing interviews strongly impacts overall ratings." />
        <Insight text="Repeating the same role increases confidence and flow." />
      </Animated.View>
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

function Insight({ text }: { text: string }) {
  return (
    <View style={styles.insight}>
      <Text style={styles.insightText}>• {text}</Text>
    </View>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 1,
  color: () => "#6366f1",
  labelColor: () => "#374151",
  propsForDots: {
    r: "5",
    strokeWidth: "2",
    stroke: "#6366f1",
  },
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  subtitle: {
    color: "#64748b",
    marginBottom: 28,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
  },
  card: {
    flex: 1,
    padding: 20,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    elevation: 3,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0f172a",
  },
  cardLabel: {
    color: "#64748b",
    marginTop: 6,
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 32,
    marginBottom: 14,
    color: "#0f172a",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weekNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  navBtn: {
    fontSize: 18,
    fontWeight: "800",
    color: "#6366f1",
  },
  weekText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  chartWrapper: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    elevation: 3,
  },
  progressCard: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  progressText: {
    fontWeight: "600",
    color: "#475569",
  },
  progressPercent: {
    fontWeight: "800",
    color: "#0f172a",
  },
  progressBarBg: {
    height: 12,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#6366f1",
  },
  insight: {
    backgroundColor: "#eef2ff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  insightText: {
    color: "#1e3a8a",
    fontSize: 14,
  },
});
