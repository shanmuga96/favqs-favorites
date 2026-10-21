import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { quotesApi } from "../api/quotesApi";
import { FavoriteQuote } from "../types";

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteQuote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch favorites from GET /api/favorites
  const fetchFavorites = useCallback(async (isPullToRefresh = false) => {
    try {
      if (isPullToRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setErrorMessage(null);

      const data = await quotesApi.getFavoriteQuotes();
      setFavorites(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load favorite quotes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Automatically refresh when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [fetchFavorites]),
  );

  // Handle removing a favorite via DELETE /api/favorites/:id
  const handleRemove = async (id: number) => {
    try {
      setDeletingId(id);
      await quotesApi.removeFavorite(id);
      // Update local state after successful server confirmation
      setFavorites((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      const msg = err.message || "Failed to remove favorite quote.";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Error", msg);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const renderItem = ({ item }: { item: FavoriteQuote }) => {
    const isDeleting = deletingId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.contentBox}>
          <Text style={styles.quoteBody}>“{item.body}”</Text>
          <Text style={styles.quoteAuthor}>— {item.author}</Text>
        </View>

        <TouchableOpacity
          style={[styles.unlikeButton, isDeleting && styles.buttonDisabled]}
          onPress={() => handleRemove(item.id)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#dc3545" />
          ) : (
            <Text style={styles.unlikeButtonText}>Remove</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
        <Text style={styles.emptySubtitle}>
          Quotes you like from the "Daily Quote" tab will appear here.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Saved Favorites</Text>

        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {loading && !refreshing ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#e60000" />
            <Text style={styles.loadingText}>Loading saved quotes...</Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            ListEmptyComponent={renderEmptyState}
            refreshing={refreshing}
            onRefresh={() => fetchFavorites(true)}
            contentContainerStyle={
              favorites.length === 0
                ? styles.emptyListContent
                : styles.listContent
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212529",
    textAlign: "center",
    marginVertical: 18,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6c757d",
    fontSize: 15,
  },
  errorBanner: {
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  contentBox: {
    flex: 1,
    marginRight: 12,
  },
  quoteBody: {
    fontSize: 15,
    fontStyle: "italic",
    lineHeight: 22,
    color: "#343a40",
    marginBottom: 6,
  },
  quoteAuthor: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6c757d",
  },
  unlikeButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#fff0f0",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  unlikeButtonText: {
    color: "#dc3545",
    fontSize: 12,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    lineHeight: 20,
  },
});
