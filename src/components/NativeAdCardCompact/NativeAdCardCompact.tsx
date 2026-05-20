import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { Image, Pressable, View } from "react-native";
import { NativeAdView, NativeAsset, NativeAssetType } from "react-native-google-mobile-ads";
import { useNativeAd } from "../../services/ads/useNativeAd";
import { scale } from "../../utilities";
import { TextDefault } from "../Text";
import { useStyles } from "./styles";

/**
 * Compact native ad — woven into the Draw screen FlatList.
 *
 * Visually mirrors `DrawCard` — a single dark `headerBackground` container
 * with rounded corners and no pill header. To stay policy-compliant the
 * "Sponsored" attribution is rendered as a coloured pill at the top-left
 * corner of the card, distinct from the body so users can't confuse the ad
 * with a real draw result.
 *
 * Shares its load lifecycle with `NativeAdCard` via `useNativeAd`.
 */
function NativeAdCardCompact(_props: Readonly<NativeAdCardCompactProps>) {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  const nativeAd = useNativeAd();

  if (!nativeAd) return null;

  return (
    <NativeAdView nativeAd={nativeAd} style={styles.drawBox}>
      <View style={styles.boxContainer}>
        <View style={styles.sponsoredPill}>
          <TextDefault small bold textColor={colors.headerBackground}>
            {"Sponsored"}
          </TextDefault>
        </View>

        <View style={styles.row}>
          {nativeAd.icon ? (
            <Image
              source={{ uri: nativeAd.icon.url }}
              style={styles.icon}
              resizeMode="contain"
            />
          ) : null}
          <View style={styles.textColumn}>
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <TextDefault
                bold
                textColor={colors.headerText}
                style={styles.headline}
                numberOfLines={2}
              >
                {nativeAd.headline}
              </TextDefault>
            </NativeAsset>

            {nativeAd.advertiser ? (
              <NativeAsset assetType={NativeAssetType.ADVERTISER}>
                <TextDefault
                  small
                  textColor={colors.fontSecondColor}
                  numberOfLines={1}
                >
                  {nativeAd.advertiser}
                </TextDefault>
              </NativeAsset>
            ) : null}
          </View>
        </View>

        <NativeAsset assetType={NativeAssetType.BODY}>
          <TextDefault
            textColor={colors.headerText}
            style={styles.body}
            numberOfLines={3}
          >
            {nativeAd.body}
          </TextDefault>
        </NativeAsset>

        <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
          <Pressable
            android_ripple={{ color: colors.drawerSelected, foreground: true }}
            style={styles.ctaButton}
          >
            <TextDefault bold textColor={colors.yellow}>
              {nativeAd.callToAction}
            </TextDefault>
            <FontAwesome5 name="chevron-right" size={scale(12)} color={colors.yellow} />
          </Pressable>
        </NativeAsset>
      </View>
    </NativeAdView>
  );
}

export default React.memo(NativeAdCardCompact);
