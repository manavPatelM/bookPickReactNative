import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import styles from "@/assets/styles/home.styles";
import { API_URL } from "@/constants/api-url";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { formatPublishedDate } from "../../lib/utils";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i + 1 <= rating ? "star" : "star-outline"}
        size={16}
        color={i + 1 <= rating ? "#f4b400" : COLORS.textSecondary}
        style={{ marginRight: 2 }}
      />
    ));
  };

export default function Home() {
  const { token } = useAuthStore() as { token: string | null };

  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchBooks = useCallback(
    async (pageNumber = 1, refresh = false) => {
      if (!token) return;

      try {
        if (refresh) setRefreshing(true);
        else setLoading(true); // 🔧 FIX: lock loading for all pages

        const response = await fetch(
          `${API_URL}/books?page=${pageNumber}&limit=5`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setBooks(prev =>
            refresh || pageNumber === 1
              ? data.books
              : [
                  ...prev,
                  ...data.books.filter(
                    (b: any) => !prev.some(p => p._id === b._id)
                  ),
                ]
          );

          setHasMore(data.books.length > 0); // 🔧 FIX
          setPage(pageNumber + 1);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  // Initial load
  useEffect(() => {
    fetchBooks(1, true);
  }, [fetchBooks]);

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await sleep(500);
      fetchBooks(page);
    }
  };

  

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.user.profileImage }} style={styles.avatar} />
          <Text style={styles.username}>{item.user.userName}</Text>
        </View>
      </View>

      <View style={styles.bookImageContainer}>
        <Image source={{ uri: item.coverImage }} style={styles.bookImage} />
      </View>

      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
        </View>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>
          {formatPublishedDate(item.createdAt)}
        </Text>
      </View>
    </View>
  );

  // Initial loading screen
  if (loading && page === 1) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size={30} color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={() => fetchBooks(1, true)}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>BookPick</Text>
            <Text style={styles.headerSubtitle}>
              Discover Book Recommendations
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore && books.length > 0 ? (
            <ActivityIndicator
              style={styles.footerLoader}
              size="small"
              color={COLORS.primary}
            />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={64}
              color={COLORS.placeholderText}
            />
            <Text style={styles.emptyText}>No recommendations yet.</Text>
            <Text style={styles.emptySubtext}>
              Be the first to share your favorite books!
            </Text>
          </View>
        }
      />
    </View>
  );
}
