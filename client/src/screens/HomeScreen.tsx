import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { quotesApi } from "../api/quotesApi";
import { Quote } from "../types";

export default function HomeScreen() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<String | null>(null);

  const fetchQuote = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setFeedbackMessage(null);
      const data = await quotesApi.getQuoteOfTheDay();
      setQuote(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load quote of the day");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const handleLike = async () => {
    if (!quote || saving) return;

    try {
      setSaving(true);
      setFeedbackMessage(null);
      await quotesApi.saveFavorite({
        id: quote.id,
        body: quote.body,
        author: quote.author,
      });
      setFeedbackMessage("Added to your favorites !");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to add it to favorites");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Quote of the Day</Text>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#e60000" />
            <Text style={styles.loadingText}>Fetching inspiration...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.centerBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={fetchQuote}
            >
              <Text style={styles.secondaryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : quote ? (
          <View style={styles.card}>
            <Text style={styles.quoteBody}>“{quote.body}”</Text>
            <Text style={styles.quoteAuthor}>— {quote.author}</Text>

            {feedbackMessage && (
              <View style={styles.feedbackBanner}>
                <Text style={styles.feedbackText}>{feedbackMessage}</Text>
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.primaryButton, saving && styles.buttonDisabled]}
                onPress={handleLike}
                disabled={saving}
              >
                <Text style={styles.primaryButtonText}>
                  {saving ? "Saving..." : "Like Quote"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={fetchQuote}
                disabled={saving}
              >
                <Text style={styles.secondaryButtonText}>New Quote</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
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
    padding: 20,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212529",
    textAlign: "center",
    marginBottom: 24,
  },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: "#6c757d",
    fontSize: 15,
  },
  errorText: {
    color: "#dc3545",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quoteBody: {
    fontSize: 18,
    fontStyle: "italic",
    lineHeight: 26,
    color: "#2b2d42",
    marginBottom: 16,
  },
  quoteAuthor: {
    fontSize: 15,
    fontWeight: "600",
    color: "#495057",
    textAlign: "right",
    marginBottom: 24,
  },
  feedbackBanner: {
    backgroundColor: "#e8f5e9",
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
    alignItems: "center",
  },
  feedbackText: {
    color: "#2e7d32",
    fontSize: 14,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#e60000", // Clean red accent
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#e9ecef",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#495057",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
