import { scale } from "@/src/utilities";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { Image, Pressable, View } from "react-native";
import { NativeAdView, NativeAsset, NativeAssetType } from "react-native-google-mobile-ads";
import { useNativeAd } from "../../services/ads/useNativeAd";
import { TextDefault } from "../Text";
import { useStyles } from "./styles";

/**
 * Native ad woven into the Main FlatList.
 *
 * Visually mirrors `MainCard` — a white "Sponsored" pill header sitting on
 * top of a dark `headerBackground` container, with a pill-shaped CTA at the
 * bottom. The pill header doubles as the policy-required ad attribution
 * (Google requires "Ad" or "Sponsored" prominently displayed on every native
 * placement) — the white-on-dark contrast makes it visually distinct.
 *
 * Load lifecycle + consent / ad-free gating is handled by `useNativeAd`.
 * This component is purely presentational once an ad arrives, and renders
 * `null` while waiting / failed / suppressed.
 */
function NativeAdCard(_props: Readonly<NativeAdCardProps>) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const nativeAd = useNativeAd();

  if (!nativeAd) return null;

  return (
    <NativeAdView nativeAd={nativeAd} style={styles.drawBox}>
      <View style={styles.boxHeader} />

      <View style={styles.boxContainer}>
        <View style={styles.boxInfo}>
          {nativeAd.icon ? (
            <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} resizeMode="contain" />
          ) : null}

          <NativeAsset assetType={NativeAssetType.HEADLINE}>
            <TextDefault H4 bold center textColor={colors.headerText} style={styles.headline} numberOfLines={2}>
              {nativeAd.headline}
            </TextDefault>
          </NativeAsset>

          {nativeAd.advertiser ? (
            <NativeAsset assetType={NativeAssetType.ADVERTISER}>
              <TextDefault small center textColor={colors.fontSecondColor} style={styles.advertiser} numberOfLines={1}>
                {nativeAd.advertiser}
              </TextDefault>
            </NativeAsset>
          ) : null}

          <NativeAsset assetType={NativeAssetType.BODY}>
            <TextDefault textColor={colors.headerText} center style={styles.body} numberOfLines={3}>
              {nativeAd.body}
            </TextDefault>
          </NativeAsset>

          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <Pressable
              android_ripple={{ color: colors.drawerSelected, foreground: true }}
              style={styles.ctaButton}
            >
              <TextDefault textColor={colors.yellow} bold>
                {nativeAd.callToAction}
              </TextDefault>
              <FontAwesome5 name="chevron-right" size={scale(12)} color={colors.yellow} />
            </Pressable>
          </NativeAsset>
        </View>
      </View>
    </NativeAdView>
  );
}

export default React.memo(NativeAdCard);
