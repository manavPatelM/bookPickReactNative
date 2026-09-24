import { View, Text, Alert, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/auth.store'
import { useRouter } from 'expo-router'
import { API_URL } from '@/constants/api-url';
import styles from '../../assets/styles/profile.styles';
import ProfileHeader from '../../components/ProfileHeader';
import LogoutButton from '../../components/LogoutButton';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '@/constants/colors';
import { renderRatingStars } from '../(tabs)/index';
import { formatPublishedDate } from '@/lib/utils';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function Profile() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { user, token } = useAuthStore() as { user: any; token: string | null };

  useEffect(() => {
    if (!user || !token) {
      router.replace("/(auth)");
    }
    fetchUserBooks();
  }, [user, token]);

  const fetchUserBooks = async () => {
    try {
      setLoading(true);
      const userId = user?._id || user?.id;
      const result = await fetch(`${API_URL}/books/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Guard: backend may return HTML for unknown routes
      const contentType = result.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        console.warn('Non-JSON response from /books/user:', result.status);
        return;
      }

      const data = await result.json();
      if (result.ok) {
        setBooks(data.books ?? []);
      } else {
        console.error('Fetch user books failed:', data);
      }

    } catch (error) {
      console.error("Error fetching user books:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await sleep(1000);
    await fetchUserBooks();
    setRefreshing(false);
  }

  const handleDeleteBook = async (bookId: string) => {
    try {
      const response = await fetch(`${API_URL}/books/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setBooks((prevBooks) => prevBooks.filter((book) => book._id !== bookId));
      } else {
        Alert.alert("Error", "Failed to delete the book.");
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      Alert.alert("Error", "An error occurred while deleting the book.");
    }
  };

  const confirmDelete = (bookId: string) => () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this recommendation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteBook(bookId),
        },
      ],
      { cancelable: true }
    );
  }

  const renderBookItem = ({ item }: { item: any }) => (
    <View style={styles.bookItem}>
      <Image
        source={{ uri: item.coverImage || 'https://via.placeholder.com/100x150' }}
        style={styles.bookImage}
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
        </View>
        <Text style={styles.bookCaption}>{item.caption}</Text>
        <Text style={styles.bookDate}>Published on: {formatPublishedDate(item.createdAt)}</Text>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete(item._id)}>
        <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );


  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />

      <View style={styles.booksHeader}>
        <Text style={styles.bookTitle}>My Recommendations</Text>
        <Text style={styles.booksCount}>{books.length} books</Text>
      </View>

      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item._id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.booksList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name='book-outline' size={50} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No recommendations yet.</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push("/create")}>
              <Text style={styles.addButtonText}>Add a Recommendation</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}
