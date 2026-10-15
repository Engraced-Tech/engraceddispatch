# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# WebView JavaScript Interface Keep Rules
# Paystack uses inline Javascript callback handlers inside the WebView.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface
-keepattributes *Annotation*

# Preserve the line number information for debugging stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Room Database Keep Rules
-keep class * extends androidx.room.RoomDatabase
-dontwarn androidx.room.paging.**
-keep class com.esdispatch.data.** { *; }

# Moshi Serialization & JSON Parsing Keep Rules
-keep class com.esdispatch.data.Models** { *; }
-keep class com.esdispatch.data.AIModels** { *; }
-keep class * {
    @com.squareup.moshi.Json <fields>;
}
-keep class * {
    @com.squareup.moshi.JsonClass <fields>;
}

# Retrofit / OkHttp Rules
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }
-keepattributes Signature, InnerClasses, EnclosingMethod
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

# Firebase & Google Play Services Keep Rules (Auth, Firestore, Messaging, Location)
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Coil Image Loader Keep Rules
-dontwarn coil.**
-keep class coil.** { *; }

# Kotlin Coroutines Keep Rules
-dontwarn kotlinx.coroutines.**
-keep class kotlinx.coroutines.** { *; }

# Google Crypto Tink & Security
-dontwarn com.google.api.client.**
-dontwarn com.google.crypto.tink.**
-dontwarn org.joda.time.**
-keep class androidx.security.crypto.** { *; }
-keep class com.google.crypto.tink.** { *; }

# Navigation
-keep class androidx.navigation.** { *; }

# M1 remediation: the blanket keep-all rule that disabled obfuscation for the
# entire app package is removed. Only reflection-sensitive model/data classes
# and serialization annotations are preserved (see rules above); the rest of
# the app code is now obfuscated and shrunk by R8.

